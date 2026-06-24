# HRMS Enterprise Platform

This repository now contains a production-style full-stack HRMS implementation with separate `frontend` and `backend` folders inspired by your `hrms.html` and `leave_management.html` prototypes and aligned with `HRMS Module.pdf` requirements.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Axios + React Router
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL 16 (via Docker for local development)
- **Auth**: JWT with role-based authorization

## Architecture

### Backend (`backend`)

- Modular API design:
  - `auth`: login and current user
  - `employees`: employee master CRUD, status updates, compensation/bank updates, sequential EMP ID generation
  - `leave`: leave type master, leave requests, L1/L2 approvals, balance updates, leave report summary
  - `dashboard`: HR KPIs and departmental headcount
  - `ess`: employee self-service profile, leaves, payslips
- Middleware:
  - JWT auth middleware
  - role guards for privileged actions
  - centralized error handling
- Prisma models include:
  - employees, leave types, leave balances, leave requests, payslips

### Frontend (`frontend`)

- Secure login flow with token persistence
- Role-aware app shell with modules:
  - Dashboard
  - Employee Master
  - Leave Management
  - ESS Portal
- Data-bound forms and tables connected to backend APIs
- Design language inspired by your provided prototypes (dark enterprise HR dashboard)

## Setup

1. Install all dependencies:
   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. Start PostgreSQL:
   ```bash
   npm run db:up
   ```
3. Configure environment:
   ```bash
   cp backend/.env.example backend/.env
   ```
4. Initialize DB and seed demo data:
   ```bash
   npm run prisma:generate --prefix backend
   npm run db:migrate
   npm run seed --prefix backend
   ```
5. Start frontend + backend together:
   ```bash
   npm run dev
   ```

## Demo Credentials

- `admin@hrms.com / Admin@123`
- `manager@hrms.com / Manager@123`
- `employee@hrms.com / Employee@123`

## Hosting (Render + Vercel)

Production is split:

- **Backend + PostgreSQL** → Render (`render.yaml`, service `hrms-api`)
- **Frontend** → Vercel (root directory `frontend`, env `VITE_API_URL`)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step setup, env vars, and seeding.

Quick links after deploy:

- Frontend: `https://hrms.mulkinternational.co`
- API health: `https://api.mulkinternational.co/api/health`
- Frontend env: `VITE_API_URL=https://api.mulkinternational.co/api`

## Implemented Requirement Mapping

- Employee master with searchable records and sequential IDs
- Leave type master and leave requests
- L1/L2 leave approval workflow
- Leave balance handling with carry-forward cap (max 60)
- ESS login + self-service leave and payslip view
- Dashboard KPIs and departmental summary

## Next Enterprise Steps Recommended

- Multi-environment PostgreSQL strategy (dev/stage/prod with managed DB)
- SSO (Azure AD/Okta) with MFA and audit trails
- file/document module with object storage
- payroll engine, policy engine, and statutory compliance automation
- automated tests (unit/integration/e2e) and CI/CD
