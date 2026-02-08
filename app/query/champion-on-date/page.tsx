'use client';

import { useState } from 'react';

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
      <div className="card">{result ? <pre>{JSON.stringify(result, null, 2)}</pre> : 'Select a date and lookup.'}</div>
    </div>
  );
}
