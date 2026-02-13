'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTeamCardStyle } from '@/lib/teamColors';

type Row = Record<string, string | number | null>;

export default function LeaderboardsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<'most' | 'longest' | 'days' | 'defenses'>('most');
  const [allReigns, setAllReigns] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/reigns').then((r) => r.json()).then(setAllReigns);
  }, []);

  useEffect(() => {
    (async () => {
      if (tab === 'days') {
        const byTeam = new Map<string, number>();
        allReigns.forEach((r) => byTeam.set(r.champ, (byTeam.get(r.champ) ?? 0) + r.length_days));
        setRows(Array.from(byTeam.entries()).map(([team, total_days]) => ({ team, total_days })).sort((a, b) => Number(b.total_days) - Number(a.total_days)));
        return;
      }
      if (tab === 'defenses') {
        setRows([...allReigns].sort((a, b) => b.defenses - a.defenses));
        return;
      }
      const endpoint = tab === 'most' ? '/api/leaderboards/most-reigns' : '/api/leaderboards/longest-reigns';
      const r = await fetch(endpoint);
      setRows(await r.json());
    })();
  }, [tab, allReigns]);

  const exportCsv = () => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leaderboard-${tab}.csv`;
    a.click();
  };

  const top = useMemo(() => rows.slice(0, 100), [rows]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Leaderboards</h1>
      <div className="flex flex-wrap gap-2">
        {[
          ['most', 'Most Reigns'],
          ['longest', 'Longest Reigns'],
          ['days', 'Most Total Champ Days'],
          ['defenses', 'Most Defenses in a Reign'],
        ].map(([k, label]) => (
          <button key={k} className="rounded border px-3 py-1" onClick={() => setTab(k as any)}>{label}</button>
        ))}
        <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={exportCsv}>CSV export</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {top.length ? top.map((row, index) => {
          const team = (row.team ?? row.champ) as string | undefined;
          return (
            <div key={`${team ?? 'row'}-${index}`} className="card border-l-8" style={getTeamCardStyle(team)}>
              <p className="text-sm opacity-90">#{index + 1}</p>
              <p className="text-lg font-semibold">{team ?? 'Unknown team'}</p>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(row).filter(([key]) => key !== 'team' && key !== 'champ').map(([key, value]) => (
                  <p key={key}><span className="font-semibold">{key.replaceAll('_', ' ')}:</span> {String(value)}</p>
                ))}
              </div>
            </div>
          );
        }) : <div className="card">No rows.</div>}
      </div>
    </div>
  );
}
