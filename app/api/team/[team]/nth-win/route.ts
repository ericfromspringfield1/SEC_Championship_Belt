import { NextRequest, NextResponse } from 'next/server';
import { getNthBeltWin } from '@/lib/beltQueries';

export function GET(req: NextRequest, { params }: { params: { team: string } }) {
  const n = Number(req.nextUrl.searchParams.get('n') ?? '1');
  return NextResponse.json(getNthBeltWin(decodeURIComponent(params.team), n));
}
