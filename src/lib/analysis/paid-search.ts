import type { GscQueryRow } from '@/types/gsc';
import type { PaidSearchOpportunity, PaidSearchResult } from '@/types/analysis';
import { classifyIntent } from '@/lib/constants/intent-signals';

export function findNonRankingHighIntent(queries: GscQueryRow[]): PaidSearchOpportunity[] {
  return queries
    .filter(q => q.position > 20 && classifyIntent(q.query) !== 'low' && q.impressions > 100)
    .map(q => ({
      ...q,
      campaignType: 'non_ranking' as const,
      intentLevel: classifyIntent(q.query),
      bidStrategy: 'Aggressive bid — no organic presence',
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

export function findSerpDomination(queries: GscQueryRow[]): PaidSearchOpportunity[] {
  return queries
    .filter(q => q.position <= 5 && classifyIntent(q.query) !== 'low' && q.impressions > 200)
    .map(q => ({
      ...q,
      campaignType: 'serp_domination' as const,
      intentLevel: classifyIntent(q.query),
      bidStrategy: 'Medium bid — complement organic ranking',
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

export function findCompetitorConquesting(queries: GscQueryRow[]): PaidSearchOpportunity[] {
  const competitorSignals = ['alternative', 'vs', 'versus', 'compared', 'competitor', 'switch from', 'migrate from'];
  return queries
    .filter(q => competitorSignals.some(s => q.query.toLowerCase().includes(s)))
    .map(q => ({
      ...q,
      campaignType: 'competitor_conquesting' as const,
      intentLevel: classifyIntent(q.query),
      bidStrategy: 'Strategic bid — capture competitor traffic',
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

export function runPaidSearchAnalysis(queries: GscQueryRow[]): PaidSearchResult {
  return {
    nonRanking: findNonRankingHighIntent(queries),
    serpDomination: findSerpDomination(queries),
    competitorConquesting: findCompetitorConquesting(queries),
  };
}
