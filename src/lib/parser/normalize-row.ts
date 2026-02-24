import type { GscRow } from '@/types/gsc';

const KEY_MAPPING: Record<string, string> = {
  // English
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
  search_appearance: 'search_appearance',

  // Polish (GSC export in Polish)
  'kliknięcia': 'clicks',
  'klikniecia': 'clicks',
  'wyświetlenia': 'impressions',
  'wyswietlenia': 'impressions',
  'pozycja': 'position',
  'najczęstsze_zapytania': 'query',
  'najczestsze_zapytania': 'query',
  'zapytania': 'query',
  'zapytanie': 'query',
  'najpopularniejsze_strony': 'page',
  'strona': 'page',
  'strony': 'page',
  'kraj': 'country',
  'urządzenie': 'device',
  'urzadzenie': 'device',
  'data': 'date',
  'wygląd_w_wyszukiwarce': 'search_appearance',
  'wyglad_w_wyszukiwarce': 'search_appearance',

  // German (GSC export in German)
  'klicks': 'clicks',
  'impressionen': 'impressions',
  'suchanfragen': 'query',
  'seiten': 'page',
  'land': 'country',
  'gerät': 'device',
  'gerat': 'device',
  'datum': 'date',

  // French
  'clics': 'clicks',
  'requêtes': 'query',
  'requetes': 'query',
  'pays': 'country',
  'appareil': 'device',

  // Spanish
  'consultas': 'query',
  'páginas': 'page',
  'paginas': 'page',
  'país': 'country',
  'pais': 'country',
  'dispositivo': 'device',
  'fecha': 'date',
};

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeRow(row: Record<string, string>): GscRow {
  const normalized: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(row)) {
    // Normalize key: lowercase, trim, replace spaces with _, remove "top_" prefix
    let cleanKey = rawKey.toLowerCase().trim().replace(/\s+/g, '_').replace(/^top_/, '');
    // Try direct mapping first
    let finalKey = KEY_MAPPING[cleanKey];
    // If not found, try without diacritics
    if (!finalKey) {
      const noDiacritics = removeDiacritics(cleanKey);
      finalKey = KEY_MAPPING[noDiacritics] ?? noDiacritics;
    }

    if (finalKey === 'clicks' || finalKey === 'impressions') {
      // Handle both "1,234" (EN thousand sep) and "1 234" (PL thousand sep)
      normalized[finalKey] = parseInt(String(value).replace(/[\s,.\u00a0]/g, ''), 10) || 0;
    } else if (finalKey === 'ctr') {
      const strVal = String(value).replace(',', '.');
      if (strVal.includes('%')) {
        normalized[finalKey] = parseFloat(strVal.replace('%', '').replace(/\s/g, '')) / 100;
      } else {
        const num = parseFloat(strVal) || 0;
        normalized[finalKey] = num > 1 ? num / 100 : num;
      }
    } else if (finalKey === 'position') {
      // Handle Polish decimal separator (comma)
      normalized[finalKey] = parseFloat(String(value).replace(',', '.').replace(/\s/g, '')) || 0;
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
