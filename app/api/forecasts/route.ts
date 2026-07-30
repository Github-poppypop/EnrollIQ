import { NextResponse } from 'next/server';
import { listForecastsByInstitution, createForecast } from '@/lib/services/forecast-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const institutionId = searchParams.get('institution_id');
    const courseId = searchParams.get('course_id');

    if (!institutionId) {
      return NextResponse.json(
        { ok: false, data: null, error: 'institution_id query parameter is required' },
        { status: 400 },
      );
    }

    const data = await listForecastsByInstitution(institutionId, courseId ?? undefined, supabase);
    return NextResponse.json({ ok: true, data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    const status = message.includes('JWT') || message.includes('Auth') ? 401 : 500;
    return NextResponse.json({ ok: false, data: null, error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, data: null, error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { institution_id, course_id, model, horizon, predictions } = body as Record<
      string,
      unknown
    >;

    if (!institution_id || typeof institution_id !== 'string') {
      return NextResponse.json(
        { ok: false, data: null, error: 'institution_id is required' },
        { status: 400 },
      );
    }

    if (!model || typeof model !== 'string') {
      return NextResponse.json(
        { ok: false, data: null, error: 'model is required' },
        { status: 400 },
      );
    }

    const data = await createForecast(
      {
        institution_id,
        course_id: course_id as string | undefined,
        model,
        horizon: horizon as Record<string, unknown>,
        predictions: predictions as Record<string, unknown>,
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
