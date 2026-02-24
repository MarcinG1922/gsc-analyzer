'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGscState } from '@/store/gsc-store';
import { SetupWizard } from '@/components/setup/SetupWizard';
import { formatNumber, formatPercent } from '@/lib/utils/format';

const NAV_ITEMS = [
  { href: '/analyze/brand', label: 'Analiza marki', icon: 'B' },
  { href: '/analyze/seo', label: 'Szanse SEO', icon: 'S' },
  { href: '/analyze/content', label: 'Strategia treści', icon: 'C' },
  { href: '/analyze/paid', label: 'Płatne wyszukiwanie', icon: 'P' },
  { href: '/analyze/summary', label: 'Podsumowanie', icon: 'R' },
];

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { rawData, setupComplete } = useGscState();
  const [showSetup, setShowSetup] = useState(!setupComplete);

  if (!rawData) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {showSetup && (
        <SetupWizard onComplete={() => setShowSetup(false)} />
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--surface)] flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--border-color)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 6-10" />
              </svg>
            </div>
            <span className="font-semibold text-sm">GSC Analyzer</span>
          </Link>
        </div>

        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="rounded-lg bg-[var(--surface-elevated)] p-3 text-xs space-y-1">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Zapytania</span>
              <span className="text-[var(--foreground)]">{formatNumber(rawData.summary.totalQueries)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Kliknięcia</span>
              <span className="text-[var(--foreground)]">{formatNumber(rawData.summary.totalClicks)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Śr. CTR</span>
              <span className="text-[var(--foreground)]">{formatPercent(rawData.summary.avgCtr)}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]'
              }`}
            >
              <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                pathname === item.href ? 'bg-[var(--accent)]/20' : 'bg-[var(--surface-elevated)]'
              }`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
