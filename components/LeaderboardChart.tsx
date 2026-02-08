'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function LeaderboardChart({ data }: { data: Array<{ team: string; reigns: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="team" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="reigns" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
