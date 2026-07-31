import { NextResponse } from 'next/server';

const heatmap = [
  { term: 'FA20', segment: 'freshman', value: 520 },
  { term: 'FA20', segment: 'transfer', value: 210 },
  { term: 'FA20', segment: 'grad', value: 90 },
  { term: 'SP21', segment: 'freshman', value: 540 },
  { term: 'SP21', segment: 'transfer', value: 195 },
  { term: 'SP21', segment: 'grad', value: 105 },
  { term: 'FA21', segment: 'freshman', value: 610 },
  { term: 'FA21', segment: 'transfer', value: 225 },
  { term: 'FA21', segment: 'grad', value: 118 },
  { term: 'SP22', segment: 'freshman', value: 590 },
  { term: 'SP22', segment: 'transfer', value: 240 },
  { term: 'SP22', segment: 'grad', value: 121 },
  { term: 'FA22', segment: 'freshman', value: 680 },
  { term: 'FA22', segment: 'transfer', value: 255 },
  { term: 'FA22', segment: 'grad', value: 132 },
  { term: 'SP23', segment: 'freshman', value: 640 },
  { term: 'SP23', segment: 'transfer', value: 270 },
  { term: 'SP23', segment: 'grad', value: 140 },
  { term: 'FA23', segment: 'freshman', value: 730 },
  { term: 'FA23', segment: 'transfer', value: 290 },
  { term: 'FA23', segment: 'grad', value: 151 },
  { term: 'SP24', segment: 'freshman', value: 715 },
  { term: 'SP24', segment: 'transfer', value: 305 },
  { term: 'SP24', segment: 'grad', value: 158 },
];

export async function GET() {
  return NextResponse.json([...heatmap]);
}
