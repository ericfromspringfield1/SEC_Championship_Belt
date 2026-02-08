'use client';

import { useState } from 'react';

export default function TeamWinTool({ team }: { team: string }) {
  const [n, setN] = useState(1);
  const [result, setResult] = useState<any>(null);

  const lookup = async () => {
    const r = await fetch(`/api/team/${encodeURIComponent(team)}/nth-win?n=${n}`);
    setResult(await r.json());
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="number" min={1} value={n} onChange={(e) => setN(Number(e.target.value))} className="rounded border p-2" />
        <button onClick={lookup} className="rounded bg-blue-600 px-3 py-2 text-white">Lookup</button>
      </div>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : 'Choose win number.'}
    </div>
  );
}
