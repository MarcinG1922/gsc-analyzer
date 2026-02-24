'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ScatterData {
  x: number;
  y: number;
  label: string;
}

export function ScatterPlot({
  data,
  xLabel = 'Impressions',
  yLabel = 'Position',
  height = 300,
}: {
  data: ScatterData[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="x"
          name={xLabel}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--border-color)' }}
          label={{ value: xLabel, position: 'bottom', fill: 'var(--text-muted)', fontSize: 12 }}
        />
        <YAxis
          dataKey="y"
          name={yLabel}
          reversed
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--border-color)' }}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--foreground)',
            fontSize: '13px',
          }}
          formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as ScatterData | undefined;
            return item?.label ?? '';
          }}
        />
        <Scatter data={data} fill="var(--accent)" opacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
