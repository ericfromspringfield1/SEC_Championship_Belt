'use client';

import membershipData from '@/data/sec_membership.json';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const primaryColorByTeam = Object.fromEntries(membershipData.map((team) => [team.team, team.primaryColor]));

export function LeaderboardChart({ data }: { data: Array<{ team: string; reigns: number }> }) {
  const topTen = data.slice(0, 10);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={topTen}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="team" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="reigns">
            {topTen.map((entry) => (
              <Cell key={entry.team} fill={primaryColorByTeam[entry.team] ?? '#2563eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
