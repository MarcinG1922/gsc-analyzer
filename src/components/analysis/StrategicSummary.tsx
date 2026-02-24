'use client';

import { useMemo } from 'react';
import { useGscState } from '@/store/gsc-store';
import { runStrategicSummary } from '@/lib/analysis/strategic-summary';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { BarChart } from '@/components/charts/BarChart';

export function StrategicSummary() {
  const { rawData, brandTerms, businessContext } = useGscState();

  const result = useMemo(() => {
    if (!rawData) return null;
    return runStrategicSummary(rawData, brandTerms, businessContext);
  }, [rawData, brandTerms, businessContext]);

  if (!result) return <p className="text-[var(--text-muted)]">Brak dostępnych danych</p>;

  const positionData = [
    { label: 'Top 3', value: rawData!.summary.queriesInTop3 },
    { label: 'Poz. 4-10', value: rawData!.summary.queriesPosition4To10 },
    { label: 'Poz. 11-20', value: rawData!.summary.queriesPosition11To20 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">
          {businessContext.companyName ? `${businessContext.companyName} — ` : ''}Podsumowanie strategiczne
        </h1>
        <p className="text-[var(--text-secondary)]">Przegląd z priorytetami i szacunkami przychodów</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {result.headlineMetrics.map(m => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Rozkład pozycji</h3>
          <BarChart data={positionData} />
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Podział lejka</h3>
          <FunnelChart {...result.funnelBreakdown} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.risks.length > 0 && (
          <Card>
            <h3 className="text-sm font-medium text-[var(--danger)] mb-3">Kluczowe ryzyka</h3>
            <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal list-inside">
              {result.risks.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-medium text-[var(--success)] mb-3">Kluczowe szanse</h3>
          <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal list-inside">
            {result.opportunities.map((o, i) => <li key={i}>{o.label}</li>)}
          </ol>
        </Card>
      </div>

      {result.anomalies.length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-[var(--warning)] mb-3">
            Anomalie <Badge variant="warning">{result.anomalies.length}</Badge>
          </h3>
          <div className="space-y-2">
            {result.anomalies.slice(0, 15).map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm rounded-lg bg-[var(--surface-elevated)] p-3">
                <Badge variant={a.severity === 'high' ? 'danger' : 'warning'}>
                  {a.severity === 'high' ? 'wysoki' : 'ostrzeżenie'}
                </Badge>
                <div>
                  {a.query && <p className="text-[var(--foreground)] font-medium">{a.query}</p>}
                  <p className="text-[var(--text-secondary)]">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-medium text-[var(--accent)] mb-3">Priorytety na 90 dni</h3>
        <ol className="space-y-3">
          {result.priorities.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-medium">
                {i + 1}
              </span>
              <span className="text-[var(--text-secondary)]">{p}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
