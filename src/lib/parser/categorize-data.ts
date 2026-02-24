import type { GscRow, GscParsedData } from '@/types/gsc';

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function categorizeData(
  results: GscParsedData,
  filename: string,
  rows: GscRow[]
) {
  const lower = removeDiacritics(filename.toLowerCase());

  // Queries: EN "queries", PL "zapytania", DE "suchanfragen", FR "requetes", ES "consultas"
  if (lower.includes('quer') || lower.includes('zapytan') || lower.includes('suchanfrag') || lower.includes('requet') || lower.includes('consult')) {
    for (const row of rows) {
      if (row.query) {
        results.queries.push(row as GscParsedData['queries'][number]);
      }
    }
  }
  // Pages: EN "pages", PL "strony", DE "seiten", ES "paginas"
  else if (lower.includes('page') || lower.includes('url') || lower.includes('stron') || lower.includes('seiten') || lower.includes('pagina')) {
    for (const row of rows) {
      if (row.page) {
        results.pages.push(row as GscParsedData['pages'][number]);
      }
    }
  }
  // Countries: EN "countries", PL "kraje", DE "land/länder", FR "pays", ES "pais"
  else if (lower.includes('countr') || lower.includes('kraj') || lower.includes('land') || lower.includes('pays') || lower.includes('pais')) {
    results.countries.push(...rows);
  }
  // Devices: EN "devices", PL "urządzenia", DE "geräte", FR "appareil", ES "dispositivo"
  else if (lower.includes('device') || lower.includes('urzadzen') || lower.includes('gerat') || lower.includes('appareil') || lower.includes('dispositiv')) {
    results.devices.push(...rows);
  }
  // Dates/Chart: EN "dates"/"chart", PL "wykres"/"daty", DE "datum"
  else if (lower.includes('date') || lower.includes('chart') || lower.includes('wykres') || lower.includes('daty') || lower.includes('datum')) {
    results.dates.push(...rows);
  }
  // Search appearance: EN "appearance", PL "wygląd"
  else if (lower.includes('appear') || lower.includes('wyglad')) {
    // Skip search appearance data for now (not used in analysis)
  }
  // Filters: PL "filtry", EN "filters" - skip
  else if (lower.includes('filtr') || lower.includes('filter')) {
    // Skip filter metadata
  }
  else {
    // Auto-detect from columns
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
