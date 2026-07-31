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
// Types aligned to the migration schema v2.
// JSONB columns are typed precisely rather than `any` to guide the API surface.
// ---------------------------------------------------------------------------

/** Per-model sub-forecast inside an ensemble */
export interface SubForecast {
  model: string;
  value: number;
  confidence: number; // 0..1
}

/** Metadata about the model that produced a forecast */
export interface ForecastMetadata {
  model_name: string;
  model_version: string;
  training_date: string; // ISO-8601 date
  rmse?: number;
  mae?: number;
  feature_importance?: Record<string, number>; // JSONB
}

/** Raw model output with confidence intervals and feature weights */
export interface ForecastInput {
  institution_id: string;
  course_id?: string | null;
  model: string;
  horizon: Record<string, unknown>;
  predictions: Record<string, unknown> | SubForecast[];
  /** Optional metadata about the model that generated this forecast */
  metadata?: ForecastMetadata;
}

/** A row from the public.forecasts table (schema v2 columns) */
export interface ForecastRow {
  id: string;
  institution_id: string;
  course_id: string | null;
  model: string;
  horizon: Record<string, unknown>;
  predictions: SubForecast[] | Record<string, unknown>;
  created_at: string;
  metadata: ForecastMetadata | null;
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
  horizon: Record<string, unknown>;
  predictions: Record<string, unknown> | SubForecast[];
  metadata?: ForecastMetadata;
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

// ---------------------------------------------------------------------------
// persistForecast — validates forecast shape before inserting
// ---------------------------------------------------------------------------

/** Validates that ForecastMetadata fields are well-formed. */
export function validateForecastMetadata(
  metadata: ForecastMetadata | undefined,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (metadata) {
    if (!metadata.model_name || typeof metadata.model_name !== 'string') {
      errors.push('metadata.model_name is required and must be a string');
    }
    if (!metadata.model_version || typeof metadata.model_version !== 'string') {
      errors.push('metadata.model_version is required and must be a string');
    }
    if (!metadata.training_date || isNaN(Date.parse(metadata.training_date))) {
      errors.push('metadata.training_date must be a valid ISO-8601 date');
    }
    if (metadata.rmse !== undefined && (typeof metadata.rmse !== 'number' || metadata.rmse < 0)) {
      errors.push('metadata.rmse must be a non-negative number');
    }
    if (metadata.mae !== undefined && (typeof metadata.mae !== 'number' || metadata.mae < 0)) {
      errors.push('metadata.mae must be a non-negative number');
    }
    if (
      metadata.feature_importance !== undefined &&
      (typeof metadata.feature_importance !== 'object' || metadata.feature_importance === null)
    ) {
      errors.push('metadata.feature_importance must be a JSON object');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates forecast shape, then inserts via createForecast.
 * Returns the persisted row with all joined fields resolved.
 */
export async function persistForecast(
  input: ForecastInput,
  client?: SupabaseClient,
): Promise<ForecastRow> {
  if (!input.institution_id || typeof input.institution_id !== 'string') {
    throw new Error('persistForecast: institution_id is required and must be a string');
  }
  if (!input.model || typeof input.model !== 'string') {
    throw new Error('persistForecast: model is required and must be a string');
  }
  if (!input.horizon || typeof input.horizon !== 'object' || Array.isArray(input.horizon)) {
    throw new Error('persistForecast: horizon must be a non-null, non-array object');
  }
  if (!input.predictions) {
    throw new Error('persistForecast: predictions is required');
  }

  const metaCheck = validateForecastMetadata(input.metadata);
  if (!metaCheck.valid) {
    throw new Error(`persistForecast: invalid metadata — ${metaCheck.errors.join('; ')}`);
  }

  // If predictions is an array of SubForecast, validate each entry
  if (Array.isArray(input.predictions)) {
    for (let i = 0; i < input.predictions.length; i++) {
      const sf = input.predictions[i];
      if (!sf.model || typeof sf.model !== 'string') {
        throw new Error(`persistForecast: sub-forecast[${i}].model is required`);
      }
      if (typeof sf.value !== 'number' || Number.isNaN(sf.value)) {
        throw new Error(`persistForecast: sub-forecast[${i}].value must be a number`);
      }
      if (typeof sf.confidence !== 'number' || sf.confidence < 0 || sf.confidence > 1) {
        throw new Error(`persistForecast: sub-forecast[${i}].confidence must be between 0 and 1`);
      }
    }
  }

  // Embed metadata into predictions JSONB when predictions is a plain object
  let predictionsToStore: Record<string, unknown> | SubForecast[] = input.predictions;
  if (input.metadata && !Array.isArray(input.predictions)) {
    predictionsToStore = {
      ...((input.predictions as Record<string, unknown>) ?? {}),
      _metadata: input.metadata,
    };
  }

  return createForecast(
    {
      institution_id: input.institution_id,
      course_id: input.course_id ?? null,
      model: input.model,
      horizon: input.horizon,
      predictions: predictionsToStore,
    },
    client,
  );
}
