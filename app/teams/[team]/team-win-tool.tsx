'use client';

import { useState } from 'react';
import { getTeamCardStyle } from '@/lib/teamColors';
import { TeamLabel } from '@/components/TeamLabel';

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
      {result ? (
        <div className="rounded-lg border-l-8 p-3" style={getTeamCardStyle(team)}>
          <p className="font-semibold"><TeamLabel team={team} className="font-semibold" logoClassName="h-5 w-5" /> belt win #{n}</p>
          <p className="text-sm">Date: {result.date}</p>
          <p className="text-sm">Opponent: <TeamLabel team={result.loserTeam} className="text-sm" logoClassName="h-4 w-4" /></p>
          <p className="text-sm">Game ID: {result.id}</p>
        </div>
      ) : 'Choose win number.'}
    </div>
  );
}
