import type { GscRow, GscParsedData } from '@/types/gsc';

export function categorizeData(
  results: GscParsedData,
  filename: string,
  rows: GscRow[]
) {
  const lower = filename.toLowerCase();

  if (lower.includes('quer')) {
    for (const row of rows) {
      if (row.query) {
        results.queries.push(row as GscParsedData['queries'][number]);
      }
    }
  } else if (lower.includes('page') || lower.includes('url')) {
    for (const row of rows) {
      if (row.page) {
        results.pages.push(row as GscParsedData['pages'][number]);
      }
    }
  } else if (lower.includes('countr')) {
    results.countries.push(...rows);
  } else if (lower.includes('device')) {
    results.devices.push(...rows);
  } else if (lower.includes('date') || lower.includes('chart')) {
    results.dates.push(...rows);
  } else {
    // Try to auto-detect from columns
    if (rows.length > 0) {
      const first = rows[0];
      if (first.query) {
        for (const row of rows) {
          if (row.query) results.queries.push(row as GscParsedData['queries'][number]);
        }
      } else if (first.page) {
        for (const row of rows) {
          if (row.page) results.pages.push(row as GscParsedData['pages'][number]);
        }
      } else if (first.country) {
        results.countries.push(...rows);
      } else if (first.device) {
        results.devices.push(...rows);
      } else if (first.date) {
        results.dates.push(...rows);
      }
    }
  }
}
