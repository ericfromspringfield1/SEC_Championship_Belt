import { getTeamSummary } from '@/lib/beltQueries';
import { ReignTimeline } from '@/components/ReignTimeline';
import TeamWinTool from './team-win-tool';

export default function TeamPage({ params }: { params: { team: string } }) {
  const team = decodeURIComponent(params.team);
  const summary = getTeamSummary(team) as any;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{team}</h1>
      <div className="card"><pre>{JSON.stringify(summary.totals, null, 2)}</pre></div>
      <div className="card">
        <h2 className="font-semibold">Reign Timeline</h2>
        <ReignTimeline reigns={summary.reignTimeline} />
      </div>
      <div className="card">
        <h2 className="font-semibold">Nth belt win</h2>
        <TeamWinTool team={team} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card"><h3 className="font-semibold">Belt-win events</h3><pre>{JSON.stringify(summary.wins, null, 2)}</pre></div>
        <div className="card"><h3 className="font-semibold">Belt-loss events</h3><pre>{JSON.stringify(summary.losses, null, 2)}</pre></div>
      </div>
    </div>
  );
}
