import { NextResponse } from 'next/server';

const metrics = [
  { title: 'Enrollment', value: '1,284', delta: '+4.2%', icon: 'Users' },
  { title: 'Avg Credits', value: '14.7', delta: '+0.3', icon: 'BookOpen' },
  { title: 'Retention', value: '91.4%', delta: '+1.1%', icon: 'TrendingUp' },
  { title: 'Model MAE', value: '38', delta: '-12%', icon: 'BarChart3' },
] as const;

const demandCapacity = [
  { term: 'FA22', actual: 980, forecast: 970 },
  { term: 'SP23', actual: 1024, forecast: 1010 },
  { term: 'FA23', actual: 1102, forecast: 1095 },
  { term: 'SP24', actual: 1176, forecast: 1188 },
  { term: 'FA24', actual: 1210, forecast: 1240 },
];

export async function GET() {
  return NextResponse.json({ metrics: [...metrics], demandCapacity: [...demandCapacity] });
}
