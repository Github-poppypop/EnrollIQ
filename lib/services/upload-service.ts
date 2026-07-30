/**
 * Thin service layer for CSV uploads of enrollment data.
 *
 * Responsible for:
 *   1. Parsing raw CSV strings into typed records.
 *   2. Validating against a lightweight schema.
 *   3. Persisting each validated row via the enrollment service.
 *   4. Uploading files to Supabase Storage.
 *
 * This file does not import the enrollment service directly to prevent a
 * circular dependency risk — instead it accepts a `persist` callback so the
 * caller controls transaction batching.
 */

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface RawEnrollmentRecord {
  institution_slug: string;
  term: string;
  subject: string;
  course_number: string;
  section: string;
  title: string;
  enrolled: number | string;
  waitlist: number | string;
  capacity: number | string;
  snapshot_at?: string; // ISO-8601 — optional; falls back to "now"
}

export interface ParsedUploadResult {
  /** Rows that passed every validation check. */
  valid: RawEnrollmentRecord[];
  /** Rows that failed validation, keyed by row index (0-based). */
  errors: ValidationError[];
}

export interface ValidationError {
  rowIndex: number;
  /** Human-readable reason; e.g. "missing required field: course_number" */
  reason: string;
  /** Optional raw row snapshot for display in the UI. */
  raw?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Persist callback type
// ---------------------------------------------------------------------------

export type PersistCallback = (
  row: RawEnrollmentRecord,
) => Promise<unknown>;

// ---------------------------------------------------------------------------
// parseAndValidateUpload
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS: Array<keyof RawEnrollmentRecord> = [
  'institution_slug',
  'term',
  'subject',
  'course_number',
  'section',
  'title',
  'enrolled',
  'waitlist',
  'capacity',
];

export function parseAndValidateUpload(csvText: string): ParsedUploadResult {
  const lines   = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = splitCsvLine(lines[0]);

  if (headers.length === 0) {
    return { valid: [], errors: [{ rowIndex: 0, reason: 'CSV file is empty' }] };
  }

  const valid:  RawEnrollmentRecord[] = [];
  const errors: ValidationError[]     = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lineToObject(headers, splitCsvLine(lines[i]));
    const rowErrors = validateRow(row as unknown as Record<string, string>, i);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      valid.push(row);
    }
  }

  return { valid, errors };
}

// ---------------------------------------------------------------------------
// persistUploadResult
// ---------------------------------------------------------------------------

/**
 * Iterates over the valid rows and calls `persist` for each.
 * Rejects on the first failure — the caller decides whether to batch or
 * short-circuit.
 */
export async function persistUploadResult(
  result: ParsedUploadResult,
  persist: PersistCallback,
): Promise<{ persisted: number; failed: Array<{ index: number; error: Error }> }> {
  let persisted = 0;
  const failed: Array<{ index: number; error: Error }> = [];

  for (const row of result.valid) {
    try {
      await persist(row);
      persisted++;
    } catch (err) {
      failed.push({
        index: result.valid.indexOf(row),
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  return { persisted, failed };
}

// ---------------------------------------------------------------------------
// Upload to Supabase Storage
// ---------------------------------------------------------------------------

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function getStorageClient(override?: SupabaseClient): SupabaseClient {
  return override ?? createSupabaseBrowserClient();
}

export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: File,
  client?: SupabaseClient,
): Promise<{ path: string }> {
  const db = getStorageClient(client);

  const { data, error } = await db.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return { path: data.path };
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function lineToObject(headers: string[], values: string[]): RawEnrollmentRecord {
  const obj = {} as RawEnrollmentRecord;

  for (let i = 0; i < headers.length; i++) {
    const key   = headers[i].toLowerCase().trim().replace(/\s+/g, '_') as keyof RawEnrollmentRecord;
    const value = values[i]?.trim() ?? '';
    (obj as any)[key] = value;
  }

  return obj;
}

function coerceNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  const parsed = parseInt(value ?? '0', 10);
  if (Number.isNaN(parsed)) throw new Error(`expected a number, got "${value}"`);
  return parsed;
}

function validateRow(
  row: Record<string, string>,
  rowIndex: number,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of REQUIRED_FIELDS) {
    // field names in the CSV may use spaces; normalise for lookup
    const key = Object.keys(row).find(
      (k) => k.toLowerCase().replace(/\s+/g, '_') === field,
    );
    const value = key ? row[key] : undefined;

    if (value === undefined || value === '') {
      errors.push({
        rowIndex,
        reason: `missing required field: ${field}`,
        raw: row,
      });
    }
  }

  // Numeric fields must be parseable — collect all numeric errors in one pass
  const numericFields: Array<{ field: string; key: string }> = [
    { field: 'enrolled',  key: 'enrolled'  },
    { field: 'waitlist',  key: 'waitlist'  },
    { field: 'capacity',  key: 'capacity'  },
  ];

  for (const { field, key } of numericFields) {
    const rawValue = Object.entries(row).find(
      ([k]) => k.toLowerCase().replace(/\s+/g, '_') === key,
    )?.[1];

    if (rawValue !== undefined && rawValue !== '') {
      try {
        coerceNumber(rawValue);
      } catch (err) {
        errors.push({
          rowIndex,
          reason: `field "${field}" must be a number, got "${rawValue}"`,
          raw: row,
        });
      }
    }
  }

  return errors;
}
