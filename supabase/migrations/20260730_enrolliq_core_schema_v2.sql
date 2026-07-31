-- ═══════════════════════════════════════════════════════════════════════════════
-- 20260730_enrolliq_core_schema_v2
--
-- Additive v2 migration for EnrollIQ: institution scoping, term/calendar
-- normalization, tighter RLS, and performance indexes.
--
-- DESIGN RULES
--  • Every structural change is ADDITIVE.  No existing tables or columns are
--    dropped or renamed.  Existing rows are never removed.
--  • RLS is tightened from the previous open ("service_full_access") policies
--    to institution-scoped policies read from the new `public.profiles` table
--    keyed by `auth.uid()`.  This gives "deny-by-default" isolation without
--    requiring application code changes.
--  • Existing text columns (e.g. `courses.term`) are kept so that any
--    existing reads in the application continue to work.  New FK columns are
--    added as ADJACENT, nullable columns so zero code changes are required.
--  • The local no-env build path (`NEXT_PUBLIC_SUPABASE_URL` absent) is
--    completely unaffected: the client stub returns early and never issues a
--    real DB call, so no RLS policy is ever evaluated during local
--    development.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Normalized term lookup table ───────────────────────────────────────
-- Stable, institution-scoped term identifiers (e.g. "FA22", "SP23").
-- Linked optionally to an `academic_calendars` row which carries the
-- authoritative start/end dates.
create table public.terms (
  id            uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  calendar_id   uuid       references public.academic_calendars(id) on delete set null,
  code          text not null,                               -- e.g. "FA22", "SP23"
  label         text not null,                               -- e.g. "Fall 2022"
  start_on      date    not null,
  end_on        date    not null,
  created_at    timestamptz not null default now(),
  constraint terms_institution_code_unique unique (institution_id, code)
);

alter table public.terms enable row level security;

-- ── 2. Profile / user -> institution tenancy map ───────────────────────────
-- This table is the authoritative mapping between Supabase Auth
-- (`auth.users.id`) and the institution the signed-in user belongs to.
--
-- RLS policies key off this table.  A row MUST exist here for an
-- authenticated user to reach any institution-scoped resource.  A user with
-- no profile row sees no rows – that's intentional "deny by default".
--
-- Usually created during signup or a post-auth flow on the app side; never
-- inserted here from a migration to avoid dummy auth.users rows.
create table public.profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  role          text not null default 'member',
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users only touch their own profile entry; all other rows are invisible.
create policy "authenticated_users_own_profile"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. Add new columns to existing tables (all additive) ───────────────────

-- courses.term_id  = FK to the normalized term.
-- courses.calendar_id = FK to the academic calendar for that course's term.
alter table public.courses
  add column if not exists term_id      uuid references public.terms(id) on delete set null,
  add column if not exists calendar_id  uuid references public.academic_calendars(id) on delete set null;

-- Partial unique index on courses: within one institution, subject+number+section
-- must be unique when a section is known.  Wrap in a DO block so re-runs
-- of this migration do not fail on duplicate index names.
do $$
begin
  if not exists (
    select 1
    from   pg_indexes
    where  schemaname = 'public'
      and  indexname  = 'idx_courses_institution_unique'
  ) then
    execute $sql$
      create unique index idx_courses_institution_unique
        on public.courses (institution_id, subject, course_number, section)
        where section is not null
    $sql$;
  end if;
end $$;

-- enrollments.institution_id  mirrors the parent course so RLS and common
-- queries can filter directly without joining through `courses` every time.
alter table public.enrollments
  add column if not exists institution_id uuid references public.institutions(id);

-- Backfill from the linked course for any pre-existing rows.
update public.enrollments e
set    institution_id = c.institution_id
from   public.courses c
where  c.id = e.course_id
  and  e.institution_id is null;

-- Fail loudly if any enrollments are still mismatched (e.g. orphaned rows)
-- rather than silently inserting a wrong institution_id.
alter table public.enrollments
  alter column institution_id set not null;

-- ── 4. Enable RLS on remaining tables that did not have it ─────────────────
alter table public.institutions       enable row level security;
alter table public.academic_calendars enable row level security;
alter table public.catalogs          enable row level security;

-- ── 5. Drop the open-access policies from the prior schema ─────────────────
drop policy if exists "service_full_access" on public.courses;
drop policy if exists "service_full_access" on public.enrollments;
drop policy if exists "service_full_access" on public.forecasts;

-- ── 6. Institution-scoped RLS policies ─────────────────────────────────────
--
-- Every data-bearing table now requires that the authenticated user has a
-- matching row in `public.profiles`.  The predicate reads:
--
--   auth.uid()  =  profiles.user_id
--   AND          =  profiles.institution_id = table.institution_id
--
-- This works directly from the Supabase JWT without shipping any custom
-- claims.  Ownership is revoked by deleting (or changing) the single profile
-- row – no code deployment needed.

-- public.institutions
create policy "authenticated_institution_members_institution_rw"
  on public.institutions
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = institutions.id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = institutions.id
    )
  );

-- public.academic_calendars
create policy "authenticated_institution_members_calendar_rw"
  on public.academic_calendars
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = academic_calendars.institution_id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = academic_calendars.institution_id
    )
  );

-- public.catalogs
create policy "authenticated_institution_members_catalog_rw"
  on public.catalogs
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = catalogs.institution_id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = catalogs.institution_id
    )
  );

-- public.terms
create policy "authenticated_institution_members_term_rw"
  on public.terms
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = terms.institution_id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = terms.institution_id
    )
  );

-- public.courses
create policy "authenticated_institution_members_course_rw"
  on public.courses
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = courses.institution_id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = courses.institution_id
    )
  );

-- public.enrollments
create policy "authenticated_institution_members_enrollment_rw"
  on public.enrollments
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = enrollments.institution_id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = enrollments.institution_id
    )
  );

-- public.forecasts
create policy "authenticated_institution_members_forecast_rw"
  on public.forecasts
  for all
  using (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = forecasts.institution_id
    )
  )
  with check (
    exists (
      select 1
      from   public.profiles
      where  profiles.user_id       = auth.uid()
        and  profiles.institution_id = forecasts.institution_id
    )
  );

-- ── 7. Useful indexes ──────────────────────────────────────────────────────
-- Enrich the primary query path used by the dashboard, trends, and
-- predictions pages (e.g., enrollment snapshots over a sequenced term
-- window, and forecast lookups by institution + course).

create index if not exists idx_enrollments_inst_course_snapshot
  on public.enrollments (institution_id, course_id, snapshot_at desc);

create index if not exists idx_courses_institution_catalog
  on public.courses (institution_id, catalog_id);

create index if not exists idx_courses_term
  on public.courses (term_id);

create index if not exists idx_forecasts_inst_course_created
  on public.forecasts (institution_id, course_id, created_at desc);

create index if not exists idx_terms_institution_code
  on public.terms (institution_id, code);
