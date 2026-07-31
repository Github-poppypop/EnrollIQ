import { NextResponse } from 'next/server';
import { listEnrollmentsByInstitutionAndTerm } from '@/lib/services/enrollment-service';
import { listForecastsByInstitution } from '@/lib/services/forecast-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({
        metrics: [
          { title: 'Total Enrollment', value: '0', delta: '—', icon: 'Users' },
          { title: 'Avg Capacity Utilization', value: '0.0%', delta: '—', icon: 'Activity' },
          { title: 'Retention Rate', value: '0.0%', delta: '—', icon: 'TrendingUp' },
          { title: 'Model MAE', value: 'N/A', delta: '—', icon: 'BarChart3' },
        ],
        demandCapacity: [],
        scatter: [],
      });
    }

    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institution_id');

    const [enrollments] = await Promise.all([
      institutionId
        ? listEnrollmentsByInstitutionAndTerm(institutionId, undefined, supabase)
        : Promise.resolve([]),
    ]);

    const totalEnrollment = enrollments.reduce((sum, row) => sum + (row.enrolled ?? 0) + (row.waitlist ?? 0), 0);
    const avgCapacityUtil = enrollments.length > 0
      ? enrollments.reduce((sum, row) => sum + ((row.enrolled ?? 0) / (row.capacity ?? 1)), 0) / enrollments.length
      : 0;
    const retentionRate = enrollments.length > 0
      ? enrollments.filter((row) => (row.student_count ?? 0) > 0).length / enrollments.length
      : 0;
    const demandCapacity = (institutionId ? enrollments : []).slice(0, 12).map((row) => ({
      term: row.term,
      actual: row.enrolled + row.waitlist,
      forecast: row.capacity ?? row.enrolled,
    }));

    return NextResponse.json({
      metrics: [
        { title: 'Total Enrollment', value: totalEnrollment.toLocaleString(), delta: '+0%', icon: 'Users' },
        { title: 'Avg Capacity Utilization', value: `${(avgCapacityUtil * 100).toFixed(1)}%`, delta: '+0%', icon: 'Activity' },
        { title: 'Retention Rate', value: `${(retentionRate * 100).toFixed(1)}%`, delta: '+0%', icon: 'TrendingUp' },
        { title: 'Model MAE', value: 'N/A', delta: '—', icon: 'BarChart3' },
      ],
      demandCapacity,
      scatter: demandCapacity.map((d) => ({ term: d.term, demand: d.actual, capacity: d.forecast })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    return NextResponse.json({ ok: false, data: null, error: message }, { status: 500 });
  }
}
