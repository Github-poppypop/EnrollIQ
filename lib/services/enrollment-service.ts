/**
 * Thin service layer for the enrollments table and its related course + institution data.
 *
 * Uses the existing Supabase browser client factory so it can be called from
 * client components in the browser. The mock fallback in the client factory
 * keeps this layer callable even when env vars are not configured yet (MVP mode).
 *
 * All functions accept an optional `client` parameter so they can also be used
 * from server-side API routes with the server Supabase client.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Lightweight row types aligned to the actual migration schema.
// Using plain objects (no `Database` generated types) keeps the layer thin
// and avoids coupling to a generated deck.
// ---------------------------------------------------------------------------

export interface EnrollmentRow {
  id: string;
  course_id: string;
  snapshot_at: string;
  student_count: number;
  enrolled: number;
  waitlist: number;
  capacity: number | null;
  // joined fields
  institution_id: string;
  institution_name: string;
  subject: string;
  course_number: string;
  section: string | null;
  title: string | null;
  term: string;
}

export interface CreateEnrollmentInput {
  course_id: string;
  snapshot_at?: string;
  student_count?: number;
  enrolled: number;
  waitlist: number;
  capacity?: number | null;
}

export interface UpdateEnrollmentInput {
  student_count?: number;
  enrolled?: number;
  waitlist?: number;
  capacity?: number | null;
}

// ---------------------------------------------------------------------------
// Internal helper – builds a typed Supabase client.
// ---------------------------------------------------------------------------

function getClient(override?: SupabaseClient): SupabaseClient {
  return override ?? createSupabaseBrowserClient();
}

// ---------------------------------------------------------------------------
// listEnrollmentsByInstitutionAndTerm
// ---------------------------------------------------------------------------

export async function listEnrollmentsByInstitutionAndTerm(
  institutionId: string,
  term?: string,
  client?: SupabaseClient,
): Promise<EnrollmentRow[]> {
  const db = getClient(client);

  let query = db
    .from('enrollments')
    .select(
      `
      id,
      course_id,
      snapshot_at,
      student_count,
      enrolled,
      waitlist,
      capacity,
      courses!inner (
        id,
        institution_id,
        subject,
        course_number,
        section,
        title,
        term
      ),
      institutions!inner (id, name)
    `,
    )
    .eq('courses.institution_id', institutionId)
    .order('snapshot_at', { ascending: false });

  if (term) {
    query = query.eq('courses.term', term);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, any>) => {
    const course = row.courses as {
      id: string;
      institution_id: string;
      subject: string;
      course_number: string;
      section: string | null;
      title: string | null;
      term: string;
    };
    const institution = row.institutions as { id: string; name: string };

    return {
      id: row.id,
      course_id: row.course_id,
      snapshot_at: row.snapshot_at,
      student_count: row.student_count,
      enrolled: row.enrolled,
      waitlist: row.waitlist,
      capacity: row.capacity,
      institution_id: course.institution_id,
      institution_name: institution.name,
      subject: course.subject,
      course_number: course.course_number,
      section: course.section,
      title: course.title,
      term: course.term,
    } as EnrollmentRow;
  });
}

// ---------------------------------------------------------------------------
// listEnrollmentsByCourse
// ---------------------------------------------------------------------------

export async function listEnrollmentsByCourse(
  courseId: string,
  client?: SupabaseClient,
): Promise<EnrollmentRow[]> {
  const db = getClient(client);

  const { data, error } = await db
    .from('enrollments')
    .select(
      `
      id,
      course_id,
      snapshot_at,
      student_count,
      enrolled,
      waitlist,
      capacity,
      courses!inner (
        id,
        institution_id,
        subject,
        course_number,
        section,
        title,
        term
      ),
      institutions!inner (id, name)
    `,
    )
    .eq('course_id', courseId)
    .order('snapshot_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, any>) => {
    const course = row.courses as {
      id: string;
      institution_id: string;
      subject: string;
      course_number: string;
      section: string | null;
      title: string | null;
      term: string;
    };
    const institution = row.institutions as { id: string; name: string };

    return {
      id: row.id,
      course_id: row.course_id,
      snapshot_at: row.snapshot_at,
      student_count: row.student_count,
      enrolled: row.enrolled,
      waitlist: row.waitlist,
      capacity: row.capacity,
      institution_id: course.institution_id,
      institution_name: institution.name,
      subject: course.subject,
      course_number: course.course_number,
      section: course.section,
      title: course.title,
      term: course.term,
    } as EnrollmentRow;
  });
}

// ---------------------------------------------------------------------------
// createEnrollment
// ---------------------------------------------------------------------------

export async function createEnrollment(
  input: CreateEnrollmentInput,
  client?: SupabaseClient,
): Promise<EnrollmentRow> {
  const db = getClient(client);

  const row: Record<string, any> = {
    course_id: input.course_id,
    enrolled: input.enrolled,
    waitlist: input.waitlist,
  };

  if (input.snapshot_at)   row.snapshot_at = input.snapshot_at;
  if (input.student_count !== undefined) row.student_count = input.student_count;
  if (input.capacity !== undefined)      row.capacity = input.capacity;

  const { data, error } = await db
    .from('enrollments')
    .insert(row)
    .select(
      `
      id,
      course_id,
      snapshot_at,
      student_count,
      enrolled,
      waitlist,
      capacity,
      courses!inner (
        id,
        institution_id,
        subject,
        course_number,
        section,
        title,
        term
      ),
      institutions!inner (id, name)
    `,
    )
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('createEnrollment: insert returned no row');
  }

  const rowData = data as Record<string, any>;
  const course = rowData.courses as {
    id: string;
    institution_id: string;
    subject: string;
    course_number: string;
    section: string | null;
    title: string | null;
    term: string;
  };
  const institution = rowData.institutions as { id: string; name: string };

  return {
    id: rowData.id,
    course_id: rowData.course_id,
    snapshot_at: rowData.snapshot_at,
    student_count: rowData.student_count,
    enrolled: rowData.enrolled,
    waitlist: rowData.waitlist,
    capacity: rowData.capacity,
    institution_id: course.institution_id,
    institution_name: institution.name,
    subject: course.subject,
    course_number: course.course_number,
    section: course.section,
    title: course.title,
    term: course.term,
  } as EnrollmentRow;
}

// ---------------------------------------------------------------------------
// updateEnrollment
// ---------------------------------------------------------------------------

export async function updateEnrollment(
  enrollmentId: string,
  changes: UpdateEnrollmentInput,
  client?: SupabaseClient,
): Promise<EnrollmentRow> {
  const db = getClient(client);

  const patch: Record<string, any> = {};
  if (changes.student_count  !== undefined) patch.student_count = changes.student_count;
  if (changes.enrolled       !== undefined) patch.enrolled      = changes.enrolled;
  if (changes.waitlist       !== undefined) patch.waitlist      = changes.waitlist;
  if (changes.capacity      !== undefined) patch.capacity     = changes.capacity;

  const { data, error } = await db
    .from('enrollments')
    .update(patch)
    .eq('id', enrollmentId)
    .select(
      `
      id,
      course_id,
      snapshot_at,
      student_count,
      enrolled,
      waitlist,
      capacity,
      courses!inner (
        id,
        institution_id,
        subject,
        course_number,
        section,
        title,
        term
      ),
      institutions!inner (id, name)
    `,
    )
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('updateEnrollment: update returned no row');
  }

  const row = data as Record<string, any>;
  const course = row.courses as {
    id: string;
    institution_id: string;
    subject: string;
    course_number: string;
    section: string | null;
    title: string | null;
    term: string;
  };
  const institution = row.institutions as { id: string; name: string };

  return {
    id: row.id,
    course_id: row.course_id,
    snapshot_at: row.snapshot_at,
    student_count: row.student_count,
    enrolled: row.enrolled,
    waitlist: row.waitlist,
    capacity: row.capacity,
    institution_id: course.institution_id,
    institution_name: institution.name,
    subject: course.subject,
    course_number: course.course_number,
    section: course.section,
    title: course.title,
    term: course.term,
  } as EnrollmentRow;
}

// ---------------------------------------------------------------------------
// deleteEnrollment
// ---------------------------------------------------------------------------

export async function deleteEnrollment(
  enrollmentId: string,
  client?: SupabaseClient,
): Promise<void> {
  const db = getClient(client);

  const { error } = await db
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (error) {
    throw error;
  }
}

// ---------------------------------------------------------------------------
// validateEnrollmentRow — data quality checks for a single enrollment row
// ---------------------------------------------------------------------------

export interface EnrollmentValidationError {
  field: string;
  reason: string;
  value: unknown;
}

export interface EnrollmentValidationReport {
  valid: boolean;
  errors: EnrollmentValidationError[];
}

/**
 * Validates a single enrollment record against business rules.
 * Checks: student_count >= 0, capacity >= student_count,
 * snapshot_at is valid ISO date, course_id is non-empty.
 */
