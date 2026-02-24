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
    { label: 'Total Clicks', value: formatNumber(s.totalClicks) },
    { label: 'Total Impressions', value: formatNumber(s.totalImpressions) },
    { label: 'Avg CTR', value: formatPercent(s.avgCtr) },
    { label: 'Avg Position', value: s.avgPosition.toFixed(1) },
    { label: 'Total Queries', value: formatNumber(s.totalQueries) },
    { label: 'Quick Wins', value: String(quickWins.length) },
  ];

  const risks: string[] = [];
  if (s.avgPosition > 15) risks.push('Average position is outside page 2 — major visibility gap');
  if (s.avgCtr < 0.02) risks.push('Average CTR below 2% — titles and meta descriptions need improvement');
  if (quickWins.length === 0 && striking.length === 0) risks.push('No quick-win opportunities found — may need new content');

  const opportunities = [
    { label: `${quickWins.length} quick-win keywords (pos 4-10)`, revenueEstimate: revenueEst.annualRevenue * 0.6 },
    { label: `${striking.length} striking-distance keywords (pos 11-20)`, revenueEstimate: revenueEst.annualRevenue * 0.4 },
    { label: `Total potential revenue: ${formatCurrency(revenueEst.annualRevenue)}/yr` },
  ];

  const priorities = [
    'Optimize title tags and meta descriptions for top CTR gap keywords',
    'Create dedicated content for striking-distance topic clusters',
    'Audit and fix keyword cannibalization issues',
    'Build backlinks to pages ranking 4-10 for quick-win keywords',
    'Monitor anomalies and investigate traffic drops',
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
