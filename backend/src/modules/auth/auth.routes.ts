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
