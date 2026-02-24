'use client';

import { FileDropZone } from '@/components/upload/FileDropZone';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 6-10" />
            </svg>
          </div>
          <span className="text-lg font-semibold">GSC Analyzer</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full space-y-8 -mt-20">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[var(--foreground)] to-[var(--text-secondary)] bg-clip-text text-transparent">
              Analyze Your Search Performance
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto">
              Upload your Google Search Console export and get strategic insights with revenue impact estimates.
            </p>
          </div>

          <FileDropZone />

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
              <p className="text-[var(--accent)] font-medium mb-1">Brand Analysis</p>
              <p className="text-[var(--text-muted)]">Brand vs non-brand health</p>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
              <p className="text-[var(--accent)] font-medium mb-1">SEO Opportunities</p>
              <p className="text-[var(--text-muted)]">Quick wins & striking distance</p>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
              <p className="text-[var(--accent)] font-medium mb-1">Revenue Impact</p>
              <p className="text-[var(--text-muted)]">Size every opportunity in $</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
