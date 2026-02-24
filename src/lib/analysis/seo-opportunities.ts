import type { GscQueryRow } from '@/types/gsc';
import type { SeoOpportunity, SeoAnalysisResult, CannibalizationIssue } from '@/types/analysis';
import { CTR_BENCHMARKS, CTR_BELOW_AVERAGE, getPositionBucket } from '@/lib/constants/ctr-benchmarks';

export function findQuickWins(queries: GscQueryRow[]): SeoOpportunity[] {
  return queries
    .filter(q => q.position >= 4 && q.position <= 10 && q.impressions > 500)
    .filter(q => q.ctr < (CTR_BELOW_AVERAGE[getPositionBucket(q.position)] ?? 0.02))
    .map(q => {
      const bucket = getPositionBucket(q.position);
      const expected = CTR_BENCHMARKS[bucket] ?? 0.035;
      return {
        ...q,
        opportunityType: 'quick_win' as const,
        expectedCtr: expected,
        ctrGap: expected - q.ctr,
        potentialClicks: Math.round(q.impressions * (expected - q.ctr)),
      };
    })
    .sort((a, b) => b.potentialClicks - a.potentialClicks);
}

export function findStrikingDistance(queries: GscQueryRow[]): SeoOpportunity[] {
  return queries
    .filter(q => q.position >= 11 && q.position <= 20 && q.impressions > 200)
    .map(q => ({
      ...q,
      opportunityType: 'striking_distance' as const,
      potentialClicks: Math.round(q.impressions * 0.06),
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

export function findHighVolumeUnderperformers(queries: GscQueryRow[]): SeoOpportunity[] {
  return queries
    .filter(q => q.impressions > 1000 && q.position > 5 && q.ctr < 0.02)
    .map(q => ({
      ...q,
      opportunityType: 'high_volume_underperformer' as const,
      potentialClicks: Math.round(q.impressions * 0.05),
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

export function findCtrOptimizations(queries: GscQueryRow[]): SeoOpportunity[] {
  return queries
    .filter(q => q.position <= 5 && q.impressions > 100)
    .filter(q => {
      const bucket = getPositionBucket(q.position);
      return q.ctr < (CTR_BELOW_AVERAGE[bucket] ?? 0.04);
    })
    .map(q => {
      const bucket = getPositionBucket(q.position);
      const expected = CTR_BENCHMARKS[bucket] ?? 0.065;
      return {
        ...q,
        opportunityType: 'ctr_optimization' as const,
        expectedCtr: expected,
        ctrGap: expected - q.ctr,
        potentialClicks: Math.round(q.impressions * (expected - q.ctr)),
      };
    })
    .sort((a, b) => b.potentialClicks - a.potentialClicks);
}

export function detectCannibalization(queries: GscQueryRow[]): CannibalizationIssue[] {
  // Group queries that appear with multiple pages
  const queryPages = new Map<string, Set<string>>();
  const queryStats = new Map<string, { clicks: number; impressions: number }>();

  for (const q of queries) {
    if (!q.page) continue;
    const key = q.query.toLowerCase();
    if (!queryPages.has(key)) queryPages.set(key, new Set());
    queryPages.get(key)!.add(q.page);
    const stats = queryStats.get(key) || { clicks: 0, impressions: 0 };
    stats.clicks += q.clicks;
    stats.impressions += q.impressions;
    queryStats.set(key, stats);
  }

  const issues: CannibalizationIssue[] = [];
  for (const [query, pages] of queryPages) {
    if (pages.size >= 2) {
      const stats = queryStats.get(query)!;
      issues.push({
        query,
        pages: [...pages],
        clicks: stats.clicks,
        impressions: stats.impressions,
      });
    }
  }

  return issues.sort((a, b) => b.impressions - a.impressions);
}

export function runSeoAnalysis(queries: GscQueryRow[]): SeoAnalysisResult {
  return {
    quickWins: findQuickWins(queries),
    strikingDistance: findStrikingDistance(queries),
    highVolumeUnderperformers: findHighVolumeUnderperformers(queries),
    ctrOptimizations: findCtrOptimizations(queries),
    cannibalization: detectCannibalization(queries),
  };
}
