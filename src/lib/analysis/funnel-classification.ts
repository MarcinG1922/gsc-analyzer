import type { FunnelStage } from '@/types/analysis';

const BOFU_SIGNALS = [
  'pricing', 'free trial', 'demo', 'buy', 'purchase', 'order',
  'login', 'signup', 'sign up', 'subscribe', 'plans',
  // Polish
  'kup', 'kupić', 'zamów', 'zamówienie', 'cennik', 'cena',
  'logowanie', 'rejestracja', 'sklep', 'oferta', 'dostawa',
];
const MOFU_SIGNALS = [
  'best', 'vs', 'versus', 'comparison', 'alternative', 'review',
  'pros and cons', 'benefits', 'features', 'compared',
  // Polish
  'najlepszy', 'najlepsza', 'najlepsze', 'porównanie', 'alternatywa',
  'opinia', 'opinie', 'recenzja', 'ranking', 'wady i zalety',
];
const TOFU_SIGNALS = [
  'what is', 'how to', 'guide', 'tutorial', 'learn',
  'examples', 'definition', '101', 'template',
  // Polish
  'co to', 'jak', 'poradnik', 'instrukcja', 'przykłady',
  'definicja', 'szablony', 'co oznacza',
];

export function classifyFunnelStage(query: string, isBrand?: boolean): FunnelStage {
  if (isBrand) return 'bofu';
  const lower = query.toLowerCase();
  if (BOFU_SIGNALS.some(s => lower.includes(s))) return 'bofu';
  if (MOFU_SIGNALS.some(s => lower.includes(s))) return 'mofu';
  if (TOFU_SIGNALS.some(s => lower.includes(s))) return 'tofu';
  return 'tofu';
}
