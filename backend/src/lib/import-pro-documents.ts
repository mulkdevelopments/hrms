import { prisma } from "./prisma.js";
import { Prisma } from "@prisma/client";
import { parseExcelDate, pickString } from "./employee-fields.js";

const IMPORT_NOTE_PREFIX = "Imported from Excel";

type CachedProDocument = {
  id: string;
  employeeId: string;
  docType: string;
  documentNumber: string | null;
  notes: string | null;
};

export type ProDocumentIndex = Map<string, CachedProDocument[]>;

export async function buildProDocumentIndex(): Promise<ProDocumentIndex> {
  const docs = await prisma.employeeDocument.findMany({
    select: { id: true, employeeId: true, docType: true, documentNumber: true, notes: true },
  });
  const index: ProDocumentIndex = new Map();
  for (const doc of docs) {
    const list = index.get(doc.employeeId) ?? [];
    list.push(doc);
    index.set(doc.employeeId, list);
  }
  return index;
}

function findCachedProDocument(index: ProDocumentIndex, employeeId: string, spec: ImportDocSpec) {
  const docs = index.get(employeeId) ?? [];
  if (spec.documentNumber) {
    const byNumber = docs.find(
      (doc) => doc.docType === spec.docType && doc.documentNumber === spec.documentNumber,
    );
    if (byNumber) return byNumber;
  }
  return docs.find(
    (doc) => doc.docType === spec.docType
      && (doc.notes?.startsWith(IMPORT_NOTE_PREFIX) ?? false),
  );
}

function rememberCachedProDocument(
  index: ProDocumentIndex,
  employeeId: string,
  doc: CachedProDocument,
) {
  const list = index.get(employeeId) ?? [];
  const existingIdx = list.findIndex((item) => item.id === doc.id);
  if (existingIdx >= 0) list[existingIdx] = doc;
  else list.push(doc);
  index.set(employeeId, list);
}

type ImportDocSpec = {
  docType: "PASSPORT" | "RESIDENCE_VISA" | "EMIRATES_ID" | "LABOUR_PERMIT";
  documentNumber?: string;
  expiryDate?: Date | null;
  issuingAuthority?: string;
  notes?: string;
};

export function sanitizeImportExpiryDate(date: Date | null): Date | null {
  if (!date) return null;
  const year = date.getFullYear();
  if (year < 1990 || year > 2100) return null;
  return date;
}

function buildProDocSpecs(mapped: Record<string, unknown>): ImportDocSpec[] {
  const specs: ImportDocSpec[] = [];
  const passport = pickString(mapped.passportNumber);
  if (passport) {
    specs.push({ docType: "PASSPORT", documentNumber: passport });
  }

  const emiratesId = pickString(mapped.emiratesId);
  const visaExpiry = sanitizeImportExpiryDate(parseExcelDate(mapped.visaEmiratesExpiry));
  const labourExpiry = sanitizeImportExpiryDate(parseExcelDate(mapped.labourCardExpiry));
  const visaType = pickString(mapped.visaType);
  const visaStatus = pickString(mapped.visaStatus);
  const visaSponsor = pickString(mapped.visaSponsor);
  const personCode = pickString(mapped.personCode);
  const labourCard = pickString(mapped.labourCardNumber) ?? pickString(mapped.visaFileNumber);

  if (emiratesId || visaExpiry) {
    specs.push({
      docType: "EMIRATES_ID",
      documentNumber: emiratesId,
      expiryDate: visaExpiry,
    });
  }

  if (visaExpiry || visaType || visaStatus || visaSponsor) {
    const visaNotes = [
      visaType ? `Type: ${visaType}` : "",
      visaStatus ? `Status: ${visaStatus}` : "",
    ].filter(Boolean).join(" | ");
    specs.push({
      docType: "RESIDENCE_VISA",
      expiryDate: visaExpiry,
      issuingAuthority: visaSponsor,
      notes: visaNotes || undefined,
    });
  }

  if (labourCard || labourExpiry || personCode) {
    specs.push({
      docType: "LABOUR_PERMIT",
      documentNumber: labourCard,
      expiryDate: labourExpiry ?? undefined,
      notes: personCode ? `Person code: ${personCode}` : undefined,
    });
  }

  return specs.filter((spec) => spec.documentNumber || spec.expiryDate || spec.notes || spec.issuingAuthority);
}

async function upsertImportedProDocument(
  employeeId: string,
  spec: ImportDocSpec,
  documentIndex?: ProDocumentIndex,
) {
  const notes = spec.notes ? `${IMPORT_NOTE_PREFIX} — ${spec.notes}` : IMPORT_NOTE_PREFIX;
  const data = {
    documentNumber: spec.documentNumber ?? null,
    issuingAuthority: spec.issuingAuthority ?? null,
    expiryDate: spec.expiryDate ?? null,
    notes,
  };

  const cached = documentIndex ? findCachedProDocument(documentIndex, employeeId, spec) : null;
  if (cached) {
    await prisma.employeeDocument.update({ where: { id: cached.id }, data });
    if (documentIndex) {
      rememberCachedProDocument(documentIndex, employeeId, {
        ...cached,
        documentNumber: data.documentNumber,
        notes: data.notes,
      });
    }
    return "updated" as const;
  }

  if (!documentIndex) {
    const orClauses: Prisma.EmployeeDocumentWhereInput[] = [
      { notes: { startsWith: IMPORT_NOTE_PREFIX }, fileUrl: null },
    ];
    if (spec.documentNumber) {
      orClauses.unshift({ documentNumber: spec.documentNumber });
    }

    const existing = await prisma.employeeDocument.findFirst({
      where: {
        employeeId,
        docType: spec.docType,
        OR: orClauses,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      await prisma.employeeDocument.update({ where: { id: existing.id }, data });
      return "updated" as const;
    }
  }

  const created = await prisma.employeeDocument.create({
    data: {
      employeeId,
      docType: spec.docType,
      fileUrl: null,
      ...data,
    },
    select: { id: true, employeeId: true, docType: true, documentNumber: true, notes: true },
  });
  if (documentIndex) rememberCachedProDocument(documentIndex, employeeId, created);
  return "created" as const;
}

export async function syncProDocumentsFromImport(
  employeeId: string,
  mapped: Record<string, unknown>,
  documentIndex?: ProDocumentIndex,
): Promise<{ created: number; updated: number }> {
  const specs = buildProDocSpecs(mapped);
  let created = 0;
  let updated = 0;

  for (const spec of specs) {
    const outcome = await upsertImportedProDocument(employeeId, spec, documentIndex);
    if (outcome === "created") created += 1;
    else updated += 1;
  }

  return { created, updated };
}
