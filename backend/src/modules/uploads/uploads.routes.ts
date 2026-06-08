import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
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
});

uploadsRouter.post("/", async (req: AuthRequest, res) => {
  const payload = uploadSchema.parse(req.body);
  if (!ALLOWED_MIME.includes(payload.mimeType.toLowerCase())) {
    return res.status(400).json({ message: "Only PDF, JPG and PNG files are allowed" });
  }
  // Strip a data URL prefix if present.
  const base64 = payload.dataBase64.includes(",")
    ? payload.dataBase64.slice(payload.dataBase64.indexOf(",") + 1)
    : payload.dataBase64;
  const sizeBytes = Math.floor((base64.length * 3) / 4);
  if (sizeBytes > MAX_SIZE_BYTES) {
    return res.status(400).json({ message: "File exceeds the 5 MB limit" });
  }

  const attachment = await prisma.attachment.create({
    data: {
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      sizeBytes,
      data: base64,
      category: payload.category,
      uploadedById: req.auth?.employeeId ?? null,
    },
    select: { id: true, fileName: true, mimeType: true, sizeBytes: true },
  });

  return res.status(201).json({
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    url: `/api/uploads/${attachment.id}`,
  });
});

uploadsRouter.get("/:id", async (req: AuthRequest, res) => {
  const attachment = await prisma.attachment.findUnique({ where: { id: String(req.params.id) } });
  if (!attachment) {
    return res.status(404).json({ message: "File not found" });
  }
  const buffer = Buffer.from(attachment.data, "base64");
  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${attachment.fileName.replace(/"/g, "")}"`);
  res.setHeader("Content-Length", String(buffer.length));
  return res.send(buffer);
});
