import type { GscQueryRow } from '@/types/gsc';
import type { ContentOpportunity, ContentAnalysisResult } from '@/types/analysis';
import { classifyFunnelStage } from './funnel-classification';
import { classifyIntent } from '@/lib/constants/intent-signals';

const QUESTION_PREFIXES = ['how', 'what', 'why', 'when', 'where', 'which', 'can', 'does', 'is'];
const COMPARISON_SIGNALS = ['vs', 'versus', 'alternative', 'compared to', 'best', 'top', 'review'];

function scoreOpportunity(queries: GscQueryRow[]): number {
  const totalImp = queries.reduce((s, q) => s + q.impressions, 0);
  const avgPos = queries.reduce((s, q) => s + q.position, 0) / (queries.length || 1);
  const count = queries.length;
  const hasCommercial = queries.some(q => classifyIntent(q.query) === 'high');

  const impScore = totalImp > 5000 ? 10 : totalImp > 1000 ? 7 : totalImp > 500 ? 5 : 3;
  const compScore = avgPos < 20 ? 10 : avgPos < 30 ? 7 : 5;
  const countScore = count > 10 ? 10 : count > 5 ? 7 : 5;
  const intentScore = hasCommercial ? 10 : 5;

  return impScore * 0.4 + compScore * 0.3 + countScore * 0.2 + intentScore * 0.1;
}

export function findQuestionOpportunities(queries: GscQueryRow[]): ContentOpportunity[] {
  const questionQueries = queries.filter(q => {
    const firstWord = q.query.toLowerCase().split(/\s+/)[0];
    return QUESTION_PREFIXES.includes(firstWord);
  });

  // Group by first 3 words
  const groups = new Map<string, GscQueryRow[]>();
  for (const q of questionQueries) {
    const key = q.query.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }

  return [...groups.entries()]
    .map(([label, qs]) => ({
      type: 'question' as const,
      queries: qs.sort((a, b) => b.impressions - a.impressions),
      totalImpressions: qs.reduce((s, q) => s + q.impressions, 0),
      avgPosition: qs.reduce((s, q) => s + q.position, 0) / qs.length,
      score: scoreOpportunity(qs),
      label,
    }))
    .sort((a, b) => b.score - a.score);
}

export function findComparisonGaps(queries: GscQueryRow[]): ContentOpportunity[] {
  const compQueries = queries.filter(q =>
    COMPARISON_SIGNALS.some(s => q.query.toLowerCase().includes(s))
  );

  const groups = new Map<string, GscQueryRow[]>();
  for (const q of compQueries) {
    const lower = q.query.toLowerCase();
    // Group by the comparison target
    const vsMatch = lower.match(/(.+?)\s+vs\s+(.+)/);
    const key = vsMatch ? `${vsMatch[1].trim()} vs ${vsMatch[2].trim()}` : lower.split(/\s+/).slice(0, 4).join(' ');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }

  return [...groups.entries()]
    .map(([label, qs]) => ({
      type: 'comparison' as const,
      queries: qs.sort((a, b) => b.impressions - a.impressions),
      totalImpressions: qs.reduce((s, q) => s + q.impressions, 0),
      avgPosition: qs.reduce((s, q) => s + q.position, 0) / qs.length,
      score: scoreOpportunity(qs),
      label,
    }))
    .sort((a, b) => b.score - a.score);
}

export function findTopicGaps(queries: GscQueryRow[]): ContentOpportunity[] {
  // Group by 2-gram overlap (simple clustering)
  const groups = new Map<string, GscQueryRow[]>();
  for (const q of queries) {
    const words = q.query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length < 2) continue;
    const key = words.slice(0, 2).join(' ');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }

  return [...groups.entries()]
    .filter(([, qs]) => qs.length >= 3) // Only clusters with 3+ queries
    .filter(([, qs]) => {
      const totalImp = qs.reduce((s, q) => s + q.impressions, 0);
      return totalImp > 500;
    })
    .map(([label, qs]) => ({
      type: 'topic_gap' as const,
      queries: qs.sort((a, b) => b.impressions - a.impressions),
      totalImpressions: qs.reduce((s, q) => s + q.impressions, 0),
      avgPosition: qs.reduce((s, q) => s + q.position, 0) / qs.length,
      score: scoreOpportunity(qs),
      label,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
}

export function runContentAnalysis(queries: GscQueryRow[]): ContentAnalysisResult {
  let tofu = 0, mofu = 0, bofu = 0;
  for (const q of queries) {
    const stage = classifyFunnelStage(q.query, q.isBrand);
    if (stage === 'tofu') tofu += q.clicks;
    else if (stage === 'mofu') mofu += q.clicks;
    else bofu += q.clicks;
  }

  return {
    questionOpportunities: findQuestionOpportunities(queries),
    comparisonGaps: findComparisonGaps(queries),
    topicGaps: findTopicGaps(queries),
    funnelBreakdown: { tofu, mofu, bofu },
  };
}
