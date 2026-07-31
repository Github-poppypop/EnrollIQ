# EnrollIQ MVP — 20 Significant Improvements

> **Created:** 2026-07-30  
> **Status:** Planning (not yet implemented)

Each item is ranked by impact on the MVP's core value: enrollment forecasting with real data.

---

## 0. Infrastructure & Hardening (4 items)

### 1. Connect Vercel GitHub repo and enable auto-deploys
- **Why:** Currently the deploy was done via MCP payload; auto-deploy from `Github-poppypop/EnrollIQ` is not configured
- **How:** Manual step at Vercel project Settings → Git → Connect `Github-poppypop/EnrollIQ` → set production branch to `main`, preview branch to `feat/*`
- **Verification:** Push to `feat/enrolliq-mvp` triggers a new Vercel preview automatically

### 2. Add proper environment variable management
- **Why:** `.env.example` has 6 vars including `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY` — all empty
- **How:** Set them in Vercel project Settings → Environment Variables; remove `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env.example` since NextAuth is removed; add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel preview + production
- **Verification:** `npm run build` passes with env vars set; API routes return real data when connected

### 3. Add middleware.ts for Supabase auth session propagation
- **Why:** The session route hits Supabase on every page load; middleware can validate the session cookie early, redirect unauthenticated users to `/auth/signin`, and attach the user to `request.headers`
- **Files:** Create `middleware.ts` at project root
- **Verification:** Unauthenticated user visiting `/dashboard` is redirected to `/auth/signin`; authenticated user has `x-user-id` header set

### 4. Add rate limiting on API routes
- **Why:** The `/api/upload` endpoint accepts file uploads and is vulnerable to abuse; the service layer has no request throttling
- **How:** Add a lightweight rate-limiter (e.g., token-bucket in `lib/utils/rate-limit.ts`) using `Headers` + `Date.now()` stored in a Map — no external Redis dependency
- **Verification:** 429 response after exceeding 10 uploads per minute per IP

---

## 1. Data Quality & Integration (4 items)

### 5. Seed schema v2 with synthetic institution data
- **Why:** Schema v2 migration added `institutions`, academic_calendar/terms, tighter RLS — but there's no seed data, so API routes return empty arrays and the "demo mode" mock data in the service layer facades diverges from reality
- **How:** Create `supabase/seed/001_institutions.sql` with 3 realistic institutions, 6 courses, 6 terms, and 60+ enrollment snapshots across FA22–SP26
- **Verification:** `listEnrollmentsByInstitutionAndTerm` returns >= 10 rows with valid joins

### 6. Connect forecast service to real Supabase forecasts table
- **Why:** Current `/api/forecasts` route and the forecast page rely on hardcoded mock data; once the seed data has forecast rows, the `forecast-service.ts` functions become live
- **How:** Update `ForecastRow` type to match schema v2 exactly; replace mock `getForecastById` stub with real `listForecastsByInstitution` call; update predictions page to fetch from the forecast route
- **Verification:** Predictions page renders real forecast rows from Supabase instead of hardcoded array

### 7. Add data validation on API upload endpoint
- **Why:** The upload route currently passes files to `uploadFileToStorage` but never calls `parseAndValidateUpload` or `persistUploadResult` — the CSV data is stored but never loaded into the database
- **How:** In `app/api/upload/route.ts`, after storing the file, download it back, parse with `parseAndValidateUpload`, call `persistUploadResult` with a callback that inserts rows via the enrollment service, and return the validation report
- **Verification:** Uploading a valid CSV inserts rows into `enrollments`; uploading an invalid CSV returns 422 with row-level error details

### 8. Add institution scoping to all API routes
- **Why:** Schema v2 added `institution_id` columns and tighter RLS, but API routes currently accept un-scoped queries — a user at Institution A could query Institution B's enrollments via `?institution_id=`
- **How:** Create a `getAuthenticatedInstitution()` helper that maps the Supabase user to their institution (via a `user_profiles` table or email-domain allowlist), and scope every list route to return only that institution's data
- **Verification:** User at Institution A sees only their enrollment/forecast data; cross-institution queries return empty arrays

---

## 2. User Experience & Visual Design (4 items)

### 9. Replace Recharts with motion 12 charts for animated transitions
- **Why:** The project already has `motion` v12 in dependencies but charts are static Recharts; animated chart transitions make the forecasting UI feel alive and professional
- **How:** Use `motion`'s `AnimatePresence` + value animation on chart data transitions; or use `recharts` with `motion` wrappers on `LineChart`, `AreaChart`, `BarChart` components
- **Verification:** Chart data transitions animate when the user switches terms or institutions

### 10. Add real-time enrollment updates via Supabase subscriptions
- **Why:** The dashboard shows stale data; enrollment officers want to see live counts as new snapshots come in
- **How:** In `components/Auth.tsx` or a new `LiveIndicator` component, subscribe to `supabase.channel('enrollments').on('postgres_changes', ...)` and update local state; show a subtle "Live" badge on the dashboard when connected
- **Verification:** Dashboard metric cards update in real-time when a new enrollment row is inserted (test manually via SQL or the upload endpoint)

