import { NextResponse } from 'next/server';
import {
  listEnrollmentsByCourse,
  listEnrollmentsByInstitutionAndTerm,
  createEnrollment,
  type EnrollmentRow,
} from '@/lib/services/enrollment-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ListQuery = {
  course_id?: string;
  institution_id?: string;
  term?: string;
};

async function resolveEnrollmentList(
  input: ListQuery,
): Promise<EnrollmentRow[]> {
  const supabase = await createSupabaseServerClient();

  if (input.course_id) {
    return listEnrollmentsByCourse(input.course_id, supabase);
  }

  if (input.institution_id) {
    return listEnrollmentsByInstitutionAndTerm(input.institution_id, input.term, supabase);
  }

  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const data = await resolveEnrollmentList({
      course_id: searchParams.get('course_id') ?? undefined,
      institution_id: searchParams.get('institution_id') ?? undefined,
      term: searchParams.get('term') ?? undefined,
    });

    return NextResponse.json({ ok: true, data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    const status = message.includes('JWT') || message.includes('Auth') ? 401 : 500;
    return NextResponse.json({ ok: false, data: null, error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, data: null, error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { course_id, enrolled, waitlist, snapshot_at, student_count, capacity } = body as Record<
      string,
      unknown
    >;

    if (!course_id || typeof course_id !== 'string') {
      return NextResponse.json(
        { ok: false, data: null, error: 'course_id is required' },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const data = await createEnrollment(
      {
        course_id,
        enrolled: (enrolled as number) ?? 0,
        waitlist: (waitlist as number) ?? 0,
        snapshot_at: snapshot_at as string | undefined,
        student_count: student_count as number | undefined,
        capacity: capacity as number | undefined,
      },
      supabase,
    );

    return NextResponse.json({ ok: true, data, error: null }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    const status = message.includes('JWT') || message.includes('Auth') ? 401 : 500;
    return NextResponse.json({ ok: false, data: null, error: message }, { status });
  }
}
