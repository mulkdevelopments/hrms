import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import {
  contentDispositionInline,
  deletePrivateBlob,
  streamPrivateBlobToResponse,
  uploadPrivateBlob,
} from "../../lib/blob-storage.js";
import { env } from "../../config/env.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

export const uploadsRouter = Router();
uploadsRouter.use(authMiddleware);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  dataBase64: z.string().min(1),
  category: z.string().optional().default("GENERAL"),
  employeeId: z.string().optional(),
  employeeName: z.string().max(255).optional(),
  employeeCode: z.string().max(64).optional(),
  documentType: z.string().max(128).optional(),
  contextLabel: z.string().max(512).optional(),
});

function buildContextLabel(params: {
  category: string;
  documentType?: string | null;
  employeeCode?: string | null;
  employeeName?: string | null;
  fileName: string;
}) {
  const parts = [params.category, params.documentType, params.employeeCode, params.employeeName].filter(Boolean);
  return parts.join(" · ") || params.fileName;
}

uploadsRouter.post("/", async (req: AuthRequest, res) => {
  const payload = uploadSchema.parse(req.body);
  if (!ALLOWED_MIME.includes(payload.mimeType.toLowerCase())) {
    return res.status(400).json({ message: "Only PDF, JPG and PNG files are allowed" });
  }

  const base64 = payload.dataBase64.includes(",")
    ? payload.dataBase64.slice(payload.dataBase64.indexOf(",") + 1)
    : payload.dataBase64;
  const sizeBytes = Math.floor((base64.length * 3) / 4);
  if (sizeBytes > MAX_SIZE_BYTES) {
    return res.status(400).json({ message: "File exceeds the 5 MB limit" });
  }

  const buffer = Buffer.from(base64, "base64");

  let employeeName = payload.employeeName?.trim() || null;
  let employeeCode = payload.employeeCode?.trim() || null;
  const employeeId = payload.employeeId?.trim() || null;
  if (employeeId && (!employeeName || !employeeCode)) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true, employeeCode: true },
    });
    if (employee) {
      employeeName = employeeName ?? `${employee.firstName} ${employee.lastName}`.trim();
      employeeCode = employeeCode ?? employee.employeeCode;
    }
  }

  const documentType = payload.documentType?.trim() || null;
  const contextLabel =
    payload.contextLabel?.trim() ||
    buildContextLabel({
      category: payload.category,
      documentType,
      employeeCode,
      employeeName,
      fileName: payload.fileName,
    });

  const draft = await prisma.attachment.create({
    data: {
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      sizeBytes: buffer.length,
      category: payload.category,
      employeeId,
      employeeName,
      employeeCode,
      documentType,
      contextLabel,
      uploadedById: req.auth?.employeeId ?? null,
    },
    select: { id: true },
  });

  try {
    const blob = await uploadPrivateBlob({
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      buffer,
      category: payload.category,
      attachmentId: draft.id,
      employeeCode,
      documentType,
    });

    const attachment = await prisma.attachment.update({
      where: { id: draft.id },
      data: {
        blobUrl: blob.blobUrl,
        blobPathname: blob.blobPathname,
        sizeBytes: blob.sizeBytes,
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        contextLabel: true,
        employeeCode: true,
        documentType: true,
      },
    });

    return res.status(201).json({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      contextLabel: attachment.contextLabel,
      employeeCode: attachment.employeeCode,
      documentType: attachment.documentType,
      url: `/api/uploads/${attachment.id}`,
    });
  } catch (error) {
    await prisma.attachment.delete({ where: { id: draft.id } }).catch(() => undefined);
    throw error;
  }
});

function attachmentOpenPayload(attachment: {
  id: string;
  fileName: string;
  mimeType: string;
  blobUrl: string | null;
  blobPathname: string | null;
  data: string | null;
  category?: string;
  employeeId?: string | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  documentType?: string | null;
  contextLabel?: string | null;
  createdAt?: Date;
}) {
  const metadata = {
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    category: attachment.category ?? null,
    employeeId: attachment.employeeId ?? null,
    employeeName: attachment.employeeName ?? null,
    employeeCode: attachment.employeeCode ?? null,
    documentType: attachment.documentType ?? null,
    contextLabel: attachment.contextLabel ?? null,
    blobPathname: attachment.blobPathname ?? null,
    createdAt: attachment.createdAt?.toISOString?.() ?? null,
  };

  if (attachment.blobUrl && env.BLOB_ACCESS === "public") {
    return {
      mode: "redirect" as const,
      openUrl: attachment.blobUrl,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      metadata,
    };
  }

  return {
    mode: "proxy" as const,
    openUrl: `/api/uploads/${attachment.id}`,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    metadata,
  };
}

uploadsRouter.get("/:id/open", async (req: AuthRequest, res) => {
  const attachment = await prisma.attachment.findUnique({ where: { id: String(req.params.id) } });
  if (!attachment) {
    return res.status(404).json({ message: "File not found" });
  }

  return res.json(attachmentOpenPayload(attachment));
});

uploadsRouter.get("/:id", async (req: AuthRequest, res) => {
  const attachment = await prisma.attachment.findUnique({ where: { id: String(req.params.id) } });
  if (!attachment) {
    return res.status(404).json({ message: "File not found" });
  }

  if (attachment.blobPathname || attachment.blobUrl) {
    const streamed = await streamPrivateBlobToResponse({
      blobPathname: attachment.blobPathname,
      blobUrl: attachment.blobUrl,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      res,
    });
    if (streamed) {
      return undefined;
    }
    return res.status(404).json({ message: "File not found in blob storage" });
  }

  if (!attachment.data) {
    return res.status(404).json({ message: "File not found" });
  }

  const buffer = Buffer.from(attachment.data, "base64");
  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader("Content-Disposition", contentDispositionInline(attachment.fileName));
  res.setHeader("Content-Length", String(buffer.length));
  return res.send(buffer);
});

uploadsRouter.delete("/:id", async (req: AuthRequest, res) => {
  const attachment = await prisma.attachment.findUnique({ where: { id: String(req.params.id) } });
  if (!attachment) {
    return res.status(404).json({ message: "File not found" });
  }

  await deletePrivateBlob(attachment.blobUrl);
  await prisma.attachment.delete({ where: { id: attachment.id } });
  return res.status(204).send();
});
