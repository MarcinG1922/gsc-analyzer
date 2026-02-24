'use client';

import { useState } from 'react';
import { useGscDispatch } from '@/store/gsc-store';
import type { BusinessContext } from '@/types/business-context';
import { DEFAULT_BUSINESS_CONTEXT } from '@/types/business-context';

export function BusinessContextForm({ onComplete }: { onComplete: () => void }) {
  const dispatch = useGscDispatch();
  const [ctx, setCtx] = useState<BusinessContext>(DEFAULT_BUSINESS_CONTEXT);

  function handleSubmit() {
    dispatch({ type: 'SET_BUSINESS_CONTEXT', payload: ctx });
    dispatch({ type: 'SET_SETUP_COMPLETE' });
    onComplete();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Business Context</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          This helps us estimate revenue impact of SEO opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Organic-to-Trial Conversion Rate
          </label>
          <select
            value={ctx.conversionRate}
            onChange={e => setCtx({ ...ctx, conversionRate: parseFloat(e.target.value) })}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="0.005">&lt;1%</option>
            <option value="0.015">1-2%</option>
            <option value="0.025">2-4% (typical)</option>
            <option value="0.05">4%+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Trial-to-Paid Rate
          </label>
          <select
            value={ctx.trialToPaidRate}
            onChange={e => setCtx({ ...ctx, trialToPaidRate: parseFloat(e.target.value) })}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="0.08">~8%</option>
            <option value="0.12">~12% (typical)</option>
            <option value="0.18">~18%</option>
            <option value="0.25">25%+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Average Contract Value (ACV)
          </label>
          <select
            value={ctx.acv}
            onChange={e => setCtx({ ...ctx, acv: parseFloat(e.target.value) })}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="150">&lt;$200/yr</option>
            <option value="300">$200-500/yr</option>
            <option value="1000">$500-2000/yr</option>
            <option value="5000">$2000+/yr</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Company Name (optional)
          </label>
          <input
            type="text"
            value={ctx.companyName || ''}
            onChange={e => setCtx({ ...ctx, companyName: e.target.value })}
            placeholder="Your company"
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--text-secondary)]">
        Revenue Formula: Traffic Gain x {(ctx.conversionRate * 100).toFixed(1)}% x {(ctx.trialToPaidRate * 100).toFixed(0)}% x ${ctx.acv}
      </div>

      <button
        onClick={handleSubmit}
        className="px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
      >
        Start Analysis
      </button>
    </div>
  );
}
