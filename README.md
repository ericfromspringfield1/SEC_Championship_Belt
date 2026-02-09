# SEC Football Championship Belt

Production-ready Next.js app + SQLite ingestion pipeline for tracking the SEC football championship belt from 1934 through 2023.

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

Bundled historical input is read from `data/sec_games_1934_2023.json` (1934–2023). Team membership intervals are read from `data/sec_membership.json`.

## Rebuild / Refresh Data
```bash
npm run ingest
```

`npm run ingest` remains the explicit full rebuild command and always recreates `data/sec-belt.sqlite` from the two repository data files.

## Ingestion
`npm run ingest` will:
1. Read game results from `data/sec_games_1934_2023.json`.
2. Read SEC membership intervals from `data/sec_membership.json`.
3. Rebuild SQLite tables and compute title changes + reigns deterministically (with Alabama set as initial 1934 champion).

## Authoritative Eligibility Rules
`eligible(game) =
(seasonType === "regular" && conferenceGame === true)
OR
(seasonType !== "regular" && bothSEC(game) === true)`

Where `bothSEC(game)` uses realignment-aware SEC membership intervals from `data/sec_membership.json`.

## Data Update Process
1. Update `data/sec_games_1934_2023.json` for historical game corrections.
2. Update `data/sec_membership.json` if membership intervals change.
3. Run `npm run ingest`.
4. Run `npm test`.

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

