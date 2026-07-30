import { NextResponse } from 'next/server';

const forecast = [
  { term: 'SP24', lower: 1120, actual: 1176, upper: 1210 },
  { term: 'FA24', lower: 1180, actual: 1210, upper: 1280 },
  { term: 'SP25', lower: 1210, actual: null, upper: 1335 },
  { term: 'FA25', lower: 1250, actual: null, upper: 1405 },
  { term: 'SP26', lower: 1275, actual: null, upper: 1455 },
];

const models = ['SeasonalNaive', 'ProphetAlt', 'LightGBM'];

export async function GET() {
  return NextResponse.json({ forecast: [...forecast], models: [...models] });
}
