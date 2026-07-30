import { NextResponse } from 'next/server';

const trends = [
  { term: 'FA20', freshman: 520, transfer: 210, grad: 90 },
  { term: 'SP21', freshman: 540, transfer: 195, grad: 105 },
  { term: 'FA21', freshman: 610, transfer: 225, grad: 118 },
  { term: 'SP22', freshman: 590, transfer: 240, grad: 121 },
  { term: 'FA22', freshman: 680, transfer: 255, grad: 132 },
  { term: 'SP23', freshman: 640, transfer: 270, grad: 140 },
  { term: 'FA23', freshman: 730, transfer: 290, grad: 151 },
  { term: 'SP24', freshman: 715, transfer: 305, grad: 158 },
];

export async function GET() {
  return NextResponse.json({ trends: [...trends] });
}
