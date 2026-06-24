# Deploy HRMS (Render + Vercel)

Split hosting:

| Component | Platform | URL pattern |
|-----------|----------|-------------|
| PostgreSQL + API | [Render](https://render.com) | `https://hrms-api.onrender.com` |
| Web app | [Vercel](https://vercel.com) | `https://your-project.vercel.app` |

Repository: [mulkdevelopments/hrms](https://github.com/mulkdevelopments/hrms)

## 1. Push to GitHub

```bash
git remote set-url origin https://github.com/mulkdevelopments/hrms.git
git push -u origin main
```

## 2. Render — database + backend

1. Open [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**
2. Connect **mulkdevelopments/hrms** and apply `render.yaml`
3. When prompted, set these **manual** env vars on `hrms-api`:

| Variable | Example / notes |
|----------|-----------------|
| `CORS_ORIGIN` | Your Vercel URL, e.g. `https://hrms.vercel.app` (or `*` temporarily) |
| `APP_PUBLIC_URL` | Same Vercel URL (used in emails / links) |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob → token |
| `RESEND_API_KEY` | Optional — password reset emails |
| `RESEND_FROM_EMAIL` | Optional — e.g. `Mulk HRMS <noreply@yourdomain.com>` |

4. Wait for deploy; confirm health: `https://<hrms-api-host>/api/health`

### Seed production data (once)

Render → **hrms-api → Shell**:

```bash
npm run seed
```

Default accounts (change passwords after first login):

- `admin@hrms.com` / `Admin@123`
- `manager@hrms.com` / `Manager@123`
- `employee@hrms.com` / `Employee@123`

## 3. Vercel — frontend

1. [vercel.com/new](https://vercel.com/new) → import **mulkdevelopments/hrms**
2. **Root Directory**: `frontend`
3. Framework: **Vite** (auto-detected)
4. Environment variable:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://<your-render-api-host>/api` |

5. Deploy

6. Copy the Vercel URL and update Render env vars `CORS_ORIGIN` and `APP_PUBLIC_URL`, then redeploy **hrms-api** if needed.

## 4. Verify

- Vercel site loads and login works
- Browser network tab shows API calls to Render (not `localhost`)
- `/api/health` on Render returns `{ "ok": true }`

## Local development

Unchanged:

```bash
npm run db:up
cp backend/.env.example backend/.env
npm run db:migrate
npm run seed --prefix backend
npm run dev
```

Frontend uses Vite proxy to `localhost:4000` when `VITE_API_URL` is unset.

## Notes

- Render free web services spin down after inactivity; first request may take ~30s.
- Face recognition on Render requires native Node deps (`canvas`, `@tensorflow/tfjs-node`); if the build fails, upgrade the Render plan or switch the service to Docker.
- Mobile app: set API URL in `mobile/src/lib/api-config.ts` (or env) to the Render API base.
