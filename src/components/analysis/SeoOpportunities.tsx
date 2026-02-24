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

  if (!result) return <p className="text-[var(--text-muted)]">No data available</p>;

  const scatterData = result.quickWins.slice(0, 100).map(q => ({
    x: q.impressions,
    y: q.position,
    label: q.query,
  }));

  const cols = [
    { key: 'query', label: 'Query' },
    { key: 'clicks', label: 'Clicks', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.clicks as number) },
    { key: 'impressions', label: 'Impressions', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.impressions as number) },
    { key: 'ctr', label: 'CTR', align: 'right' as const, render: (r: Record<string, unknown>) => formatPercent(r.ctr as number) },
    { key: 'position', label: 'Position', align: 'right' as const, render: (r: Record<string, unknown>) => (r.position as number).toFixed(1) },
    { key: 'potentialClicks', label: 'Potential Clicks', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.potentialClicks as number) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">SEO Opportunities</h1>
        <p className="text-[var(--text-secondary)]">Quick wins, striking distance keywords, and CTR optimization</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Quick Wins" value={String(result.quickWins.length)} subtext="Position 4-10" />
        <MetricCard label="Striking Distance" value={String(result.strikingDistance.length)} subtext="Position 11-20" />
        <MetricCard label="CTR Issues" value={String(result.ctrOptimizations.length)} subtext="Below benchmark" />
        {revenue && (
          <MetricCard
            label="Revenue Potential"
            value={formatCurrency(revenue.annualRevenue)}
            subtext="/year estimated"
            color="success"
          />
        )}
      </div>

      {scatterData.length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Quick Wins: Impressions vs Position</h3>
          <ScatterPlot data={scatterData} />
        </Card>
      )}

      <Tabs tabs={['Quick Wins', 'Striking Distance', 'CTR Optimization', 'Cannibalization']}>
        {(tab) => {
          if (tab === 'Quick Wins') return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="success">{result.quickWins.length} opportunities</Badge>
                <ExportButton data={result.quickWins} filename="quick-wins.csv" />
              </div>
              <DataTable data={result.quickWins} columns={cols} />
            </div>
          );
          if (tab === 'Striking Distance') return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="warning">{result.strikingDistance.length} keywords</Badge>
                <ExportButton data={result.strikingDistance} filename="striking-distance.csv" />
              </div>
              <DataTable data={result.strikingDistance} columns={cols} />
            </div>
          );
          if (tab === 'CTR Optimization') return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge>{result.ctrOptimizations.length} keywords</Badge>
                <ExportButton data={result.ctrOptimizations} filename="ctr-optimization.csv" />
              </div>
              <DataTable data={result.ctrOptimizations} columns={cols} />
            </div>
          );
          return (
            <div>
              <Badge variant="danger">{result.cannibalization.length} issues</Badge>
              <div className="mt-4">
                <DataTable
                  data={result.cannibalization}
                  columns={[
                    { key: 'query', label: 'Query' },
                    { key: 'pages', label: 'Pages', render: r => String((r.pages as string[]).length) + ' pages' },
                    { key: 'clicks', label: 'Clicks', align: 'right', render: r => formatNumber(r.clicks as number) },
                    { key: 'impressions', label: 'Impressions', align: 'right', render: r => formatNumber(r.impressions as number) },
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
