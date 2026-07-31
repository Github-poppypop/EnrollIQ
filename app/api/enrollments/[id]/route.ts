import { NextResponse } from 'next/server';
import {
  listEnrollmentsByCourse,
  updateEnrollment,
  deleteEnrollment,
} from '@/lib/services/enrollment-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();

    const data = await listEnrollmentsByCourse(id, supabase);
    const row = data[0];

    if (!row) {
      return NextResponse.json(
        { ok: false, data: null, error: 'Enrollment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: row, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    const status = message.includes('JWT') || message.includes('Auth') ? 401 : 500;
    return NextResponse.json({ ok: false, data: null, error: message }, { status });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, data: null, error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { student_count, enrolled, waitlist, capacity } = body as Record<string, unknown>;

    const changes: {
      student_count?: number;
      enrolled?: number;
      waitlist?: number;
      capacity?: number | null;
    } = {};

    if (student_count !== undefined) changes.student_count = student_count as number;
    if (enrolled !== undefined)      changes.enrolled = enrolled as number;
    if (waitlist !== undefined)      changes.waitlist = waitlist as number;
    if (capacity !== undefined)      changes.capacity = capacity as number | null;

    const data = await updateEnrollment(id, changes, supabase);
    return NextResponse.json({ ok: true, data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    const status = message.includes('JWT') || message.includes('Auth') ? 401 : 500;
    return NextResponse.json({ ok: false, data: null, error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();

    await deleteEnrollment(id, supabase);
    return NextResponse.json({ ok: true, data: null, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    const status = message.includes('JWT') || message.includes('Auth') ? 401 : 500;
    return NextResponse.json({ ok: false, data: null, error: message }, { status });
  }
}
