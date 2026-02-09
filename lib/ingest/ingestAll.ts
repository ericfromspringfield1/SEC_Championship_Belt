import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { isSecMember } from '@/lib/membership';
import { simulateBelt, sortGamesDeterministically } from '@/lib/simulation';
import type { Game } from '@/lib/types';

const repoDataDir = path.join(process.cwd(), 'data');
const historicalJsonPath = path.join(repoDataDir, 'sec_games_1934_2023.json');

export const REQUIRED_TABLES = ['games', 'title_changes', 'reigns'] as const;

export function hasRequiredTables(dbPath: string) {
  if (!fs.existsSync(dbPath)) return false;

  const db = new Database(dbPath, { readonly: true });
  try {
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('games','title_changes','reigns')")
      .all() as Array<{ name: string }>;
    const present = new Set(rows.map((r) => r.name));
    return REQUIRED_TABLES.every((tableName) => present.has(tableName));
  } finally {
    db.close();
  }
}

function normalizeSeasonType(raw: string | undefined, notes?: string): 'regular' | 'not-regular' {
  const value = `${raw ?? ''} ${notes ?? ''}`.toLowerCase();
  if (value.includes('post') || value.includes('bowl') || value.includes('championship') || value.includes('playoff')) return 'not-regular';
  return 'regular';
}

function deriveSeason(date: string, provided?: number): number {
  if (provided && Number.isFinite(provided)) return provided;
  return Number(date.slice(0, 4));
}

function normalizeDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function getArrayPayload(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.events)) return (data as any).events;
  if (Array.isArray((data as any)?.games)) return (data as any).games;
  if (Array.isArray((data as any)?.data)) return (data as any).data;
  return [];
}

function gameFromJson(item: any, source: string, idx: number): Game | null {
  const homeTeam = item.homeTeam ?? item.home_team ?? item.home?.name ?? item.home;
  const awayTeam = item.awayTeam ?? item.away_team ?? item.away?.name ?? item.away;
  const homeScore = Number(item.homeScore ?? item.home_score ?? item.home?.score ?? 0);
  const awayScore = Number(item.awayScore ?? item.away_score ?? item.away?.score ?? 0);
  const date = normalizeDate(item.date ?? item.startDate ?? item.gameDate);
  const season = deriveSeason(date, Number(item.season));
  const seasonType = normalizeSeasonType(item.seasonType ?? item.type ?? item.season_type, item.notes);

  if (!homeTeam || !awayTeam || !date || homeScore === awayScore) return null;

  const winnerHome = homeScore > awayScore;
  return {
    id: `${source}-${item.id ?? idx}`,
    date,
    season,
    seasonType,
    conferenceGame: isSecMember(homeTeam, season) && isSecMember(awayTeam, season),
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    winnerTeam: winnerHome ? homeTeam : awayTeam,
    loserTeam: winnerHome ? awayTeam : homeTeam,
    winnerScore: Math.max(homeScore, awayScore),
    loserScore: Math.min(homeScore, awayScore),
    source,
    sourceIndex: idx,
    notes: item.notes ?? null,
    noWinnerOrLoser: false,
  };
}

function setupSchema(db: Database.Database) { /* unchanged sql */
  db.exec(`
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS title_changes;
    DROP TABLE IF EXISTS reigns;
    CREATE TABLE games (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      season INTEGER NOT NULL,
      seasonType TEXT NOT NULL,
      conferenceGame INTEGER,
      homeTeam TEXT NOT NULL,
      awayTeam TEXT NOT NULL,
      homeScore INTEGER NOT NULL,
      awayScore INTEGER NOT NULL,
      winnerTeam TEXT NOT NULL,
      loserTeam TEXT NOT NULL,
      winnerScore INTEGER NOT NULL,
      loserScore INTEGER NOT NULL,
      source TEXT NOT NULL,
      sourceIndex INTEGER NOT NULL,
      notes TEXT,
      noWinnerOrLoser INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE title_changes (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      season INTEGER NOT NULL,
      new_champ TEXT NOT NULL,
      old_champ TEXT NOT NULL,
      score TEXT NOT NULL,
      game_id TEXT NOT NULL,
      eligible_reason TEXT NOT NULL
    );
    CREATE TABLE reigns (
      id TEXT PRIMARY KEY,
      champ TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      length_days INTEGER NOT NULL,
      defenses INTEGER NOT NULL,
      ended_by_team TEXT,
      end_game_id TEXT,
      reign_index_for_team INTEGER NOT NULL
    );
    CREATE INDEX idx_games_date ON games(date);
    CREATE INDEX idx_games_winner ON games(winnerTeam);
    CREATE INDEX idx_games_loser ON games(loserTeam);
    CREATE INDEX idx_games_home ON games(homeTeam);
    CREATE INDEX idx_games_away ON games(awayTeam);
    CREATE INDEX idx_games_season ON games(season);
    CREATE INDEX idx_tc_date ON title_changes(date);
    CREATE INDEX idx_tc_new ON title_changes(new_champ);
    CREATE INDEX idx_tc_old ON title_changes(old_champ);
    CREATE INDEX idx_reigns_champ ON reigns(champ);
    CREATE INDEX idx_reigns_start ON reigns(start_date);
    CREATE INDEX idx_reigns_end ON reigns(end_date);
  `);
}

function insertData(db: Database.Database, games: Game[]) {
  const insertGame = db.prepare('INSERT INTO games VALUES (@id,@date,@season,@seasonType,@conferenceGame,@homeTeam,@awayTeam,@homeScore,@awayScore,@winnerTeam,@loserTeam,@winnerScore,@loserScore,@source,@sourceIndex,@notes,@noWinnerOrLoser)');
  const tx = db.transaction((rows: Game[]) => {
    for (const row of rows) {
      insertGame.run({ ...row, conferenceGame: row.conferenceGame === null ? null : row.conferenceGame ? 1 : 0, noWinnerOrLoser: row.noWinnerOrLoser ? 1 : 0 });
    }
  });
  tx(games);
}

function insertSimulation(db: Database.Database, games: Game[]) {
  const { titleChanges, reigns } = simulateBelt(games);
  const insertTC = db.prepare('INSERT INTO title_changes VALUES (@id,@date,@season,@new_champ,@old_champ,@score,@game_id,@eligible_reason)');
  const insertReign = db.prepare('INSERT INTO reigns VALUES (@id,@champ,@start_date,@end_date,@length_days,@defenses,@ended_by_team,@end_game_id,@reign_index_for_team)');
  const tx = db.transaction(() => {
    for (const tc of titleChanges) insertTC.run(tc);
    for (const reign of reigns) insertReign.run(reign);
  });
  tx();
}


function loadHistoricalGames(): Game[] {
  if (!fs.existsSync(historicalJsonPath)) {
    throw new Error(`Missing required historical source data at ${historicalJsonPath}.`);
  }

  const payload = getArrayPayload(JSON.parse(fs.readFileSync(historicalJsonPath, 'utf8')));
  return payload
    .map((it, idx) => gameFromJson(it, 'json1934_2023', idx))
    .filter(Boolean) as Game[];
}

export function ingestAll(dbPath: string, options?: { forceRebuild?: boolean }) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (options?.forceRebuild && fs.existsSync(dbPath)) fs.rmSync(dbPath);

  const db = new Database(dbPath);
  try {
    setupSchema(db);

    const allGames = sortGamesDeterministically(loadHistoricalGames());

    insertData(db, allGames);

    insertSimulation(db, allGames);
    console.log(`Ingest complete. Games=${allGames.length}`);
  } finally {
    db.close();
  }
}
