import { Router } from "express";
import { z } from "zod";
import { importEmployeesFromWorkbook, importLeaveFromWorkbook } from "../../lib/excel-import.js";
import { importProDataFromWorkbook } from "../../lib/pro-excel-import.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

export const importRouter = Router();
importRouter.use(authMiddleware);

const fileSchema = z.object({
  fileName: z.string().min(1),
  dataBase64: z.string().min(1),
  sheetName: z.string().optional(),
  includeSeparated: z.boolean().optional(),
  includeCompanySheets: z.boolean().optional(),
  sheetNames: z.array(z.string()).optional(),
});

function decodeWorkbook(dataBase64: string) {
  const base64 = dataBase64.includes(",")
    ? dataBase64.slice(dataBase64.indexOf(",") + 1)
    : dataBase64;
  return Buffer.from(base64, "base64");
}

function writeImportStreamLine(res: import("express").Response, payload: unknown) {
  res.write(`${JSON.stringify(payload)}\n`);
}

async function streamImport(
  res: import("express").Response,
  run: (onProgress: (progress: {
    processed: number;
    total: number;
    phase?: "parsing" | "importing" | "managers";
    sheetName?: string;
  }) => void) => Promise<{ created: number; updated: number; skipped: number; errors: { row: number; message: string }[] }>,
  completeMessage: string,
) {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const result = await run((progress) => {
      writeImportStreamLine(res, { type: "progress", ...progress });
    });
    writeImportStreamLine(res, { type: "complete", message: completeMessage, ...result });
    res.end();
  } catch (error) {
    writeImportStreamLine(res, {
      type: "error",
      message: error instanceof Error ? error.message : "Import failed",
    });
    res.end();
  }
}

importRouter.post("/employees", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = fileSchema.parse(req.body);
  if (!payload.fileName.toLowerCase().endsWith(".xlsx") && !payload.fileName.toLowerCase().endsWith(".xls")) {
    return res.status(400).json({ message: "Only Excel files (.xlsx, .xls) are supported" });
  }

  const buffer = decodeWorkbook(payload.dataBase64);
  await streamImport(
    res,
    (onProgress) => importEmployeesFromWorkbook(buffer, {
      sheetNames: payload.sheetNames,
      separated: payload.includeSeparated ?? false,
      onProgress,
    }),
    "Employee import completed",
  );
});

importRouter.post("/leave", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = fileSchema.parse(req.body);
  if (!payload.fileName.toLowerCase().endsWith(".xlsx") && !payload.fileName.toLowerCase().endsWith(".xls")) {
    return res.status(400).json({ message: "Only Excel files (.xlsx, .xls) are supported" });
  }

  const buffer = decodeWorkbook(payload.dataBase64);
  await streamImport(
    res,
    (onProgress) => importLeaveFromWorkbook(buffer, payload.sheetName, { onProgress }),
    "Leave import completed",
  );
});

importRouter.post("/pro", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER", "PRO"), async (req: AuthRequest, res) => {
  const payload = fileSchema.parse(req.body);
  if (!payload.fileName.toLowerCase().endsWith(".xlsx") && !payload.fileName.toLowerCase().endsWith(".xls")) {
    return res.status(400).json({ message: "Only Excel files (.xlsx, .xls) are supported" });
  }

  const buffer = decodeWorkbook(payload.dataBase64);
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const result = await importProDataFromWorkbook(buffer, {
      includeCompanySheets: payload.includeCompanySheets ?? false,
      onProgress: (progress) => {
        writeImportStreamLine(res, { type: "progress", phase: "importing", ...progress });
      },
    });
    writeImportStreamLine(res, { type: "complete", message: "PRO data import completed", ...result });
    res.end();
  } catch (error) {
    writeImportStreamLine(res, {
      type: "error",
      message: error instanceof Error ? error.message : "PRO import failed",
    });
    res.end();
  }
});
