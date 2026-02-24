import type { GscQueryRow, BrandSummary } from '@/types/gsc';
import type { BrandAnalysisResult } from '@/types/analysis';
import { classifyWithBrandTerms } from './brand-detection';
import { getBrandHealthLevel } from '@/lib/constants/health-thresholds';

function buildSummary(rows: GscQueryRow[], totalClicks: number): BrandSummary {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = impressions > 0 ? clicks / impressions : 0;
  const avgPosition = rows.length > 0 ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;

  return {
    queryCount: rows.length,
    clicks,
    impressions,
    clickShare: totalClicks > 0 ? clicks / totalClicks : 0,
    avgCtr,
    avgPosition,
  };
}

export function runBrandAnalysis(
  queries: GscQueryRow[],
  brandTerms: string[]
): BrandAnalysisResult {
  const { brand, nonBrand } = classifyWithBrandTerms(queries, brandTerms);
  const totalClicks = queries.reduce((s, r) => s + r.clicks, 0);

  const brandSummary = buildSummary(brand, totalClicks);
  const nonBrandSummary = buildSummary(nonBrand, totalClicks);
  const dependencyScore = brandSummary.clickShare * 100;
  const healthLevel = getBrandHealthLevel(dependencyScore);

  const risks: string[] = [];
  const recommendations: string[] = [];

  if (healthLevel === 'critical') {
    risks.push(`Brand traffic is ${dependencyScore.toFixed(0)}% of total clicks — high dependency risk`);
    recommendations.push('Invest heavily in non-brand content and SEO to diversify traffic sources');
  } else if (healthLevel === 'warning') {
    risks.push(`Brand traffic at ${dependencyScore.toFixed(0)}% — approaching unhealthy dependency`);
    recommendations.push('Start building non-brand content pipeline to reduce brand dependency');
  }

  if (nonBrandSummary.avgCtr < 0.02) {
    risks.push('Non-brand CTR is below 2% — titles and meta descriptions may need optimization');
    recommendations.push('Audit title tags and meta descriptions for top non-brand queries');
  }

  if (nonBrandSummary.avgPosition > 10) {
    risks.push('Average non-brand position is outside page 1');
    recommendations.push('Focus on content quality and backlinks for core non-brand keywords');
  }

  return {
    composition: { brand: brandSummary, nonBrand: nonBrandSummary },
    dependencyScore,
    healthLevel,
    topBrandKeywords: brand.sort((a, b) => b.clicks - a.clicks).slice(0, 20),
    topNonBrandKeywords: nonBrand.sort((a, b) => b.clicks - a.clicks).slice(0, 20),
    risks,
    recommendations,
  };
}
