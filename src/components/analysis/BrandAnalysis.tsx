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

  if (!result) return <p className="text-[var(--text-muted)]">No data available</p>;

  const { composition, dependencyScore, healthLevel, topBrandKeywords, topNonBrandKeywords, risks, recommendations } = result;
  const healthColor = healthLevel === 'healthy' ? 'success' : healthLevel === 'warning' ? 'warning' : 'danger';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Brand vs Non-Brand</h1>
        <p className="text-[var(--text-secondary)]">Understand your traffic composition and brand dependency</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Brand Clicks" value={formatNumber(composition.brand.clicks)} />
        <MetricCard label="Non-Brand Clicks" value={formatNumber(composition.nonBrand.clicks)} />
        <MetricCard
          label="Brand Dependency"
          value={`${dependencyScore.toFixed(0)}%`}
          color={healthColor}
          subtext={healthLevel}
        />
        <MetricCard label="Brand CTR" value={formatPercent(composition.brand.avgCtr)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Traffic Composition</h3>
          <DonutChart
            data={[
              { name: 'Brand', value: composition.brand.clicks, color: '#6366f1' },
              { name: 'Non-Brand', value: composition.nonBrand.clicks, color: '#22c55e' },
            ]}
            centerLabel={`${dependencyScore.toFixed(0)}%`}
          />
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Health Assessment</h3>
          <div className="space-y-6">
            <ProgressBar value={dependencyScore} label="Brand Dependency" color={healthColor} />
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Composition</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                    <span className="text-[var(--text-muted)]">Brand Queries:</span>{' '}
                    <span className="text-[var(--foreground)]">{composition.brand.queryCount}</span>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                    <span className="text-[var(--text-muted)]">Non-Brand Queries:</span>{' '}
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
              <h3 className="text-sm font-medium text-[var(--danger)] mb-3">Risks</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}
          {recommendations.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-[var(--success)] mb-3">Recommendations</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Top Non-Brand Keywords</h3>
          <ExportButton data={topNonBrandKeywords} filename="non-brand-keywords.csv" />
        </div>
        <DataTable
          data={topNonBrandKeywords}
          columns={[
            { key: 'query', label: 'Query' },
            { key: 'clicks', label: 'Clicks', align: 'right', render: r => formatNumber(r.clicks) },
            { key: 'impressions', label: 'Impressions', align: 'right', render: r => formatNumber(r.impressions) },
            { key: 'ctr', label: 'CTR', align: 'right', render: r => formatPercent(r.ctr) },
            { key: 'position', label: 'Position', align: 'right', render: r => r.position.toFixed(1) },
          ]}
        />
      </Card>
    </div>
  );
}
