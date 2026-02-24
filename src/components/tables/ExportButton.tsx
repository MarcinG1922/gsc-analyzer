'use client';

import { exportToCsv } from '@/lib/utils/export-csv';

export function ExportButton({
  data,
  filename,
}: {
  data: Record<string, unknown>[];
  filename: string;
}) {
  return (
    <button
      onClick={() => exportToCsv(data, filename)}
      disabled={data.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors disabled:opacity-30"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Eksportuj CSV
    </button>
  );
}
