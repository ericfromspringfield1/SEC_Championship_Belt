'use client';

import { useEffect, useMemo, useState } from 'react';

export default function LeaderboardsPage() {
  const [rows, setRows] = useState<any[]>([]);
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
        setRows(Array.from(byTeam.entries()).map(([team, total_days]) => ({ team, total_days })).sort((a, b) => b.total_days - a.total_days));
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
      <div className="card overflow-auto">
        {top.length ? <pre>{JSON.stringify(top, null, 2)}</pre> : 'No rows.'}
      </div>
    </div>
  );
}
