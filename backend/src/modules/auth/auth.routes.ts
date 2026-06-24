import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { Employee } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { applyEmploymentStatusToEmployee } from "../../lib/employment-status.js";
import { sendPasswordEmail } from "../../lib/email.js";
import {
  consumePasswordResetCode,
  createPasswordResetToken,
  type PasswordResetPurpose,
} from "../../lib/password-reset.js";
import { env } from "../../config/env.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

const emailSchema = z.object({
  email: z.string().email(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8),
});

async function findLoginEmployee(email: string) {
  const normalized = email.toLowerCase();
  return prisma.employee.findFirst({
    where: {
      OR: [{ email: normalized }, { loginEmail: normalized }],
    },
  });
}

function loginEmailFor(employee: { email: string; loginEmail: string | null }) {
  return employee.loginEmail ?? employee.email;
}

function issueAuthToken(employee: { id: string; role: string }) {
  return jwt.sign(
    {
      userId: employee.id,
      role: employee.role,
      employeeId: employee.id,
    },
    env.JWT_SECRET,
    { expiresIn: "10h" },
  );
}

function authUserPayload(employee: Employee) {
  const normalizedEmployee = applyEmploymentStatusToEmployee(employee);
  return {
    id: normalizedEmployee.id,
    email: normalizedEmployee.loginEmail ?? normalizedEmployee.email,
    role: normalizedEmployee.role,
    employee: normalizedEmployee,
  };
}

export const authRouter = Router();

authRouter.post("/account-status", async (req, res) => {
  const { email } = emailSchema.parse(req.body);
  const employee = await findLoginEmployee(email);

  if (!employee) {
    return res.json({ status: "not_found" });
  }
  if (!employee.accessEnabled) {
    return res.json({ status: "disabled" });
  }
  if (!employee.passwordHash) {
    return res.json({ status: "setup_required", email: loginEmailFor(employee) });
  }
  return res.json({ status: "password_required", email: loginEmailFor(employee) });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = emailSchema.parse(req.body);
  const employee = await findLoginEmployee(email);

  if (employee?.accessEnabled) {
    const purpose: PasswordResetPurpose = employee.passwordHash ? "RESET_PASSWORD" : "SET_PASSWORD";
    const destination = loginEmailFor(employee);
    try {
      const { code } = await createPasswordResetToken(employee.id, purpose);
      await sendPasswordEmail({
        to: destination,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        code,
        purpose,
      });
    } catch (error) {
      console.error("Password email failed:", error);
      return res.status(503).json({ message: "Unable to send verification email right now. Try again shortly." });
    }
  }

  return res.json({
    message: "If an account exists for this email, a verification code has been sent.",
  });
});

authRouter.post("/reset-password", async (req, res) => {
  const payload = resetPasswordSchema.parse(req.body);
  const employee = await findLoginEmployee(payload.email);

  if (!employee || !employee.accessEnabled) {
    return res.status(400).json({ message: "Invalid or expired verification code" });
  }

  const purpose: PasswordResetPurpose = employee.passwordHash ? "RESET_PASSWORD" : "SET_PASSWORD";
  const consumed = await consumePasswordResetCode(employee.id, payload.code, purpose);
  if (!consumed) {
    return res.status(400).json({ message: "Invalid or expired verification code" });
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, 10);
  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: { passwordHash },
  });

  return res.json({
    message: employee.passwordHash ? "Password reset successfully" : "Password created successfully",
    token: issueAuthToken(updated),
    user: authUserPayload(updated),
  });
});

authRouter.post("/login", async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const employee = await findLoginEmployee(payload.email);

  if (!employee || !employee.accessEnabled) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!employee.passwordHash) {
    return res.status(403).json({
      code: "PASSWORD_SETUP_REQUIRED",
      message: "No password is set for this account. Use Create Password to receive a verification code.",
    });
  }

  const validPassword = await bcrypt.compare(payload.password, employee.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: issueAuthToken(employee),
    user: authUserPayload(employee),
  });
});

authRouter.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const auth = req.auth!;
  const employee = await prisma.employee.findUnique({
    where: { id: auth.employeeId ?? auth.userId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  const normalizedEmployee = applyEmploymentStatusToEmployee(employee);

  return res.json({
    id: normalizedEmployee.id,
    email: normalizedEmployee.loginEmail ?? normalizedEmployee.email,
    role: normalizedEmployee.role,
    employee: normalizedEmployee,
  });
});

authRouter.post("/change-password", authMiddleware, async (req: AuthRequest, res) => {
  const auth = req.auth;
  const employeeId = auth?.employeeId ?? auth?.userId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }

  const payload = changePasswordSchema.parse(req.body);
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      passwordHash: true,
      accessEnabled: true,
    },
  });
  if (!employee || !employee.accessEnabled || !employee.passwordHash) {
    return res.status(400).json({ message: "Password reset is unavailable for this account" });
  }

  const currentPasswordValid = await bcrypt.compare(payload.currentPassword, employee.passwordHash);
  if (!currentPasswordValid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  if (payload.currentPassword === payload.newPassword) {
    return res.status(400).json({ message: "New password must be different from current password" });
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, 10);
  await prisma.employee.update({
    where: { id: employee.id },
    data: { passwordHash },
  });
  return res.json({ message: "Password updated successfully" });
});
