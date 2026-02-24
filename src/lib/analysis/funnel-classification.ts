import type { FunnelStage } from '@/types/analysis';

const BOFU_SIGNALS = [
  'pricing', 'free trial', 'demo', 'buy', 'purchase', 'order',
  'login', 'signup', 'sign up', 'subscribe', 'plans',
];
const MOFU_SIGNALS = [
  'best', 'vs', 'versus', 'comparison', 'alternative', 'review',
  'pros and cons', 'benefits', 'features', 'compared',
];
const TOFU_SIGNALS = [
  'what is', 'how to', 'guide', 'tutorial', 'learn',
  'examples', 'definition', '101', 'template',
];

export function classifyFunnelStage(query: string, isBrand?: boolean): FunnelStage {
  if (isBrand) return 'bofu';
  const lower = query.toLowerCase();
  if (BOFU_SIGNALS.some(s => lower.includes(s))) return 'bofu';
  if (MOFU_SIGNALS.some(s => lower.includes(s))) return 'mofu';
  if (TOFU_SIGNALS.some(s => lower.includes(s))) return 'tofu';
  return 'tofu';
}
