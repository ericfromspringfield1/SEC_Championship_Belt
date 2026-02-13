'use client';

import { useState } from 'react';
import { getTeamCardStyle } from '@/lib/teamColors';

export default function ChampionOnDatePage() {
  const [date, setDate] = useState('2024-10-01');
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    const r = await fetch(`/api/champion-on?date=${date}`);
    setResult(await r.json());
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Champion on Date</h1>
      <div className="card flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border p-2" />
        <button onClick={run} className="rounded bg-blue-600 px-4 py-2 text-white">Lookup</button>
      </div>
      <div className="card">
        {result ? (
          <div className="rounded-lg border-l-8 p-4" style={getTeamCardStyle(result.team)}>
            <p className="text-sm opacity-90">Champion on {date}</p>
            <p className="text-2xl font-bold">{result.team}</p>
            <p className="mt-1 text-sm">Started reign: {result.reignStartDate}</p>
            {result.gameId ? <p className="text-sm">Won in game: {result.gameId}</p> : null}
          </div>
        ) : 'Select a date and lookup.'}
      </div>
    </div>
  );
}
