import type { GscQueryRow } from '@/types/gsc';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'how', 'what', 'why', 'when', 'where',
  'which', 'that', 'this', 'from', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'can', 'login', 'free', 'best', 'top', 'new', 'use', 'get',
]);

export interface BrandDetectionResult {
  likelyBrand: string[];
  uncertain: string[];
  detectedRoots: string[];
}

export function detectBrandTerms(
  queries: GscQueryRow[],
  brandHints?: string[]
): BrandDetectionResult {
  if (!queries.length) return { likelyBrand: [], uncertain: [], detectedRoots: [] };

  const sorted = [...queries].sort((a, b) => b.clicks - a.clicks);
  const brandCandidates = sorted
    .filter(q => q.ctr > 0.25 && q.position < 2.5 && q.clicks > 100)
    .slice(0, 20);

  const rootCounts = new Map<string, number>();
  for (const q of brandCandidates) {
    for (const word of q.query.toLowerCase().split(/\s+/)) {
      if (word.length > 2 && !STOP_WORDS.has(word)) {
        rootCounts.set(word, (rootCounts.get(word) || 0) + 1);
      }
    }
  }

  const brandRoots = new Set<string>();
  for (const [word, count] of rootCounts) {
    if (count >= 2 || brandCandidates.length <= 3) brandRoots.add(word);
  }
  brandHints?.forEach(h => brandRoots.add(h.toLowerCase()));

  const likelyBrand: string[] = [];
  const uncertain: string[] = [];
  const seen = new Set<string>();

  for (const q of sorted.slice(0, 200)) {
    const text = q.query.toLowerCase();
    const containsBrand = [...brandRoots].some(root => text.includes(root));
    if (!containsBrand || seen.has(text)) continue;
    seen.add(text);

    if (q.ctr > 0.15 && q.position < 3) {
      likelyBrand.push(q.query);
    } else {
      uncertain.push(q.query);
    }
  }

  return { likelyBrand, uncertain, detectedRoots: [...brandRoots] };
}

export function classifyWithBrandTerms(
  queries: GscQueryRow[],
  brandTerms: string[]
): { brand: GscQueryRow[]; nonBrand: GscQueryRow[] } {
  if (!brandTerms.length) return { brand: [], nonBrand: [...queries] };

  const patterns = brandTerms.map(term => {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped.replace(/\s+/g, '[\\s._-]*');
  });
  const regex = new RegExp(patterns.join('|'), 'i');

  const brand: GscQueryRow[] = [];
  const nonBrand: GscQueryRow[] = [];

  for (const q of queries) {
    if (regex.test(q.query)) {
      brand.push({ ...q, isBrand: true });
    } else {
      nonBrand.push({ ...q, isBrand: false });
    }
  }

  return { brand, nonBrand };
}
