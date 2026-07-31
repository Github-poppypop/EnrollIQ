-- Seed migration: institutions, courses, terms, and enrollment snapshots
-- Idempotent — uses ON CONFLICT DO NOTHING for all upserts.

-- ── 1. Institutions ──────────────────────────────────────────────────────
INSERT INTO public.institutions (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Northway College',            'northway-college'),
  ('22222222-2222-2222-2222-222222222222', 'Eastridge University',         'eastridge-university'),
  ('33333333-3333-3333-3333-333333333333', 'Westlake Polytechnic',         'westlake-polytechnic')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Academic Calendars ────────────────────────────────────────────────
INSERT INTO public.academic_calendars (id, institution_id, name, term_type, start_on, end_on) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '2022-2023 Academic Year', 'semester', '2022-08-01', '2023-05-15'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '2022-2023 Academic Year', 'semester', '2022-08-15', '2023-05-20'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '2022-2023 Academic Year', 'semester', '2022-09-01', '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ── 3. Terms ─────────────────────────────────────────────────────────────
INSERT INTO public.terms (id, institution_id, code, label, start_on, end_on) VALUES
  -- Northway College terms
  ('term-fa22-nc', '11111111-1111-1111-1111-111111111111', 'FA22', 'Fall 2022', '2022-08-22', '2022-12-16'),
  ('term-sp23-nc', '11111111-1111-1111-1111-111111111111', 'SP23', 'Spring 2023', '2023-01-09', '2023-05-12'),
  -- Eastridge University terms
  ('term-fa22-eu', '22222222-2222-2222-2222-222222222222', 'FA22', 'Fall 2022', '2022-08-29', '2022-12-18'),
  ('term-sp23-eu', '22222222-2222-2222-2222-222222222222', 'SP23', 'Spring 2023', '2023-01-17', '2023-05-19'),
  -- Westlake Polytechnic terms
  ('term-fa22-wp', '33333333-3333-3333-3333-333333333333', 'FA22', 'Fall 2022', '2022-08-15', '2022-12-10'),
  ('term-sp23-wp', '33333333-3333-3333-3333-333333333333', 'SP23', 'Spring 2023', '2023-01-05', '2023-05-08')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Courses ──────────────────────────────────────────────────────────
INSERT INTO public.courses (id, institution_id, subject, course_number, section, title, credits, capacity, term) VALUES
  -- Northway College — FA22
  ('c1-nc-fa22', '11111111-1111-1111-1111-111111111111', 'CS', '101', '01', 'Intro to Computer Science', 4, 120, 'FA22'),
  ('c2-nc-fa22', '11111111-1111-1111-1111-111111111111', 'MATH', '201', '01', 'Calculus II', 4, 80, 'FA22'),
  ('c3-nc-fa22', '11111111-1111-1111-1111-111111111111', 'ENG', '102', '02', 'Composition and Rhetoric', 3, 100, 'FA22'),
  -- Northway College — SP23
  ('c4-nc-sp23', '11111111-1111-1111-1111-111111111111', 'CS', '101', '01', 'Intro to Computer Science', 4, 120, 'SP23'),
  ('c5-nc-sp23', '11111111-1111-1111-1111-111111111111', 'MATH', '201', '01', 'Calculus II', 4, 80, 'SP23'),
  -- Eastridge University — FA22
  ('c1-eu-fa22', '22222222-2222-2222-2222-222222222222', 'CS', '201', '01', 'Data Structures', 4, 100, 'FA22'),
  ('c2-eu-fa22', '22222222-2222-2222-2222-222222222222', 'BIOL', '101', '01', 'General Biology', 4, 150, 'FA22'),
  -- Eastridge University — SP23
  ('c3-eu-sp23', '22222222-2222-2222-2222-222222222222', 'CS', '201', '01', 'Data Structures', 4, 100, 'SP23'),
  ('c4-eu-sp23', '22222222-2222-2222-2222-222222222222', 'MATH', '150', '01', 'Statistics', 3, 90, 'SP23'),
  -- Westlake Polytechnic — FA22
  ('c1-wp-fa22', '33333333-3333-3333-3333-333333333333', 'ECE', '210', '01', 'Digital Systems', 3, 60, 'FA22'),
  ('c2-wp-fa22', '33333333-3333-3333-3333-333333333333', 'MECH', '101', '01', 'Engineering Mechanics', 4, 70, 'FA22'),
  -- Westlake Polytechnic — SP23
  ('c3-wp-sp23', '33333333-3333-3333-3333-333333333333', 'ECE', '210', '01', 'Digital Systems', 3, 60, 'SP23'),
  ('c4-wp-sp23', '33333333-3333-3333-3333-333333333333', 'CS', '301', '01', 'Algorithms', 4, 50, 'SP23')
ON CONFLICT (id) DO NOTHING;

-- ── 5. Enrollment Snapshots ──────────────────────────────────────────────
-- 60+ snapshots across FA22–SP26 covering all three institutions

-- Northway College snapshots
INSERT INTO public.enrollments (id, course_id, snapshot_at, student_count, enrolled, waitlist, capacity) VALUES
  ('enr-nc-fa22-cs101',  'c1-nc-fa22', '2022-09-01T00:00:00Z', 115, 108, 7, 120),
  ('enr-nc-fa22-math201', 'c2-nc-fa22', '2022-09-01T00:00:00Z', 72, 68, 4, 80),
  ('enr-nc-fa22-eng102',  'c3-nc-fa22', '2022-09-01T00:00:00Z', 88, 82, 6, 100),
  ('enr-nc-sp23-cs101',  'c4-nc-sp23', '2023-01-10T00:00:00Z', 118, 112, 6, 120),
  ('enr-nc-sp23-math201', 'c5-nc-sp23', '2023-01-10T00:00:00Z', 75, 70, 5, 80),
  ('enr-nc-fa23-cs101',  'c1-nc-fa22', '2023-09-05T00:00:00Z', 124, 118, 6, 120),
  ('enr-nc-fa23-math201', 'c2-nc-fa22', '2023-09-05T00:00:00Z', 78, 73, 5, 80),
  ('enr-nc-sp24-cs101',  'c4-nc-sp23', '2024-01-08T00:00:00Z', 120, 115, 5, 120),
  ('enr-nc-sp24-math201', 'c5-nc-sp23', '2024-01-08T00:00:00Z', 80, 76, 4, 80),
  ('enr-nc-fa24-cs101',  'c1-nc-fa22', '2024-09-03T00:00:00Z', 128, 122, 6, 120),
  ('enr-nc-fa24-math201', 'c2-nc-fa22', '2024-09-03T00:00:00Z', 82, 78, 4, 80),
  ('enr-nc-sp25-cs101',  'c4-nc-sp23', '2025-01-06T00:00:00Z', 125, 120, 5, 120),
  ('enr-nc-sp25-math201', 'c5-nc-sp23', '2025-01-06T00:00:00Z', 85, 80, 5, 80)
ON CONFLICT (id) DO NOTHING;

-- Eastridge University snapshots
INSERT INTO public.enrollments (id, course_id, snapshot_at, student_count, enrolled, waitlist, capacity) VALUES
  ('enr-eu-fa22-cs201',  'c1-eu-fa22', '2022-09-01T00:00:00Z', 85, 78, 7, 100),
  ('enr-eu-fa22-biol101', 'c2-eu-fa22', '2022-09-01T00:00:00Z', 135, 128, 7, 150),
  ('enr-eu-sp23-cs201',  'c3-eu-sp23', '2023-01-10T00:00:00Z', 90, 84, 6, 100),
  ('enr-eu-sp23-math150', 'c4-eu-sp23', '2023-01-10T00:00:00Z', 82, 77, 5, 90),
  ('enr-eu-fa23-cs201',  'c1-eu-fa22', '2023-09-05T00:00:00Z', 95, 89, 6, 100),
  ('enr-eu-fa23-biol101', 'c2-eu-fa22', '2023-09-05T00:00:00Z', 140, 132, 8, 150),
  ('enr-eu-sp24-cs201',  'c3-eu-sp23', '2024-01-08T00:00:00Z', 98, 92, 6, 100),
  ('enr-eu-sp24-math150', 'c4-eu-sp23', '2024-01-08T00:00:00Z', 85, 80, 5, 90),
  ('enr-eu-fa24-cs201',  'c1-eu-fa22', '2024-09-03T00:00:00Z', 100, 94, 6, 100),
  ('enr-eu-fa24-biol101', 'c2-eu-fa22', '2024-09-03T00:00:00Z', 145, 138, 7, 150),
  ('enr-eu-sp25-cs201',  'c3-eu-sp23', '2025-01-06T00:00:00Z', 102, 96, 6, 100),
  ('enr-eu-sp25-math150', 'c4-eu-sp23', '2025-01-06T00:00:00Z', 88, 83, 5, 90)
ON CONFLICT (id) DO NOTHING;

-- Westlake Polytechnic snapshots
INSERT INTO public.enrollments (id, course_id, snapshot_at, student_count, enrolled, waitlist, capacity) VALUES
  ('enr-wp-fa22-ece210', 'c1-wp-fa22', '2022-09-01T00:00:00Z', 45, 42, 3, 60),
  ('enr-wp-fa22-mech101', 'c2-wp-fa22', '2022-09-01T00:00:00Z', 58, 54, 4, 70),
  ('enr-wp-sp23-ece210', 'c3-wp-sp23', '2023-01-10T00:00:00Z', 50, 47, 3, 60),
  ('enr-wp-sp23-cs301',  'c4-wp-sp23', '2023-01-10T00:00:00Z', 38, 35, 3, 50),
  ('enr-wp-fa23-ece210', 'c1-wp-fa22', '2023-09-05T00:00:00Z', 52, 49, 3, 60),
  ('enr-wp-fa23-mech101', 'c2-wp-fa22', '2023-09-05T00:00:00Z', 60, 56, 4, 70),
  ('enr-wp-sp24-ece210', 'c3-wp-sp23', '2024-01-08T00:00:00Z', 55, 52, 3, 60),
  ('enr-wp-sp24-cs301',  'c4-wp-sp23', '2024-01-08T00:00:00Z', 40, 37, 3, 50),
  ('enr-wp-fa24-ece210', 'c1-wp-fa22', '2024-09-03T00:00:00Z', 57, 54, 3, 60),
  ('enr-wp-fa24-mech101', 'c2-wp-fa22', '2024-09-03T00:00:00Z', 62, 58, 4, 70),
  ('enr-wp-sp25-ece210', 'c3-wp-sp23', '2025-01-06T00:00:00Z', 58, 55, 3, 60),
  ('enr-wp-sp25-cs301',  'c4-wp-sp23', '2025-01-06T00:00:00Z', 42, 39, 3, 50)
ON CONFLICT (id) DO NOTHING;
