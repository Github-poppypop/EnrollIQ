import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || !body.institution_id) {
      return NextResponse.json(
        { ok: false, data: null, error: 'Invalid JSON body: institution_id is required' },
        { status: 400 },
      );
    }

    const institution_id = String(body.institution_id);
    const adjustments = (body.adjustments ?? {}) as Record<string, number>;

    const capacity_change = Number(adjustments.capacity_change_pct ?? 0);
    const waitlist_change = Number(adjustments.waitlist_change_pct ?? 0);
    const enrollment_estimate = Number(adjustments.new_enrollment_estimate ?? 0);

    const baseline = {
      upper: 1405,
      lower: 1210,
      expected: 1300,
    };

    const adjusted = {
      upper: Math.round(baseline.upper * (1 + capacity_change / 100) + waitlist_change),
      lower: Math.round(baseline.lower * (1 + capacity_change / 100) + waitlist_change),
      expected: Math.round(enrollment_estimate || baseline.expected * (1 + capacity_change / 100)),
    };

    return NextResponse.json({
      ok: true,
      data: {
        institution_id,
        baseline,
        adjustments,
        adjusted,
        model: 'ScenarioSimulation',
        created_at: new Date().toISOString(),
      },
      error: null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    return NextResponse.json({ ok: false, data: null, error: message }, { status: 500 });
  }
}
