import { getDb } from '@/lib/db';
import { getEligibilityReason } from '@/lib/eligibility';
import { getTeamCardStyle } from '@/lib/teamColors';

export default function GameDetail({ params }: { params: { id: string } }) {
  const game = getDb().prepare('SELECT * FROM games WHERE id = ?').get(decodeURIComponent(params.id)) as any;
  if (!game) return <div className="card">Game not found.</div>;
  const reason = getEligibilityReason({ ...game, conferenceGame: game.conferenceGame === null ? null : Boolean(game.conferenceGame) } as any);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Game {game.id}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-l-8" style={getTeamCardStyle(game.winnerTeam)}>
          <p className="text-sm opacity-90">Winner</p>
          <p className="text-xl font-semibold">{game.winnerTeam}</p>
          <p>Score: {game.winnerScore}</p>
        </div>
        <div className="card border-l-8" style={getTeamCardStyle(game.loserTeam)}>
          <p className="text-sm opacity-90">Loser</p>
          <p className="text-xl font-semibold">{game.loserTeam}</p>
          <p>Score: {game.loserScore}</p>
        </div>
      </div>
      <div className="card">
        <h2 className="mb-2 font-semibold">Game Details</h2>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <p><span className="font-semibold">Date:</span> {game.date}</p>
          <p><span className="font-semibold">Season:</span> {game.season}</p>
          <p><span className="font-semibold">Season Type:</span> {game.seasonType}</p>
          <p><span className="font-semibold">Conference Game:</span> {game.conferenceGame === null ? 'Unknown' : game.conferenceGame ? 'Yes' : 'No'}</p>
          <p><span className="font-semibold">Location:</span> {game.location ?? 'N/A'}</p>
          <p><span className="font-semibold">Overtime:</span> {game.overtime ?? 0}</p>
        </div>
      </div>
      <div className="card">Belt eligible: {reason ? `Yes (${reason})` : 'No'}</div>
    </div>
  );
}
