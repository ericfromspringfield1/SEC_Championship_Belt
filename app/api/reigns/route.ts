import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export function GET(req: NextRequest) {
  const team = req.nextUrl.searchParams.get('team');
  const db = getDb();
  const rows = team ? db.prepare('SELECT * FROM reigns WHERE champ = ? ORDER BY start_date').all(team) : db.prepare('SELECT * FROM reigns ORDER BY start_date').all();
  return NextResponse.json(rows);
}
