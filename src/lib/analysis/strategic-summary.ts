import type { GscParsedData } from '@/types/gsc';
import type { BusinessContext } from '@/types/business-context';
import type { StrategicSummaryResult } from '@/types/analysis';
import { classifyFunnelStage } from './funnel-classification';
import { detectAnomalies } from './anomaly-detection';
import { findQuickWins, findStrikingDistance } from './seo-opportunities';
import { estimateRevenue } from './revenue-estimation';
import { formatNumber, formatPercent, formatCurrency } from '@/lib/utils/format';

export function runStrategicSummary(
  data: GscParsedData,
  brandTerms: string[],
  ctx: BusinessContext
): StrategicSummaryResult {
  const q = data.queries;
  const s = data.summary;

  const quickWins = findQuickWins(q);
  const striking = findStrikingDistance(q);
  const totalPotentialClicks = quickWins.reduce((sum, o) => sum + o.potentialClicks, 0)
    + striking.reduce((sum, o) => sum + o.potentialClicks, 0);
  const revenueEst = estimateRevenue(totalPotentialClicks, ctx);

  let tofu = 0, mofu = 0, bofu = 0;
  for (const query of q) {
    const stage = classifyFunnelStage(query.query, query.isBrand);
    if (stage === 'tofu') tofu += query.clicks;
    else if (stage === 'mofu') mofu += query.clicks;
    else bofu += query.clicks;
  }

  const headlineMetrics = [
    { label: 'Łączne kliknięcia', value: formatNumber(s.totalClicks) },
    { label: 'Łączne wyświetlenia', value: formatNumber(s.totalImpressions) },
    { label: 'Śr. CTR', value: formatPercent(s.avgCtr) },
    { label: 'Śr. pozycja', value: s.avgPosition.toFixed(1) },
    { label: 'Łączne zapytania', value: formatNumber(s.totalQueries) },
    { label: 'Szybkie wygrane', value: String(quickWins.length) },
  ];

  const risks: string[] = [];
  if (s.avgPosition > 15) risks.push('Średnia pozycja poza stroną 2 — duża luka widoczności');
  if (s.avgCtr < 0.02) risks.push('Średni CTR poniżej 2% — tytuły i meta opisy wymagają poprawy');
  if (quickWins.length === 0 && striking.length === 0) risks.push('Brak szans na szybkie wygrane — potrzebne nowe treści');

  const opportunities = [
    { label: `${quickWins.length} szybkich wygranych (poz. 4-10)`, revenueEstimate: revenueEst.annualRevenue * 0.6 },
    { label: `${striking.length} fraz w zasięgu (poz. 11-20)`, revenueEstimate: revenueEst.annualRevenue * 0.4 },
    { label: `Potencjalny przychód: ${formatCurrency(revenueEst.annualRevenue)}/rok` },
  ];

  const priorities = [
    'Zoptymalizuj tagi title i meta description dla fraz z lukami CTR',
    'Stwórz dedykowane treści dla klastrów tematycznych w zasięgu',
    'Przeprowadź audyt i napraw problemy z kanibalizacją słów kluczowych',
    'Buduj linki zwrotne do stron na pozycjach 4-10 dla szybkich wygranych',
    'Monitoruj anomalie i badaj spadki ruchu',
  ];

  return {
    headlineMetrics,
    risks,
    opportunities,
    anomalies: detectAnomalies(q),
    funnelBreakdown: { tofu, mofu, bofu },
    priorities,
  };
}
