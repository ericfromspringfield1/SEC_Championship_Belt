import { getDb } from './db';
import type { Reign } from './types';

export function getChampionOnDate(date: string) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT r.champ as team, r.start_date as reignStartDate, tc.game_id as lastTitleChangeGame
       FROM reigns r
       LEFT JOIN title_changes tc ON tc.date = r.start_date AND tc.new_champ = r.champ
       WHERE r.start_date <= ? AND (r.end_date IS NULL OR r.end_date >= ?)
       ORDER BY r.start_date DESC
       LIMIT 1`,
    )
    .get(date, date) as { team: string; reignStartDate: string; lastTitleChangeGame: string | null } | undefined;
  return row ?? null;
}

export function getReigns(): Reign[] {
  return getDb().prepare('SELECT * FROM reigns ORDER BY start_date').all() as Reign[];
}

export function getMostReignsLeaderboard() {
  return getDb()
    .prepare(
      `SELECT champ as team, COUNT(*) as reigns, SUM(length_days) as total_days
       FROM reigns
       GROUP BY champ
       ORDER BY reigns DESC, total_days DESC`,
    )
    .all();
}

export function getLongestReigns(limit = 25) {
  return getDb()
    .prepare('SELECT * FROM reigns ORDER BY length_days DESC LIMIT ?')
    .all(limit);
}

export function getNthBeltWin(team: string, n: number) {
  return getDb()
    .prepare(
      `SELECT tc.*, g.winnerTeam, g.loserTeam, g.homeTeam, g.awayTeam
       FROM title_changes tc
       JOIN games g ON tc.game_id = g.id
       WHERE tc.new_champ = ?
       ORDER BY tc.date
       LIMIT 1 OFFSET ?`,
    )
    .get(team, n - 1);
}

export function getTeamSummary(team: string) {
  const db = getDb();
  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM reigns WHERE champ = @team) as reigns,
        (SELECT COALESCE(SUM(length_days),0) FROM reigns WHERE champ = @team) as total_days,
        (SELECT COUNT(*) FROM title_changes WHERE new_champ = @team) as belt_wins,
        (SELECT COUNT(*) FROM title_changes WHERE old_champ = @team) as belt_losses`,
    )
    .get({ team });

  const longest = db.prepare('SELECT * FROM reigns WHERE champ = ? ORDER BY length_days DESC LIMIT 1').get(team);
  const shortest = db.prepare('SELECT * FROM reigns WHERE champ = ? ORDER BY length_days ASC LIMIT 1').get(team);
  const wins = db.prepare('SELECT * FROM title_changes WHERE new_champ = ? ORDER BY date').all(team);
  const losses = db.prepare('SELECT * FROM title_changes WHERE old_champ = ? ORDER BY date').all(team);
  const reignTimeline = db.prepare('SELECT * FROM reigns WHERE champ = ? ORDER BY start_date').all(team);

  return { team, totals, longest, shortest, wins, losses, reignTimeline };
}
