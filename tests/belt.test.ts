import { describe, expect, it } from 'vitest';
import { getEligibilityReason } from '@/lib/eligibility';
import { simulateBelt, sortGamesDeterministically } from '@/lib/simulation';
import { diffLedger } from '@/lib/validation';
import type { Game } from '@/lib/types';

const base: Game = {
  id: 'g',
  date: '2024-01-01',
  season: 2024,
  seasonType: 'regular',
  conferenceGame: true,
  homeTeam: 'Alabama',
  awayTeam: 'Georgia',
  homeScore: 10,
  awayScore: 7,
  winnerTeam: 'Alabama',
  loserTeam: 'Georgia',
  winnerScore: 10,
  loserScore: 7,
  source: 't',
  sourceIndex: 0,
};

describe('eligibility', () => {
  it('regular requires conferenceGame=true', () => {
    expect(getEligibilityReason({ ...base, conferenceGame: true })).toBe('regular_conferenceGame_true');
    expect(getEligibilityReason({ ...base, conferenceGame: false })).toBeNull();
  });

  it('non-regular requires both SEC teams', () => {
    expect(getEligibilityReason({ ...base, seasonType: 'not-regular', homeTeam: 'Alabama', awayTeam: 'Georgia' })).toBe('nonregular_both_sec');
    expect(getEligibilityReason({ ...base, seasonType: 'not-regular', awayTeam: 'Notre Dame' })).toBeNull();
  });
});

describe('deterministic ordering and nth win', () => {
  it('sorts deterministically', () => {
    const games = sortGamesDeterministically([
      { ...base, id: '2', source: 'b', sourceIndex: 2 },
      { ...base, id: '1', source: 'a', sourceIndex: 1 },
    ]);
    expect(games[0].id).toBe('1');
  });

  it('champion-on-date style progression and nth belt win', () => {
    const games: Game[] = [
      { ...base, id: 'g1', date: '1934-02-01', winnerTeam: 'Georgia', loserTeam: 'Alabama', homeTeam: 'Georgia', awayTeam: 'Alabama', homeScore: 14, awayScore: 7, winnerScore: 14, loserScore: 7, season: 1934 },
      { ...base, id: 'g2', date: '1934-03-01', winnerTeam: 'Alabama', loserTeam: 'Georgia', homeTeam: 'Alabama', awayTeam: 'Georgia', homeScore: 21, awayScore: 10, winnerScore: 21, loserScore: 10, season: 1934 },
    ];
    const out = simulateBelt(games);
    expect(out.titleChanges).toHaveLength(2);
    expect(out.titleChanges[0].new_champ).toBe('Georgia');
    expect(out.titleChanges[1].new_champ).toBe('Alabama');
  });
});

describe('validation diff', () => {
  it('reports mismatch', () => {
    const diffs = diffLedger([{ date: 'a', new_champ: 'x', old_champ: 'y', score: '1-0' }], [{ date: 'a', new_champ: 'x', old_champ: 'z', score: '1-0' }]);
    expect(diffs.length).toBe(1);
  });
});
