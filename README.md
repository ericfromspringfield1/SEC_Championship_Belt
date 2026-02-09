# SEC Football Championship Belt

Production-ready Next.js app + SQLite ingestion pipeline for tracking the SEC football championship belt from 1934 through 2025.

## Stack
- Next.js (App Router) + React + TypeScript + Tailwind
- SQLite via better-sqlite3
- Vitest unit tests

## Setup
```bash
npm install
npm run dev
```

`npm run dev` now auto-bootstraps `data/sec-belt.sqlite` on first run if the DB is missing or incomplete (`games`, `title_changes`, `reigns`).

Bundled historical input is read from `data/sec_games_1934_2023.json` (1934–2023). Optional season extensions can be added at `data/sec_games_2024.json` and `data/sec_games_2025.json`.

## Rebuild / Refresh Data
```bash
npm run ingest
```

`npm run ingest` remains the explicit full rebuild command and always recreates `data/sec-belt.sqlite` from configured source files.

## Ingestion
`npm run ingest` will:
1. Read bundled historical JSON:
   - `data/sec_games_1934_2023.json`
2. Optionally read additional JSON seasons when present:
   - `data/sec_games_2024.json`
   - `data/sec_games_2025.json`
3. Validate simulated title changes through 2023 when ledger is available:
   - `data/EveryTitleChange1934-2023.xlsx` (preferred)
   - `/mnt/data/EveryTitleChange1934-2023.xlsx` (legacy fallback)
4. Rebuild SQLite tables and compute title changes + reigns through 2025.

If validation mismatches are found, a diff report (first 50 mismatches) is printed and ingest exits non-zero.

## Authoritative Eligibility Rules
`eligible(game) =
(seasonType === "regular" && conferenceGame === true)
OR
(seasonType !== "regular" && bothSEC(game) === true)`

Where `bothSEC(game)` uses realignment-aware SEC membership intervals from `data/sec_membership.json`.

## 2026 Update Process
1. Add new JSON/CSV files.
2. Extend ingestion file list in `scripts/ingest.ts`.
3. Update `data/sec_membership.json` if membership changes.
4. Run `npm run ingest`.
5. Run `npm test`.

## Troubleshooting Mismatches
- Verify team names normalize consistently between CSV/JSON/ledger.
- Check date normalization (`YYYY-MM-DD`).
- Inspect postseason detection in CSV notes.
- Confirm deterministic sort tie-breakers (date, source, sourceIndex).

## API Endpoints
- `GET /api/champion-on?date=YYYY-MM-DD`
- `GET /api/leaderboards/most-reigns`
- `GET /api/leaderboards/longest-reigns`
- `GET /api/team/:team/nth-win?n=#`
- `GET /api/title-changes?team=&from=&to=`
- `GET /api/reigns?team=`

## UI Routes
- `/` dashboard
- `/query/champion-on-date`
- `/leaderboards`
- `/teams/[team]`
- `/games`
- `/games/[id]`

## Troubleshooting `npm ERR! Missing script: "dev"`
If you see this error, the most common cause is running npm from the wrong folder.

Use:
```bash
pwd
cat package.json
npm run
```

You should be in the repository root (the same folder that contains this project's `package.json` with `"dev": "next dev"`).

Then run:
```bash
npm install
npm run dev
```

If `npm run` still does not show `dev`, pull the latest branch state and retry.

