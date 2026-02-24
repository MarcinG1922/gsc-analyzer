'use client';

import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-shadow hover:shadow-[0_0_30px_rgba(99,102,241,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
