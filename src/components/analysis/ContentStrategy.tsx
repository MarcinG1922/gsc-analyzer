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
  { key: 'label', label: 'Topic' },
  {
    key: 'queries',
    label: 'Queries',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => String((r.queries as unknown[]).length),
  },
  {
    key: 'totalImpressions',
    label: 'Impressions',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => formatNumber(r.totalImpressions as number),
  },
  {
    key: 'avgPosition',
    label: 'Avg Position',
    align: 'right' as const,
    render: (r: Record<string, unknown>) => (r.avgPosition as number).toFixed(1),
  },
  {
    key: 'score',
    label: 'Score',
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

  if (!result) return <p className="text-[var(--text-muted)]">No data available</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Content Strategy</h1>
        <p className="text-[var(--text-secondary)]">Content gaps, question opportunities, and funnel analysis</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Topic Gaps" value={String(result.topicGaps.length)} />
        <MetricCard label="Question Opps" value={String(result.questionOpportunities.length)} />
        <MetricCard label="Comparison Gaps" value={String(result.comparisonGaps.length)} />
        <MetricCard label="Total Opportunities" value={String(
          result.topicGaps.length + result.questionOpportunities.length + result.comparisonGaps.length
        )} color="success" />
      </div>

      <Card>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Funnel Breakdown (by clicks)</h3>
        <FunnelChart {...result.funnelBreakdown} />
      </Card>

      <Tabs tabs={['Topic Gaps', 'Questions', 'Comparisons']}>
        {(tab) => {
          let data: ContentOpportunity[] = [];
          if (tab === 'Topic Gaps') data = result.topicGaps;
          if (tab === 'Questions') data = result.questionOpportunities;
          if (tab === 'Comparisons') data = result.comparisonGaps;

          return (
            <div>
              <Badge variant="success">{data.length} opportunities</Badge>
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
