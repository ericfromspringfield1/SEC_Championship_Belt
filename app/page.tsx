import Link from 'next/link';
import { getChampionOnDate, getLongestReigns, getMostReignsLeaderboard } from '@/lib/beltQueries';
import { LeaderboardChart } from '@/components/LeaderboardChart';

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const champion = getChampionOnDate(today);
  const mostReigns = getMostReignsLeaderboard() as Array<{ team: string; reigns: number }>;
  const longest = getLongestReigns(5) as Array<{ champ: string; length_days: number }>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">SEC Football Championship Belt</h1>
      <div className="card">
        <h2 className="font-semibold">Current Champion</h2>
        {champion ? <p>{champion.team} (since {champion.reignStartDate})</p> : <p>No data.</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold">Most Reigns (Top 10)</h3>
          <LeaderboardChart data={mostReigns} />
        </div>
        <div className="card">
          <h3 className="font-semibold">Longest Reigns Preview</h3>
          <ul className="list-disc pl-5">
            {longest.map((item, i) => <li key={i}>{item.champ}: {item.length_days} days</li>)}
          </ul>
        </div>
      </div>
      <div className="card flex flex-wrap gap-3">
        <Link className="underline" href="/query/champion-on-date">Champion on date</Link>
        <Link className="underline" href="/leaderboards">Leaderboards</Link>
        <Link className="underline" href="/games">Games explorer</Link>
      </div>
    </div>
  );
}
