'use client';

import { useMemo } from 'react';
import { useGscState } from '@/store/gsc-store';
import { runBrandAnalysis } from '@/lib/analysis/brand-analysis';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/tables/DataTable';
import { ExportButton } from '@/components/tables/ExportButton';
import { formatNumber, formatPercent } from '@/lib/utils/format';

export function BrandAnalysis() {
  const { rawData, brandTerms } = useGscState();

  const result = useMemo(() => {
    if (!rawData) return null;
    return runBrandAnalysis(rawData.queries, brandTerms);
  }, [rawData, brandTerms]);

  if (!result) return <p className="text-[var(--text-muted)]">Brak dostępnych danych</p>;

  const { composition, dependencyScore, healthLevel, topBrandKeywords, topNonBrandKeywords, risks, recommendations } = result;
  const healthColor = healthLevel === 'healthy' ? 'success' : healthLevel === 'warning' ? 'warning' : 'danger';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Brandowe vs Niebrandowe</h1>
        <p className="text-[var(--text-secondary)]">Analiza struktury ruchu i zależności od marki</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Kliknięcia brandowe" value={formatNumber(composition.brand.clicks)} />
        <MetricCard label="Kliknięcia niebrandowe" value={formatNumber(composition.nonBrand.clicks)} />
        <MetricCard
          label="Zależność od marki"
          value={`${dependencyScore.toFixed(0)}%`}
          color={healthColor}
          subtext={healthLevel === 'healthy' ? 'zdrowy' : healthLevel === 'warning' ? 'ostrzeżenie' : 'krytyczny'}
        />
        <MetricCard label="CTR brandowy" value={formatPercent(composition.brand.avgCtr)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Struktura ruchu</h3>
          <DonutChart
            data={[
              { name: 'Brandowe', value: composition.brand.clicks, color: '#6366f1' },
              { name: 'Niebrandowe', value: composition.nonBrand.clicks, color: '#22c55e' },
            ]}
            centerLabel={`${dependencyScore.toFixed(0)}%`}
          />
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Ocena kondycji</h3>
          <div className="space-y-6">
            <ProgressBar value={dependencyScore} label="Zależność od marki" color={healthColor} />
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Struktura</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                    <span className="text-[var(--text-muted)]">Zapytania brandowe:</span>{' '}
                    <span className="text-[var(--foreground)]">{composition.brand.queryCount}</span>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                    <span className="text-[var(--text-muted)]">Zapytania niebrandowe:</span>{' '}
                    <span className="text-[var(--foreground)]">{composition.nonBrand.queryCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {(risks.length > 0 || recommendations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {risks.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-[var(--danger)] mb-3">Ryzyka</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}
          {recommendations.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-[var(--success)] mb-3">Rekomendacje</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Najlepsze niebrandowe słowa kluczowe</h3>
          <ExportButton data={topNonBrandKeywords} filename="niebrandowe-slowa.csv" />
        </div>
        <DataTable
          data={topNonBrandKeywords}
          columns={[
            { key: 'query', label: 'Zapytanie' },
            { key: 'clicks', label: 'Kliknięcia', align: 'right', render: r => formatNumber(r.clicks) },
            { key: 'impressions', label: 'Wyświetlenia', align: 'right', render: r => formatNumber(r.impressions) },
            { key: 'ctr', label: 'CTR', align: 'right', render: r => formatPercent(r.ctr) },
            { key: 'position', label: 'Pozycja', align: 'right', render: r => r.position.toFixed(1) },
          ]}
        />
      </Card>
    </div>
  );
}
