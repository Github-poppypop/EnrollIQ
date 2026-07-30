-- institutions
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- academic_calendars
create table public.academic_calendars (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  term_type text not null check (term_type in ('semester','quarter','trimester')),
  start_on date not null,
  end_on date not null,
  created_at timestamptz not null default now(),
  unique(institution_id, name)
);

-- catalogs
create table public.catalogs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  department text,
  created_at timestamptz not null default now()
);

-- courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  catalog_id uuid references public.catalogs(id) on delete set null,
  subject text not null,
  course_number text not null,
  section text,
  title text,
  credits numeric,
  capacity int,
  term text not null,
  created_at timestamptz not null default now()
);

-- enrollments
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  snapshot_at timestamptz not null default now(),
  student_count int not null default 0,
  enrolled int not null default 0,
  waitlist int not null default 0,
  capacity int
);

-- forecasts
create table public.forecasts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  model text not null,
  horizon jsonb not null,
  predictions jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.forecasts enable row level security;

create policy "service_full_access"
on public.courses for all
using (true)
with check (true);

create policy "service_full_access"
on public.enrollments for all
using (true)
with check (true);

create policy "service_full_access"
on public.forecasts for all
using (true)
with check (true);
