import membershipData from '../data/sec_membership.json';
import type { MembershipInterval } from './types';

const intervals = membershipData as MembershipInterval[];

export function isSecMember(team: string, season: number): boolean {
  return intervals.some(
    (interval) =>
      interval.team === team &&
      season >= interval.start_season &&
      (interval.end_season === null || season <= interval.end_season),
  );
}
