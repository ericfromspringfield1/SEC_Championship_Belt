import { NextResponse } from 'next/server';
import { getMostReignsLeaderboard } from '@/lib/beltQueries';

export function GET() {
  return NextResponse.json(getMostReignsLeaderboard());
}
