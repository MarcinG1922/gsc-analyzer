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
  { key: 'query', label: 'Zapytanie' },
  { key: 'impressions', label: 'Wyświetlenia', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.impressions as number) },
  { key: 'clicks', label: 'Kliknięcia', align: 'right' as const, render: (r: Record<string, unknown>) => formatNumber(r.clicks as number) },
  { key: 'ctr', label: 'CTR', align: 'right' as const, render: (r: Record<string, unknown>) => formatPercent(r.ctr as number) },
  { key: 'position', label: 'Pozycja', align: 'right' as const, render: (r: Record<string, unknown>) => (r.position as number).toFixed(1) },
  { key: 'intentLevel', label: 'Intencja', render: (r: Record<string, unknown>) => {
    const level = r.intentLevel as string;
    return level === 'high' ? '🔴 Wysoka' : level === 'medium' ? '🟡 Średnia' : '🔵 Niska';
  }},
  { key: 'bidStrategy', label: 'Strategia' },
];

export function PaidSearch() {
  const { rawData } = useGscState();

  const result = useMemo(() => {
    if (!rawData) return null;
    return runPaidSearchAnalysis(rawData.queries);
  }, [rawData]);

  if (!result) return <p className="text-[var(--text-muted)]">Brak dostępnych danych</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Strategia płatnego wyszukiwania</h1>
        <p className="text-[var(--text-secondary)]">Szanse PPC na podstawie danych organicznych</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Wysokointencyjne bez pozycji" value={String(result.nonRanking.length)} subtext="Pozycja 20+" />
        <MetricCard label="Dominacja SERP" value={String(result.serpDomination.length)} subtext="Już w top 1-5" />
        <MetricCard label="Podbijanie konkurencji" value={String(result.competitorConquesting.length)} />
      </div>

      <Tabs tabs={['Bez pozycji', 'Dominacja SERP', 'Konkurencja']}>
        {(tab) => {
          const data = tab === 'Bez pozycji'
            ? result.nonRanking
            : tab === 'Dominacja SERP'
              ? result.serpDomination
              : result.competitorConquesting;

          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge>{data.length} słów kluczowych</Badge>
                <ExportButton data={data} filename={`platne-${tab.toLowerCase().replace(/\s+/g, '-')}.csv`} />
              </div>
              <DataTable data={data} columns={cols} />
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}
