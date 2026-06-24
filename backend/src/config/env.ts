import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  ATTENDANCE_TIMEZONE: z.string().default("Asia/Dubai"),
  ADJUSTMENT_DUAL_APPROVAL_THRESHOLD: z.coerce.number().default(5000),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  BLOB_ACCESS: z.enum(["public", "private"]).default("public"),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("HRMS <onboarding@resend.dev>"),
  APP_PUBLIC_URL: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
