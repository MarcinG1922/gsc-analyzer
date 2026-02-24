'use client';

import { useMemo } from 'react';
import { useGscState } from '@/store/gsc-store';
import { runContentAnalysis } from '@/lib/analysis/content-strategy';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { DataTable } from '@/components/tables/DataTable';
import { formatNumber } from '@/lib/utils/format';
import type { ContentOpportunity } from '@/types/analysis';

const opportunityCols = [
  { key: 'label', label: 'Temat' },
  {
    key: 'queries',
    label: 'Zapytania',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => String((r.queries as unknown[]).length),
  },
  {
    key: 'totalImpressions',
    label: 'Wyświetlenia',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => formatNumber(r.totalImpressions as number),
  },
  {
    key: 'avgPosition',
    label: 'Śr. pozycja',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => (r.avgPosition as number).toFixed(1),
  },
  {
    key: 'score',
    label: 'Wynik',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => (r.score as number).toFixed(1),
  },
];

export function ContentStrategy() {
  const { rawData } = useGscState();

  const result = useMemo(() => {
    if (!rawData) return null;
    return runContentAnalysis(rawData.queries);
  }, [rawData]);

  if (!result) return <p className="text-[var(--text-muted)]">Brak dostępnych danych</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Strategia treści</h1>
        <p className="text-[var(--text-secondary)]">Luki w treści, pytania użytkowników i analiza lejka</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Luki tematyczne" value={String(result.topicGaps.length)} />
        <MetricCard label="Pytania" value={String(result.questionOpportunities.length)} />
        <MetricCard label="Porównania" value={String(result.comparisonGaps.length)} />
        <MetricCard label="Łącznie szans" value={String(
          result.topicGaps.length + result.questionOpportunities.length + result.comparisonGaps.length
        )} color="success" />
      </div>

      <Card>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Podział lejka (wg kliknięć)</h3>
        <FunnelChart {...result.funnelBreakdown} />
      </Card>

      <Tabs tabs={['Luki tematyczne', 'Pytania', 'Porównania']}>
        {(tab) => {
          let data: ContentOpportunity[] = [];
          if (tab === 'Luki tematyczne') data = result.topicGaps;
          if (tab === 'Pytania') data = result.questionOpportunities;
          if (tab === 'Porównania') data = result.comparisonGaps;

          return (
            <div>
              <Badge variant="success">{data.length} szans</Badge>
              <div className="mt-4">
                <DataTable data={data as unknown as Record<string, unknown>[]} columns={opportunityCols} />
              </div>
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}
