'use client';

import { useState } from 'react';
import { useGscState, useGscDispatch } from '@/store/gsc-store';

export function BrandTermEditor({ onComplete }: { onComplete: () => void }) {
  const { brandDetection } = useGscState();
  const dispatch = useGscDispatch();

  const [confirmed, setConfirmed] = useState<Set<string>>(
    new Set(brandDetection?.likelyBrand || [])
  );
  const [customTerm, setCustomTerm] = useState('');

  function toggleTerm(term: string) {
    setConfirmed(prev => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  }

  function addCustom() {
    if (customTerm.trim()) {
      setConfirmed(prev => new Set([...prev, customTerm.trim()]));
      setCustomTerm('');
    }
  }

  function handleConfirm() {
    // Extract unique root terms from confirmed brand queries
    const roots = new Set<string>();
    for (const term of confirmed) {
      for (const word of term.toLowerCase().split(/\s+/)) {
        if (word.length > 2) roots.add(word);
      }
    }
    dispatch({ type: 'SET_BRAND_TERMS', payload: [...roots] });
    onComplete();
  }

  function handleSkip() {
    dispatch({ type: 'SET_BRAND_TERMS', payload: [] });
    onComplete();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Brand Terms</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          We detected these as likely brand terms. Confirm or adjust.
        </p>
      </div>

      {brandDetection?.likelyBrand && brandDetection.likelyBrand.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--success)] mb-2">Likely Brand</p>
          <div className="flex flex-wrap gap-2">
            {brandDetection.likelyBrand.map(term => (
              <button
                key={term}
                onClick={() => toggleTerm(term)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  confirmed.has(term)
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {brandDetection?.uncertain && brandDetection.uncertain.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--warning)] mb-2">Uncertain</p>
          <div className="flex flex-wrap gap-2">
            {brandDetection.uncertain.slice(0, 20).map(term => (
              <button
                key={term}
                onClick={() => toggleTerm(term)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  confirmed.has(term)
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={customTerm}
          onChange={e => setCustomTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          placeholder="Add custom brand term..."
          className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          onClick={addCustom}
          className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--accent)]"
        >
          Add
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          className="px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Confirm Brand Terms ({confirmed.size})
        </button>
        <button
          onClick={handleSkip}
          className="px-6 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
