import type { GscRow } from '@/types/gsc';

const KEY_MAPPING: Record<string, string> = {
  clicks: 'clicks',
  top_clicks: 'clicks',
  impressions: 'impressions',
  top_impressions: 'impressions',
  ctr: 'ctr',
  top_ctr: 'ctr',
  position: 'position',
  average_position: 'position',
  avg_position: 'position',
  query: 'query',
  queries: 'query',
  top_queries: 'query',
  page: 'page',
  pages: 'page',
  url: 'page',
  country: 'country',
  device: 'device',
  date: 'date',
};

export function normalizeRow(row: Record<string, string>): GscRow {
  const normalized: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(row)) {
    const cleanKey = rawKey.toLowerCase().trim().replace(/\s+/g, '_').replace(/^top_/, '');
    const finalKey = KEY_MAPPING[cleanKey] ?? cleanKey;

    if (finalKey === 'clicks' || finalKey === 'impressions') {
      normalized[finalKey] = parseInt(String(value).replace(/,/g, ''), 10) || 0;
    } else if (finalKey === 'ctr') {
      const strVal = String(value);
      if (strVal.includes('%')) {
        normalized[finalKey] = parseFloat(strVal.replace('%', '').replace(/,/g, '')) / 100;
      } else {
        const num = parseFloat(strVal) || 0;
        normalized[finalKey] = num > 1 ? num / 100 : num;
      }
    } else if (finalKey === 'position') {
      normalized[finalKey] = parseFloat(String(value).replace(/,/g, '')) || 0;
    } else {
      normalized[finalKey] = value;
    }
  }

  // Ensure required numeric fields have defaults
  normalized.clicks = normalized.clicks ?? 0;
  normalized.impressions = normalized.impressions ?? 0;
  normalized.ctr = normalized.ctr ?? 0;
  normalized.position = normalized.position ?? 0;

  return normalized as GscRow;
}
