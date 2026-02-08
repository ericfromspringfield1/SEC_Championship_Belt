import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import * as XLSX from 'xlsx';
import { isSecMember } from '../lib/membership';
import { simulateBelt, sortGamesDeterministically } from '../lib/simulation';
import type { Game } from '../lib/types';
import { diffLedger } from '../lib/validation';

const DB_PATH = path.join(process.cwd(), 'data', 'sec-belt.sqlite');

const csvPaths = [
  '/mnt/data/SECFootball1934-1960.csv',
  '/mnt/data/SECFootball1961-1981.csv',
  '/mnt/data/SECFootball1982-2023.csv',
];

const jsonTeamsPath = '/mnt/data/response_1770516432120.json';
const json2024Path = '/mnt/data/response_1770516699071.json';
const json2025Path = '/mnt/data/response_1770516804124.json';
const ledgerPath = '/mnt/data/EveryTitleChange1934-2023.xlsx';

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    return row;
  });
}

function normalizeSeasonType(raw: string | undefined, notes?: string): 'regular' | 'not-regular' {
  const value = `${raw ?? ''} ${notes ?? ''}`.toLowerCase();
  if (value.includes('post') || value.includes('bowl') || value.includes('championship') || value.includes('playoff')) {
    return 'not-regular';
  }
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

function gameFromCsvRow(row: Record<string, string>, source: string, idx: number): Game | null {
  if ((row['No Winner or Loser'] ?? '').toLowerCase() === 'true') {
    return {
      id: `${source}-${idx}`,
      date: normalizeDate(row.Date),
      season: deriveSeason(normalizeDate(row.Date)),
      seasonType: 'regular',
      conferenceGame: null,
      homeTeam: row.Winner,
      awayTeam: row.Loser,
      homeScore: Number(row['Winner Points'] || 0),
      awayScore: Number(row['Loser Points'] || 0),
      winnerTeam: row.Winner,
      loserTeam: row.Loser,
      winnerScore: Number(row['Winner Points'] || 0),
      loserScore: Number(row['Loser Points'] || 0),
      source,
      sourceIndex: idx,
      notes: row.Notes,
      noWinnerOrLoser: true,
    };
  }
  const date = normalizeDate(row.Date);
  const season = deriveSeason(date);
  const winnerTeam = row.Winner;
  const loserTeam = row.Loser;
  const winnerScore = Number(row['Winner Points'] || 0);
  const loserScore = Number(row['Loser Points'] || 0);
  const seasonType = normalizeSeasonType(undefined, row.Notes);
  const conferenceGame = isSecMember(winnerTeam, season) && isSecMember(loserTeam, season);

  if (!winnerTeam || !loserTeam || !date) return null;

  return {
    id: `${source}-${idx}`,
    date,
    season,
    seasonType,
    conferenceGame,
    homeTeam: winnerTeam,
    awayTeam: loserTeam,
    homeScore: winnerScore,
    awayScore: loserScore,
    winnerTeam,
    loserTeam,
    winnerScore,
    loserScore,
    source,
    sourceIndex: idx,
    notes: row.Notes,
    noWinnerOrLoser: false,
  };
}

function getArrayPayload(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.games)) return data.games;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function gameFromJson(item: any, source: string, idx: number): Game | null {
  const homeTeam = item.homeTeam ?? item.home_team ?? item.home?.name ?? item.home;
  const awayTeam = item.awayTeam ?? item.away_team ?? item.away?.name ?? item.away;
  const homeScore = Number(item.homeScore ?? item.home_score ?? item.home?.score ?? 0);
  const awayScore = Number(item.awayScore ?? item.away_score ?? item.away?.score ?? 0);
  const date = normalizeDate(item.date ?? item.startDate ?? item.gameDate);
  const season = deriveSeason(date, Number(item.season));
  const confGame = item.conferenceGame ?? item.conference_game ?? null;
  const seasonType = normalizeSeasonType(item.seasonType ?? item.type ?? item.season_type);

  if (!homeTeam || !awayTeam || !date || homeScore === awayScore) return null;

  const winnerHome = homeScore > awayScore;
  return {
    id: `${source}-${item.id ?? idx}`,
    date,
    season,
    seasonType,
    conferenceGame: confGame === null ? null : Boolean(confGame),
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
    notes: null,
    noWinnerOrLoser: false,
  };
}

function setupSchema(db: Database.Database) {
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
  const insertGame = db.prepare(`
    INSERT INTO games VALUES (@id,@date,@season,@seasonType,@conferenceGame,@homeTeam,@awayTeam,@homeScore,@awayScore,@winnerTeam,@loserTeam,@winnerScore,@loserScore,@source,@sourceIndex,@notes,@noWinnerOrLoser)
  `);
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
  return titleChanges;
}

function validateAgainstLedger(titleChanges: any[], limitThroughSeason: number) {
  const wb = XLSX.readFile(ledgerPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  const expected = rows.map((r) => ({
    date: normalizeDate(String(r.Date ?? r.date)),
    new_champ: String(r.Winner ?? r.winner).trim(),
    old_champ: String(r.Loser ?? r.loser).trim(),
    score: `${r['Winner Points'] ?? r.WinnerPoints ?? r.winnerPoints}-${r['Loser Points'] ?? r.LoserPoints ?? r.loserPoints}`,
  }));

  const actual = titleChanges
    .filter((tc) => tc.season <= limitThroughSeason)
    .map((tc) => ({ date: tc.date, new_champ: tc.new_champ, old_champ: tc.old_champ, score: tc.score }));

  const mismatches = diffLedger(expected, actual, 50);
  if (mismatches.length > 0) {
    console.error('Validation mismatch against ledger. First mismatches:');
    mismatches.forEach((m) => console.error(m));
    process.exit(1);
  }

  console.log(`Validation passed against ledger with ${actual.length} title changes.`);
}

function main() {
  const db = new Database(DB_PATH);
  setupSchema(db);

  const csvGames = csvPaths.flatMap((p) => parseCsv(p).map((row, idx) => gameFromCsvRow(row, path.basename(p), idx)).filter(Boolean) as Game[]);
  const jsonTeams = JSON.parse(fs.readFileSync(jsonTeamsPath, 'utf8'));
  if (jsonTeams) {
    // loaded for optional cross-check availability
  }
  const games2024 = getArrayPayload(JSON.parse(fs.readFileSync(json2024Path, 'utf8')))
    .map((it, idx) => gameFromJson(it, 'json2024', idx))
    .filter(Boolean) as Game[];
  const games2025 = getArrayPayload(JSON.parse(fs.readFileSync(json2025Path, 'utf8')))
    .map((it, idx) => gameFromJson(it, 'json2025', idx))
    .filter(Boolean) as Game[];

  const allGames = sortGamesDeterministically([...csvGames, ...games2024, ...games2025]);
  insertData(db, allGames);

  const firstPassChanges = simulateBelt(sortGamesDeterministically(csvGames)).titleChanges;
  validateAgainstLedger(firstPassChanges, 2023);

  insertSimulation(db, allGames);
  console.log(`Ingest complete. Games=${allGames.length}`);
  db.close();
}

main();
