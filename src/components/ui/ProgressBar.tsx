'use client';

export function ProgressBar({
  value,
  max = 100,
  label,
  color = 'accent',
}: {
  value: number;
  max?: number;
  label?: string;
  color?: 'accent' | 'success' | 'warning' | 'danger';
}) {
  const percent = Math.min(100, (value / max) * 100);
  const colors = {
    accent: 'bg-[var(--accent)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
          <span className="text-sm text-[var(--foreground)]">{percent.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-[var(--surface-elevated)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
