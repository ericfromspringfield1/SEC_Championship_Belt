import membershipData from '@/data/sec_membership.json';

export type TeamColors = {
  primaryColor: string;
  secondaryColor: string;
};

const colorMap = new Map<string, TeamColors>(
  membershipData.map((team) => [team.team, { primaryColor: team.primaryColor, secondaryColor: team.secondaryColor }]),
);

export function getTeamColors(team?: string | null): TeamColors {
  if (!team) return { primaryColor: '#0f172a', secondaryColor: '#f8fafc' };
  return colorMap.get(team) ?? { primaryColor: '#1d4ed8', secondaryColor: '#ffffff' };
}

export function getTeamCardStyle(team?: string | null) {
  const { primaryColor, secondaryColor } = getTeamColors(team);
  return {
    backgroundColor: primaryColor,
    color: secondaryColor,
    borderColor: secondaryColor,
  };
}
