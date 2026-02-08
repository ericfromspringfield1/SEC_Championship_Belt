import { isSecMember } from './membership';
import type { Game } from './types';

export function bothSec(game: Game): boolean {
  return isSecMember(game.homeTeam, game.season) && isSecMember(game.awayTeam, game.season);
}

export function getEligibilityReason(game: Game): 'regular_conferenceGame_true' | 'nonregular_both_sec' | null {
  if (game.seasonType === 'regular') {
    return game.conferenceGame === true ? 'regular_conferenceGame_true' : null;
  }
  return bothSec(game) ? 'nonregular_both_sec' : null;
}

export function isEligibleGame(game: Game): boolean {
  return getEligibilityReason(game) !== null;
}
