'use client';

export function TeamAutocomplete({ teams, value, onChange }: { teams: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <input list="teams" className="w-full rounded border p-2" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type team" />
      <datalist id="teams">
        {teams.map((team) => (
          <option key={team} value={team} />
        ))}
      </datalist>
    </>
  );
}