### 11. Dark mode polish and accessibility audit
- **Why:** The project has dark mode classes but they're manually applied; the color contrast may not meet WCAG AA for the "green-700 on white" text used for delta indicators
- **How:** Run a contrast check on all text/background combos; convert manual dark classes to Tailwind dark-mode utilities; ensure focus rings are visible; add `sr-only` labels to icon-only buttons (Export, Download)
- **Verification:** All text has 4.5:1 contrast ratio minimum; keyboard navigation reaches all interactive elements

### 12. Add loading skeletons that match card shapes
- **Why:** The page wiring subagent added loading states but they use simple `<div className="animate-pulse">` placeholders that don't visually represent the chart/card they're replacing
- **How:** Create a reusable `CardSkeleton` component with the same rounded-2xl/border/shadow as real cards, and a `ChartSkeleton` with a placeholder rectangle; use these in dashboard, trends, and predictions pages
- **Verification:** Loading state visually mirrors the final layout; no layout shift between loading and loaded

---

## 3. Feature Depth (4 items)

### 13. Add institution selector in the header
- **Why:** Schema v2 scoped everything to institution, but there's no UI to switch institution context — users can only see one institution's data at a time
- **How:** Add an institution `<select>` or dropdown in `SiteShell.tsx` or `Auth.tsx`; store the selected `institutionId` in a React context or `localStorage`; pass it through `fetchDashboardData`, `fetchTrendsData`, `fetchPredictionsData` helper functions
- **Verification:** Switching institution updates all dashboard/trends/predictions cards and charts without a full page reload

### 14. Add term/period toggle for trend analysis
- **Why:** Current trends page shows all terms from FA20–SP24 hardcoded; users want to select a range (e.g., "last 4 terms", "two years")
- **How:** Add a `TermToggle` component with preset chips (6 terms, 1 year, all time) and a date-range picker; wire it to filter the `/api/insights/trends` query params; update the trends service to accept `from`/`to` params
- **Verification:** Selecting different term ranges updates the trends chart correctly

### 15. Add export/csv download for any data view
- **Why:** Enrollment officers need to download forecasts and predictions for offline review or presentation
- **How:** Add an Export button on dashboard (metrics table), trends page (chart data), and predictions page (forecast intervals); create a `lib/utils/export.ts` helper that generates a CSV Blob and triggers a browser download
- **Verification:** Clicking Export downloads a `.csv` file with the current view's data

### 16. Add enrollment forecast comparison view
- **Why:** The predictions page already has actual vs upper/lower bands; adding a "What-if" scenario selector (e.g., "Increase capacity by 10%", "Add waitlist") makes the MVP more useful for decision-making
- **How:** Add a scenario panel on the predictions page with sliders; recompute forecast bands client-side using the existing forecast model coefficients (or server-side via a new `/api/forecasts/scenario` route)
- **Verification:** Adjusting a slider updates the prediction band lines in real-time

---

## 4. Engineering & Quality (4 items)

### 17. Add Vitest tests for the service layer
- **Why:** The project has `vitest` installed and a single `tests/dashboard.test.tsx` — but the core service functions have zero test coverage
- **Files:** Create `tests/services/enrollment-service.test.ts`, `tests/services/forecast-service.test.ts`, `tests/services/upload-service.test.ts`
- **How:** Mock Supabase client responses; test each exported function's happy path and error path; use `@testing-library/react` for any service-caller components
- **Verification:** `npx vitest run` passes with >= 80% coverage on `lib/services/`

### 18. Add ESLint flat-config custom rules for service layer conventions
- **Why:** The service layer enforces patterns (no raw `any`, exported interfaces, optional `client` parameter) but there's no lint enforcement — future contributors can easily break the conventions
- **How:** Add `.eslintrc.json` or extend `eslint.config.mjs` with rules: `no-restricted-syntax` for direct `supabase.from` outside `lib/services/`, require exported types for all function return values
- **Verification:** `npm run lint` catches a direct `supabase.from` call outside `lib/services/`

### 19. Generate TypeScript types from Supabase schema
- **Why:** The service layer uses hand-written `EnrollmentRow`, `ForecastRow` interfaces — these drift from the actual schema and miss columns
- **How:** Run `npx supabase gen types typescript --project-ref <ref> > lib/supabase/database.types.ts` (or use `supabase-js` auto-generated types via `supabase` CLI); update service layer to import from generated types
- **Verification:** `tsc --noEmit` passes with no type mismatches between service layer and schema

### 20. Add structured logging and error monitoring
- **Why:** API errors currently return generic "Unexpected server error" messages; there's no way to debug production issues without Supabase logs
- **How:** Add a `lib/logger.ts` that outputs structured JSON to `console.error` in server routes; integrate with Supabase's own logging or add a lightweight Sentry/Datadog integration
- **Verification:** Every API route logs request duration, method, status code, and error details to `console.error` in structured format

---

## Recommended Execution Order

1. **Infrastructure** (#1–4): unblocks everything else
2. **Data integration** (#5–8): makes the MVP actually useful with real data
3. **UX** (#9–12): makes the tool pleasant to use
4. **Feature depth** (#13–16): adds real decision-making value
5. **Engineering quality** (#17–20): protects the codebase for growth
