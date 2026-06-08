import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { existsSync } from "node:fs";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { employeesRouter } from "./modules/employees/employees.routes.js";
import { leaveRouter } from "./modules/leave/leave.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { essRouter } from "./modules/ess/ess.routes.js";
import { attendanceRouter, autoCheckOutOverdueSessions } from "./modules/attendance/attendance.routes.js";
import { exitRouter } from "./modules/exit/exit.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";
import { adjustmentsRouter } from "./modules/adjustments/adjustments.routes.js";
import { proRouter, autoCreateRenewalTasks } from "./modules/pro/pro.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "hrms-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ess", essRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/exits", exitRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/adjustments", adjustmentsRouter);
app.use("/api/pro", proRouter);

const frontendDistPath = path.resolve(process.cwd(), "../frontend/dist");
if (existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`HRMS backend running on http://localhost:${env.PORT}`);
});

const AUTO_CHECKOUT_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  autoCheckOutOverdueSessions().catch((error) => {
    console.error("Auto check-out job failed:", error);
  });
}, AUTO_CHECKOUT_INTERVAL_MS);

const RENEWAL_SCAN_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours
setTimeout(() => {
  autoCreateRenewalTasks().catch((error) => console.error("Renewal task job failed:", error));
}, 30 * 1000);
setInterval(() => {
  autoCreateRenewalTasks().catch((error) => console.error("Renewal task job failed:", error));
}, RENEWAL_SCAN_INTERVAL_MS);