export function validateEnrollmentRow(row: {
  student_count?: number | null;
  capacity?: number | null;
  snapshot_at?: string;
  course_id?: string | null;
}): EnrollmentValidationReport {
  const errors: EnrollmentValidationError[] = [];

  // student_count must be >= 0 if present
  if (row.student_count !== undefined && row.student_count !== null) {
    if (typeof row.student_count !== 'number' || Number.isNaN(row.student_count)) {
      errors.push({ field: 'student_count', reason: 'must be a valid number', value: row.student_count });
    } else if (row.student_count < 0) {
      errors.push({ field: 'student_count', reason: 'must be >= 0', value: row.student_count });
    }
  }

  // capacity must be >= student_count when both are present
  if (row.capacity !== undefined && row.capacity !== null && row.student_count !== undefined && row.student_count !== null) {
    if (typeof row.capacity === 'number' && typeof row.student_count === 'number') {
      if (row.capacity < row.student_count) {
        errors.push({
          field: 'capacity',
          reason: `capacity (${row.capacity}) must be >= student_count (${row.student_count})`,
          value: row.capacity,
        });
      }
    }
  }

  // snapshot_at must be a valid ISO-8601 date
  if (row.snapshot_at !== undefined && row.snapshot_at !== null) {
    if (typeof row.snapshot_at !== 'string' || isNaN(Date.parse(row.snapshot_at))) {
      errors.push({
        field: 'snapshot_at',
        reason: 'must be a valid ISO-8601 date string',
        value: row.snapshot_at,
      });
    }
  }

  // course_id must be a non-empty string
  if (!row.course_id || typeof row.course_id !== 'string' || row.course_id.trim() === '') {
    errors.push({
      field: 'course_id',
      reason: 'course_id is required and must be a non-empty string',
      value: row.course_id ?? null,
    });
  }

  return { valid: errors.length === 0, errors };
}
