'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DonutData {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({ data, centerLabel }: { data: DonutData[]; centerLabel?: string }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--foreground)',
              fontSize: '13px',
            }}
            formatter={(value) => [Number(value).toLocaleString(), '']}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-[var(--foreground)]">{centerLabel}</span>
        </div>
      )}
      <div className="flex justify-center gap-4 mt-2">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--text-secondary)]">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
