/**
 * Thin service layer for the forecasts table and its related course/institution data.
 *
 * Uses the existing Supabase browser client factory. RLS currently allows full
 * access; institution scoping will be layered in via future migrations.
 *
 * All functions accept an optional `client` parameter so they can also be used
 * from server-side API routes with the server Supabase client.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types aligned to the migration schema.  JSONB columns are typed as `any`
// to keep the layer thin at this stage — the migration does not constrain
// the shape of `horizon` or `predictions`.
// ---------------------------------------------------------------------------

export interface ForecastRow {
  id: string;
  institution_id: string;
  course_id: string | null;
  model: string;
  horizon: any;
  predictions: any;
  created_at: string;
  // joined fields
  institution_name: string;
  subject: string | null;
  course_number: string | null;
  section: string | null;
  title: string | null;
}

export interface CreateForecastInput {
  institution_id: string;
  course_id?: string | null;
  model: string;
  horizon: any;
  predictions: any;
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function getClient(override?: SupabaseClient): SupabaseClient {
  return override ?? createSupabaseBrowserClient();
}

// ---------------------------------------------------------------------------
// listForecastsByInstitution
// ---------------------------------------------------------------------------

export async function listForecastsByInstitution(
  institutionId: string,
  courseId?: string,
  client?: SupabaseClient,
): Promise<ForecastRow[]> {
  const db = getClient(client);

  let query = db
    .from('forecasts')
    .select(
      `
      id,
      institution_id,
      course_id,
      model,
      horizon,
      predictions,
      created_at,
      institutions!inner (id, name),
      courses!left (
        id,
        subject,
        course_number,
        section,
        title
      )
    `,
    )
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, any>) => {
    const institution = row.institutions as { id: string; name: string };
    const course = row.courses as
      | { id: string; subject: string; course_number: string; section: string | null; title: string | null }
      | null;

    return {
      id: row.id,
      institution_id: row.institution_id,
      course_id: row.course_id,
      model: row.model,
      horizon: row.horizon,
      predictions: row.predictions,
      created_at: row.created_at,
      institution_name: institution.name,
      subject:           course?.subject         ?? null,
      course_number:     course?.course_number    ?? null,
      section:           course?.section          ?? null,
      title:             course?.title            ?? null,
    } as ForecastRow;
  });
}

// ---------------------------------------------------------------------------
// getForecastById
// ---------------------------------------------------------------------------

export async function getForecastById(
  forecastId: string,
  client?: SupabaseClient,
): Promise<ForecastRow | null> {
  const db = getClient(client);

  const { data, error } = await db
    .from('forecasts')
    .select(
      `
      id,
      institution_id,
      course_id,
      model,
      horizon,
      predictions,
      created_at,
      institutions!inner (id, name),
      courses!left (
        id,
        subject,
        course_number,
        section,
        title
      )
    `,
    )
    .eq('id', forecastId)
    .single();

  if (error) {
    // Supabase returns PGRST116 ("no row") as an error with code !== 0.
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  if (!data) return null;

  const row = data as Record<string, any>;
  const institution = row.institutions as { id: string; name: string };
  const course = row.courses as
    | { id: string; subject: string; course_number: string; section: string | null; title: string | null }
    | null;

  return {
    id: row.id,
    institution_id: row.institution_id,
    course_id: row.course_id,
    model: row.model,
    horizon: row.horizon,
    predictions: row.predictions,
    created_at: row.created_at,
    institution_name: institution.name,
    subject:           course?.subject         ?? null,
    course_number:     course?.course_number    ?? null,
    section:           course?.section          ?? null,
    title:             course?.title            ?? null,
  } as ForecastRow;
}

// ---------------------------------------------------------------------------
// createForecast
// ---------------------------------------------------------------------------

export async function createForecast(
  input: CreateForecastInput,
  client?: SupabaseClient,
): Promise<ForecastRow> {
  const db = getClient(client);

  const { data, error } = await db
    .from('forecasts')
    .insert({
      institution_id: input.institution_id,
      course_id:      input.course_id ?? null,
      model:          input.model,
      horizon:        input.horizon,
      predictions:    input.predictions,
    })
    .select(
      `
      id,
      institution_id,
      course_id,
      model,
      horizon,
      predictions,
      created_at,
      institutions!inner (id, name),
      courses!left (
        id,
        subject,
        course_number,
        section,
        title
      )
    `,
    )
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('createForecast: insert returned no row');
  }

  const row = data as Record<string, any>;
  const institution = row.institutions as { id: string; name: string };
  const course = row.courses as
    | { id: string; subject: string; course_number: string; section: string | null; title: string | null }
    | null;

  return {
    id: row.id,
    institution_id: row.institution_id,
    course_id: row.course_id,
    model: row.model,
    horizon: row.horizon,
    predictions: row.predictions,
    created_at: row.created_at,
    institution_name: institution.name,
    subject:           course?.subject         ?? null,
    course_number:     course?.course_number    ?? null,
    section:           course?.section          ?? null,
    title:             course?.title            ?? null,
  } as ForecastRow;
}
