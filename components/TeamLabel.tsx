import { getTeamLogoPath } from '@/lib/teamLogos';

export function TeamLabel({ team, className = 'text-base', logoClassName = 'h-7 w-7' }: { team?: string | null; className?: string; logoClassName?: string }) {
  if (!team) return <span className={className}>Unknown team</span>;
  const logo = getTeamLogoPath(team);
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {logo ? <img src={logo} alt={`${team} logo`} className={`${logoClassName} object-contain`} /> : null}
      <span>{team}</span>
    </span>
  );
}
