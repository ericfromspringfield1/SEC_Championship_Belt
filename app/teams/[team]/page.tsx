import { getTeamSummary } from '@/lib/beltQueries';
import { ReignTimeline } from '@/components/ReignTimeline';
import TeamWinTool from './team-win-tool';
import { getTeamCardStyle } from '@/lib/teamColors';

export default function TeamPage({ params }: { params: { team: string } }) {
  const team = decodeURIComponent(params.team);
  const summary = getTeamSummary(team) as any;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{team}</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(summary.totals).map(([key, value]) => (
          <div key={key} className="card border-l-8" style={getTeamCardStyle(team)}>
            <p className="text-sm opacity-90">{key.replaceAll('_', ' ')}</p>
            <p className="text-2xl font-semibold">{String(value)}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold">Reign Timeline</h2>
        <ReignTimeline reigns={summary.reignTimeline} />
      </div>
      <div className="card">
        <h2 className="font-semibold">Nth belt win</h2>
        <TeamWinTool team={team} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 font-semibold">Belt-win events</h3>
          <div className="space-y-2">
            {summary.wins.map((win: any) => (
              <div key={win.id} className="rounded border p-2 text-sm">
                <p className="font-semibold">{win.date}</p>
                <p>Defeated {win.loserTeam} ({win.winnerScore}-{win.loserScore})</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="mb-2 font-semibold">Belt-loss events</h3>
          <div className="space-y-2">
            {summary.losses.map((loss: any) => (
              <div key={loss.id} className="rounded border p-2 text-sm">
                <p className="font-semibold">{loss.date}</p>
                <p>Lost to {loss.winnerTeam} ({loss.loserScore}-{loss.winnerScore})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
