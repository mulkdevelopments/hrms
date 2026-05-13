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
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "hrms-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ess", essRouter);

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
