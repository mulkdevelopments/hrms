import crypto from "node:crypto";
import { prisma } from "./prisma.js";

export type PasswordResetPurpose = "RESET_PASSWORD" | "SET_PASSWORD";

const TOKEN_TTL_MS = 15 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateResetCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function createPasswordResetToken(employeeId: string, purpose: PasswordResetPurpose) {
  const code = generateResetCode();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.updateMany({
    where: {
      employeeId,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      employeeId,
      purpose,
      tokenHash: hashToken(code),
      expiresAt,
    },
  });

  return { code, expiresAt };
}

export async function verifyPasswordResetCode(
  employeeId: string,
  code: string,
  purpose: PasswordResetPurpose,
): Promise<boolean> {
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      employeeId,
      purpose,
      tokenHash: hashToken(code),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  return Boolean(token);
}

export async function consumePasswordResetCode(
  employeeId: string,
  code: string,
  purpose: PasswordResetPurpose,
): Promise<boolean> {
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      employeeId,
      purpose,
      tokenHash: hashToken(code),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return false;

  await prisma.passwordResetToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });
  return true;
}
