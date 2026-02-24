'use client';

export function MetricCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const colorMap = {
    default: 'text-[var(--foreground)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
  };

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
      <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color || 'default']}`}>{value}</p>
      {subtext && <p className="text-xs text-[var(--text-muted)] mt-1">{subtext}</p>}
    </div>
  );
}
