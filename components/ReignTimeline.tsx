export function ReignTimeline({ reigns }: { reigns: Array<{ champ: string; start_date: string; end_date: string | null; length_days: number }> }) {
  const total = reigns.reduce((acc, r) => acc + r.length_days, 0) || 1;
  return (
    <div className="space-y-2">
      {reigns.map((reign) => (
        <div key={`${reign.champ}-${reign.start_date}`}>
          <div className="text-xs">{reign.champ}: {reign.start_date} → {reign.end_date ?? 'Present'} ({reign.length_days} days)</div>
          <div className="h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-blue-600" style={{ width: `${(reign.length_days / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
