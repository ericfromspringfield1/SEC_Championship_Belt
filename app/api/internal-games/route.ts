import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get('season');
  const team = req.nextUrl.searchParams.get('team');
  const opponent = req.nextUrl.searchParams.get('opponent');
  const seasonType = req.nextUrl.searchParams.get('seasonType');
  const conferenceGame = req.nextUrl.searchParams.get('conferenceGame');
  const clauses: string[] = [];
  const args: any[] = [];
  if (season) {
    clauses.push('season = ?');
    args.push(Number(season));
  }
  if (team) {
    clauses.push('(homeTeam = ? OR awayTeam = ?)');
    args.push(team, team);
  }
  if (opponent) {
    clauses.push('(homeTeam = ? OR awayTeam = ?)');
    args.push(opponent, opponent);
  }
  if (seasonType) {
    clauses.push('seasonType = ?');
    args.push(seasonType);
  }
  if (conferenceGame) {
    clauses.push('conferenceGame = ?');
    args.push(conferenceGame === 'true' ? 1 : 0);
  }
  const sql = `SELECT * FROM games ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY date DESC LIMIT 500`;
  return NextResponse.json(getDb().prepare(sql).all(...args));
}
