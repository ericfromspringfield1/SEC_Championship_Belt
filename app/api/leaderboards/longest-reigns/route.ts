import { NextRequest, NextResponse } from 'next/server';
import { getLongestReigns } from '@/lib/beltQueries';

export function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '25');
  return NextResponse.json(getLongestReigns(limit));
}
