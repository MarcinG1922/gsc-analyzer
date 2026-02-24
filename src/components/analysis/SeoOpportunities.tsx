'use client';

import { useMemo } from 'react';
import { useGscState } from '@/store/gsc-store';
import { runSeoAnalysis } from '@/lib/analysis/seo-opportunities';
import { estimateRevenue } from '@/lib/analysis/revenue-estimation';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/tables/DataTable';
import { ExportButton } from '@/components/tables/ExportButton';
import { ScatterPlot } from '@/components/charts/ScatterPlot';
import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils/format';

export function SeoOpportunities() {
  const { rawData, businessContext } = useGscState();

  const result = useMemo(() => {
    if (!rawData) return null;
    return runSeoAnalysis(rawData.queries);
  }, [rawData]);

  const revenue = useMemo(() => {
    if (!result) return null;
    const totalPotential = result.quickWins.reduce((s, o) => s + o.potentialClicks, 0)
      + result.strikingDistance.reduce((s, o) => s + o.potentialClicks, 0);
    return estimateRevenue(totalPotential, businessContext);
  }, [result, businessContext]);

  if (!result) return <p className="text-[var(--text-muted)]">Brak dostępnych danych</p>;

  const scatterData = result.quickWins.slice(0, 100).map(q => ({
    x: q.impressions,
    y: q.position,
    label: q.query,
  }));

  const cols = [
    { key: 'query', label: 'Zapytanie' },
    { key: 'clicks', label: 'Kliknięcia', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.clicks as number) },
    { key: 'impressions', label: 'Wyświetlenia', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.impressions as number) },
    { key: 'ctr', label: 'CTR', align: 'right' as const, render: (r: Record<string, unknown>) => formatPercent(r.ctr as number) },
    { key: 'position', label: 'Pozycja', align: 'right' as const, render: (r: Record<string, unknown>) => (r.position as number).toFixed(1) },
    { key: 'potentialClicks', label: 'Potencjalne kliknięcia', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.potentialClicks as number) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Szanse SEO</h1>
        <p className="text-[var(--text-secondary)]">Szybkie wygrane, słowa kluczowe w zasięgu i optymalizacja CTR</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Szybkie wygrane" value={String(result.quickWins.length)} subtext="Pozycja 4-10" />
        <MetricCard label="W zasięgu" value={String(result.strikingDistance.length)} subtext="Pozycja 11-20" />
        <MetricCard label="Problemy CTR" value={String(result.ctrOptimizations.length)} subtext="Poniżej benchmarku" />
        {revenue && (
          <MetricCard
            label="Potencjał przychodu"
            value={formatCurrency(revenue.annualRevenue)}
            subtext="/rok szacunkowo"
            color="success"
          />
        )}
      </div>

      {scatterData.length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Szybkie wygrane: Wyświetlenia vs Pozycja</h3>
          <ScatterPlot data={scatterData} />
        </Card>
      )}

      <Tabs tabs={['Szybkie wygrane', 'W zasięgu', 'Optymalizacja CTR', 'Kanibalizacja']}>
        {(tab) => {
          if (tab === 'Szybkie wygrane') return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="success">{result.quickWins.length} szans</Badge>
                <ExportButton data={result.quickWins} filename="szybkie-wygrane.csv" />
              </div>
              <DataTable data={result.quickWins} columns={cols} />
            </div>
          );
          if (tab === 'W zasięgu') return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="warning">{result.strikingDistance.length} słów kluczowych</Badge>
                <ExportButton data={result.strikingDistance} filename="w-zasiegu.csv" />
              </div>
              <DataTable data={result.strikingDistance} columns={cols} />
            </div>
          );
          if (tab === 'Optymalizacja CTR') return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge>{result.ctrOptimizations.length} słów kluczowych</Badge>
                <ExportButton data={result.ctrOptimizations} filename="optymalizacja-ctr.csv" />
              </div>
              <DataTable data={result.ctrOptimizations} columns={cols} />
            </div>
          );
          return (
            <div>
              <Badge variant="danger">{result.cannibalization.length} problemów</Badge>
              <div className="mt-4">
                <DataTable
                  data={result.cannibalization}
                  columns={[
                    { key: 'query', label: 'Zapytanie' },
                    { key: 'pages', label: 'Strony', render: r => String((r.pages as string[]).length) + ' stron' },
                    { key: 'clicks', label: 'Kliknięcia', align: 'right', render: r => formatNumber(r.clicks as number) },
                    { key: 'impressions', label: 'Wyświetlenia', align: 'right', render: r => formatNumber(r.impressions as number) },
                  ]}
                />
              </div>
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}
