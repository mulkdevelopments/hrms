import { del, get, put } from "@vercel/blob";
import type { Response } from "express";
import { env } from "../config/env.js";

function blobAccess() {
  return env.BLOB_ACCESS;
}

function blobToken() {
  return env.BLOB_READ_WRITE_TOKEN;
}

function sanitizeSegment(value: string, fallback = "unknown") {
  const cleaned = value.trim().replace(/[^\w.\-() ]+/g, "_").replace(/\s+/g, "_");
  return cleaned || fallback;
}

function sanitizeFileName(fileName: string) {
  return sanitizeSegment(fileName, "document");
}

export async function uploadPrivateBlob(params: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  category: string;
  attachmentId: string;
  employeeCode?: string | null;
  documentType?: string | null;
}) {
  const employeeSegment = sanitizeSegment(params.employeeCode ?? "unknown");
  const docTypeSegment = params.documentType ? `${sanitizeSegment(params.documentType)}-` : "";
  const pathname = `hrms/${params.category.toLowerCase()}/${employeeSegment}/${params.attachmentId}-${docTypeSegment}${sanitizeFileName(params.fileName)}`;
  const blob = await put(pathname, params.buffer, {
    access: blobAccess(),
    contentType: params.mimeType,
    token: blobToken(),
    addRandomSuffix: false,
  });

  return {
    blobUrl: blob.url,
    blobPathname: blob.pathname,
    sizeBytes: params.buffer.length,
  };
}

export async function deletePrivateBlob(blobUrl?: string | null) {
  if (!blobUrl) return;
  try {
    await del(blobUrl, { token: blobToken() });
  } catch {
    // Ignore cleanup failures for orphaned metadata rows.
  }
}

export async function streamPrivateBlobToResponse(params: {
  blobPathname?: string | null;
  blobUrl?: string | null;
  fileName: string;
  mimeType: string;
  res: Response;
}) {
  const target = params.blobPathname ?? params.blobUrl;
  if (!target) {
    return false;
  }

  const result = await get(target, {
    access: blobAccess(),
    token: blobToken(),
  });

  if (!result?.stream) {
    return false;
  }

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());

  params.res.setHeader("Content-Type", params.mimeType);
  params.res.setHeader("Content-Disposition", contentDispositionInline(params.fileName));
  params.res.setHeader("Content-Length", String(buffer.length));
  params.res.send(buffer);
  return true;
}

export function contentDispositionInline(fileName: string) {
  const trimmed = fileName.trim().replace(/"/g, "") || "document";
  const asciiFallback = trimmed.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(trimmed);
  return `inline; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
