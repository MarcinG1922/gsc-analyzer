'use client';

import { formatNumber } from '@/lib/utils/format';

export function FunnelChart({
  tofu,
  mofu,
  bofu,
}: {
  tofu: number;
  mofu: number;
  bofu: number;
}) {
  const total = tofu + mofu + bofu || 1;
  const segments = [
    { label: 'TOFU', value: tofu, percent: (tofu / total) * 100, color: '#6366f1' },
    { label: 'MOFU', value: mofu, percent: (mofu / total) * 100, color: '#f59e0b' },
    { label: 'BOFU', value: bofu, percent: (bofu / total) * 100, color: '#22c55e' },
  ];

  return (
    <div className="space-y-3">
      {segments.map(seg => (
        <div key={seg.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-secondary)]">{seg.label}</span>
            <span className="text-[var(--foreground)]">
              {formatNumber(seg.value)} ({seg.percent.toFixed(1)}%)
            </span>
          </div>
          <div className="h-6 rounded-lg bg-[var(--surface-elevated)] overflow-hidden">
            <div
              className="h-full rounded-lg transition-all duration-700"
              style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
