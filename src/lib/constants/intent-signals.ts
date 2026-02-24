export const HIGH_INTENT_SIGNALS = [
  'buy', 'purchase', 'order', 'pricing', 'cost', 'quote',
  'demo', 'trial', 'free trial', 'near me', 'same day',
  'plans', 'subscribe',
];

export const MEDIUM_INTENT_SIGNALS = [
  'best', 'vs', 'versus', 'alternative', 'compared',
  'pros and cons', 'benefits', 'features', 'review', 'reviews',
];

export const LOW_INTENT_SIGNALS = [
  'what is', 'how to', 'guide', 'tutorial', 'learn',
  'examples', 'templates', 'definition',
];

export function classifyIntent(query: string): 'high' | 'medium' | 'low' {
  const lower = query.toLowerCase();
  if (HIGH_INTENT_SIGNALS.some(s => lower.includes(s))) return 'high';
  if (MEDIUM_INTENT_SIGNALS.some(s => lower.includes(s))) return 'medium';
  return 'low';
}
