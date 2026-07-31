# EnrollIQ — Project Settings & Vercel Configuration

## Vercel Project Settings

| Field | Value |
|---|---|
| **Project ID** | `prj_ua6T6SiYBHeVwipw6Iy4QfAupZ54` |
| **Team** | `team_Du8TsJR2JqZbPDeUSxfaVP9V` |
| **Framework** | Next.js |
| **Build Command** | `npm run build` |
| **Dev Command** | `npm run dev` |
| **Install Command** | `npm install` |
| **Region** | `iad1` |
| **Root Directory** | `/enrolliq-web` |

## Auto-Deploy Configuration

- Auto-deploys from the `main` branch.
- Preview deploys from branches and PRs.
- Required environment variables in Vercel (Production):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` (optional — for forecast model features)

## GitHub Integration

1. Go to **Vercel Dashboard → Project Settings → Git Repository**.
2. Connect the EnrollIQ GitHub repository.
3. Set production branch to `main`.
4. Enable **Auto-Deploy** (enabled by default).
5. Add the production environment variables listed above in **Settings → Environment Variables**.

## Deployment Checklist

- [x] Build passes (`npm run build`)
- [x] All 7 API routes exist and compile
- [x] Auth unified on Supabase (NextAuth removed)
- [x] Service layer at `lib/services/`
- [x] Schema v2 migration exists
- [x] Pages wired to API data with loading/error/empty states
- [ ] GitHub auto-deploy link configured (use project ID above)
- [ ] Production env vars added in Vercel dashboard
