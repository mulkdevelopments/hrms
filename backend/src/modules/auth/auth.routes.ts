import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { applyEmploymentStatusToEmployee } from "../../lib/employment-status.js";
import { env } from "../../config/env.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { email: payload.email.toLowerCase() },
        { loginEmail: payload.email.toLowerCase() },
      ],
      accessEnabled: true,
    },
  });

  if (!employee?.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(payload.password, employee.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: employee.id,
      role: employee.role,
      employeeId: employee.id,
    },
    env.JWT_SECRET,
    { expiresIn: "10h" },
  );
  const normalizedEmployee = applyEmploymentStatusToEmployee(employee);

  return res.json({
    token,
    user: {
      id: normalizedEmployee.id,
      email: normalizedEmployee.loginEmail ?? normalizedEmployee.email,
      role: normalizedEmployee.role,
      employee: normalizedEmployee,
    },
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
