export const teamLogoByName: Record<string, string> = {
  Alabama: '/team-logos/Alabama.svg',
  Arkansas: '/team-logos/Arkansas.svg',
  Auburn: '/team-logos/Auburn.svg',
  Florida: '/team-logos/Florida.svg',
  Georgia: '/team-logos/Georgia.svg',
  'Georgia Tech': '/team-logos/Georgia Tech.svg',
  Kentucky: '/team-logos/Kentucky.svg',
  LSU: '/team-logos/LSU.svg',
  Mississippi: '/team-logos/Mississippi.svg',
  'Mississippi State': '/team-logos/Mississippi State.svg',
  Missouri: '/team-logos/Missouri.svg',
  Oklahoma: '/team-logos/Oklahoma.svg',
  Sewanee: '/team-logos/Sewanee.svg',
  'South Carolina': '/team-logos/South Carolina.svg',
  Tennessee: '/team-logos/Tennessee.svg',
  Texas: '/team-logos/Texas.svg',
  'Texas A&M': '/team-logos/Texas A&M.svg',
  Tulane: '/team-logos/Tulane.svg',
  Vanderbilt: '/team-logos/Vanderbilt.svg',
};

export function getTeamLogoPath(team?: string | null): string | null {
  if (!team) return null;
  return teamLogoByName[team] ?? null;
}
