import { NextRequest, NextResponse } from 'next/server';
import { getChampionOnDate } from '@/lib/beltQueries';

export function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 });
  return NextResponse.json(getChampionOnDate(date));
}
