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
    risks.push(`Ruch brandowy to ${dependencyScore.toFixed(0)}% wszystkich kliknięć — wysokie ryzyko zależności`);
    recommendations.push('Zainwestuj w treści niebrandowe i SEO, aby zdywersyfikować źródła ruchu');
  } else if (healthLevel === 'warning') {
    risks.push(`Ruch brandowy na poziomie ${dependencyScore.toFixed(0)}% — zbliża się do niezdrowej zależności`);
    recommendations.push('Zacznij budować pipeline treści niebrandowych, aby zmniejszyć zależność od marki');
  }

  if (nonBrandSummary.avgCtr < 0.02) {
    risks.push('CTR niebrandowy jest poniżej 2% — tytuły i opisy meta mogą wymagać optymalizacji');
    recommendations.push('Przejrzyj tagi title i meta description dla top niebrandowych zapytań');
  }

  if (nonBrandSummary.avgPosition > 10) {
    risks.push('Średnia pozycja niebrandowa jest poza stroną 1');
    recommendations.push('Skup się na jakości treści i linkach zwrotnych dla kluczowych fraz niebrandowych');
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
