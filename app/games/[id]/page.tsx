import { getDb } from '@/lib/db';
import { getEligibilityReason } from '@/lib/eligibility';

export default function GameDetail({ params }: { params: { id: string } }) {
  const game = getDb().prepare('SELECT * FROM games WHERE id = ?').get(decodeURIComponent(params.id)) as any;
  if (!game) return <div className="card">Game not found.</div>;
  const reason = getEligibilityReason({ ...game, conferenceGame: game.conferenceGame === null ? null : Boolean(game.conferenceGame) } as any);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Game {game.id}</h1>
      <div className="card"><pre>{JSON.stringify(game, null, 2)}</pre></div>
      <div className="card">Belt eligible: {reason ? `Yes (${reason})` : 'No'}</div>
    </div>
  );
}
