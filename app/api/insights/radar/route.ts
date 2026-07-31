import { NextResponse } from 'next/server';

const radarDimensions = [
  { name: 'Enrollment', value: 85 },
  { name: 'Retention', value: 91 },
  { name: 'Revenue', value: 78 },
  { name: 'Diversity', value: 72 },
  { name: 'Engagement', value: 88 },
] as const;

export async function GET() {
  return NextResponse.json([...radarDimensions]);
}
