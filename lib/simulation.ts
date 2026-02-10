import { getEligibilityReason } from './eligibility';
import type { Game, Reign, TitleChange } from './types';

const INITIAL_CHAMPION = 'Alabama';
const INITIAL_DATE = '1934-01-01';

function daysBetween(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00Z`).getTime();
  const b = new Date(`${end}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
}

export function sortGamesDeterministically(games: Game[]): Game[] {
  return [...games].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.source !== b.source) return a.source.localeCompare(b.source);
    return a.sourceIndex - b.sourceIndex;
  });
}

export function simulateBelt(games: Game[]): { titleChanges: TitleChange[]; reigns: Reign[] } {
  const ordered = sortGamesDeterministically(games);
  const titleChanges: TitleChange[] = [];
  const reigns: Reign[] = [];
  const reignCountByTeam = new Map<string, number>();
  let champion = INITIAL_CHAMPION;
  let reignStart = INITIAL_DATE;
  let defenses = 0;

  const pushReign = (endDate: string | null, endedByTeam: string | null, endGameId: string | null) => {
    const count = (reignCountByTeam.get(champion) ?? 0) + 1;
    reignCountByTeam.set(champion, count);
    reigns.push({
      id: `reign-${reigns.length + 1}`,
      champ: champion,
      start_date: reignStart,
      end_date: endDate,
      length_days: endDate ? daysBetween(reignStart, endDate) : daysBetween(reignStart, new Date().toISOString().slice(0, 10)),
      defenses,
      ended_by_team: endedByTeam,
      end_game_id: endGameId,
      reign_index_for_team: count,
    });
  };

  for (const game of ordered) {
    if (game.noWinnerOrLoser) continue;

    const homeTeamIsChampion = game.homeTeam === champion;
    const awayTeamIsChampion = game.awayTeam === champion;
    game.homeTeamIsChampion = homeTeamIsChampion;
    game.awayTeamIsChampion = awayTeamIsChampion;
    game.titleGame = homeTeamIsChampion || awayTeamIsChampion;

    const reason = getEligibilityReason(game);
    if (!reason || !game.titleGame) continue;

    if (game.winnerTeam === champion) {
      defenses += 1;
      continue;
    }

    const newChamp = game.winnerTeam;
    titleChanges.push({
      id: `tc-${titleChanges.length + 1}`,
      date: game.date,
      season: game.season,
      new_champ: newChamp,
      old_champ: champion,
      score: `${game.winnerScore}-${game.loserScore}`,
      game_id: game.id,
      eligible_reason: reason,
    });

    pushReign(game.date, newChamp, game.id);
    champion = newChamp;
    reignStart = game.date;
    defenses = 0;
  }

  pushReign(null, null, null);
  return { titleChanges, reigns };
}
