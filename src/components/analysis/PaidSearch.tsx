'use client';

import { useMemo } from 'react';
import { useGscState } from '@/store/gsc-store';
import { runPaidSearchAnalysis } from '@/lib/analysis/paid-search';
import { MetricCard } from '@/components/ui/MetricCard';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/tables/DataTable';
import { ExportButton } from '@/components/tables/ExportButton';
import { formatNumber, formatPercent } from '@/lib/utils/format';

const cols = [
  { key: 'query', label: 'Query' },
  { key: 'impressions', label: 'Impressions', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.impressions as number) },
  { key: 'clicks', label: 'Clicks', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.clicks as number) },
  { key: 'ctr', label: 'CTR', align: 'right' as const, render: (r: Record<string, unknown>) => formatPercent(r.ctr as number) },
  { key: 'position', label: 'Position', align: 'right' as const, render: (r: Record<string, unknown>) => (r.position as number).toFixed(1) },
  { key: 'intentLevel', label: 'Intent', render: (r: Record<string, unknown>) => {
    const level = r.intentLevel as string;
    return level === 'high' ? '🔴 High' : level === 'medium' ? '🟡 Medium' : '🔵 Low';
  }},
  { key: 'bidStrategy', label: 'Strategy' },
];

export function PaidSearch() {
  const { rawData } = useGscState();

  const result = useMemo(() => {
    if (!rawData) return null;
    return runPaidSearchAnalysis(rawData.queries);
  }, [rawData]);

  if (!result) return <p className="text-[var(--text-muted)]">No data available</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Paid Search Strategy</h1>
        <p className="text-[var(--text-secondary)]">PPC opportunities based on your organic data</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Non-Ranking High Intent" value={String(result.nonRanking.length)} subtext="Position 20+" />
        <MetricCard label="SERP Domination" value={String(result.serpDomination.length)} subtext="Already ranking 1-5" />
        <MetricCard label="Competitor Conquesting" value={String(result.competitorConquesting.length)} />
      </div>

      <Tabs tabs={['Non-Ranking', 'SERP Domination', 'Competitor']}>
        {(tab) => {
          const data = tab === 'Non-Ranking'
            ? result.nonRanking
            : tab === 'SERP Domination'
              ? result.serpDomination
              : result.competitorConquesting;

          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge>{data.length} keywords</Badge>
                <ExportButton data={data} filename={`paid-${tab.toLowerCase().replace(/\s+/g, '-')}.csv`} />
              </div>
              <DataTable data={data} columns={cols} />
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}
