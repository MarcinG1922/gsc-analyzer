'use client';

import { useState } from 'react';
import { BrandTermEditor } from './BrandTermEditor';
import { BusinessContextForm } from './BusinessContextForm';

export function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'brand' | 'context'>('brand');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8">
        <div className="flex gap-4 mb-8">
          <div className={`flex items-center gap-2 text-sm ${step === 'brand' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'brand' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-elevated)]'}`}>1</span>
            Frazy brandowe
          </div>
          <div className="flex-1 border-t border-[var(--border-color)] self-center" />
          <div className={`flex items-center gap-2 text-sm ${step === 'context' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'context' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-elevated)]'}`}>2</span>
            Kontekst biznesowy
          </div>
        </div>

        {step === 'brand' ? (
          <BrandTermEditor onComplete={() => setStep('context')} />
        ) : (
          <BusinessContextForm onComplete={onComplete} />
        )}
      </div>
    </div>
  );
}
