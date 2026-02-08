import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export function GET(req: NextRequest) {
  const team = req.nextUrl.searchParams.get('team');
  const from = req.nextUrl.searchParams.get('from') ?? '1934-01-01';
  const to = req.nextUrl.searchParams.get('to') ?? '2100-01-01';
  const db = getDb();
  const query = team
    ? 'SELECT * FROM title_changes WHERE date BETWEEN ? AND ? AND (new_champ = ? OR old_champ = ?) ORDER BY date'
    : 'SELECT * FROM title_changes WHERE date BETWEEN ? AND ? ORDER BY date';
  const rows = team ? db.prepare(query).all(from, to, team, team) : db.prepare(query).all(from, to);
  return NextResponse.json(rows);
}
