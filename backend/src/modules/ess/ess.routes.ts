import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

export const essRouter = Router();
essRouter.use(authMiddleware);

const updateMyProfileSchema = z.object({
  phone: z.string().trim().max(30),
});

essRouter.get("/me", async (req: AuthRequest, res) => {
  if (!req.auth?.employeeId) {
    return res.status(404).json({ message: "Employee profile not linked" });
  }

  const profile = await prisma.employee.findUnique({
    where: { id: req.auth.employeeId },
    include: { manager: { select: { firstName: true, lastName: true, employeeCode: true } } },
  });

  return res.json(profile);
});

essRouter.patch("/me", async (req: AuthRequest, res) => {
  if (!req.auth?.employeeId) {
    return res.status(404).json({ message: "Employee profile not linked" });
  }

  const payload = updateMyProfileSchema.parse(req.body);
  const profile = await prisma.employee.update({
    where: { id: req.auth.employeeId },
    data: { phone: payload.phone || null },
    include: { manager: { select: { firstName: true, lastName: true, employeeCode: true } } },
  });

  return res.json(profile);
});

essRouter.get("/my-leaves", async (req: AuthRequest, res) => {
  if (!req.auth?.employeeId) {
    return res.json([]);
  }

  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId: req.auth.employeeId },
    include: { leaveType: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json(leaves);
});

essRouter.get("/my-payslips", async (req: AuthRequest, res) => {
  if (!req.auth?.employeeId) {
    return res.json([]);
  }

  const payslips = await prisma.payslip.findMany({
    where: { employeeId: req.auth.employeeId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return res.json(payslips);
});
