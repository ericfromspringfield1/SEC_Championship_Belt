'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function GamesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({ season: '', team: '', opponent: '', seasonType: '', conferenceGame: '' });

  useEffect(() => {
    const params = new URLSearchParams(filters as any);
    fetch('/api/internal-games?' + params.toString()).then((r) => r.json()).then(setRows).catch(() => setRows([]));
  }, [filters]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Games</h1>
      <div className="card grid gap-2 md:grid-cols-3">
        {Object.keys(filters).map((k) => (
          <input key={k} placeholder={k} className="rounded border p-2" value={(filters as any)[k]} onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.value }))} />
        ))}
      </div>
      <div className="card">
        {rows.length ? rows.map((g) => <div key={g.id}><Link className="underline" href={`/games/${encodeURIComponent(g.id)}`}>{g.date} {g.winnerTeam} def. {g.loserTeam}</Link></div>) : 'No games found.'}
      </div>
    </div>
  );
}
