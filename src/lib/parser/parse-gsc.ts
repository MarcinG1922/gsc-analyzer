import JSZip from 'jszip';
import Papa from 'papaparse';
import type { GscParsedData, GscSummary } from '@/types/gsc';
import { normalizeRow } from './normalize-row';
import { categorizeData } from './categorize-data';

function createEmptyData(sourceFile: string): GscParsedData {
  return {
    queries: [],
    pages: [],
    countries: [],
    devices: [],
    dates: [],
    metadata: { sourceFile, filesFound: [] },
    summary: {
      totalQueries: 0, totalPages: 0, totalClicks: 0, totalImpressions: 0,
      avgCtr: 0, avgPosition: 0, queriesInTop3: 0, queriesPosition4To10: 0,
      queriesPosition11To20: 0,
    },
  };
}

function parseCsvText(text: string) {
  const clean = text.replace(/^\uFEFF/, '');
  const result = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data.map(normalizeRow);
}

export function calculateSummary(data: GscParsedData): GscSummary {
  const q = data.queries;
  const totalClicks = q.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = q.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = q.length > 0 ? q.reduce((s, r) => s + r.position, 0) / q.length : 0;

  return {
    totalQueries: q.length,
    totalPages: data.pages.length,
    totalClicks,
    totalImpressions,
    avgCtr,
    avgPosition,
    queriesInTop3: q.filter(r => r.position <= 3).length,
    queriesPosition4To10: q.filter(r => r.position > 3 && r.position <= 10).length,
    queriesPosition11To20: q.filter(r => r.position > 10 && r.position <= 20).length,
  };
}

export async function parseGscZip(file: File): Promise<GscParsedData> {
  const zip = await JSZip.loadAsync(file);
  const results = createEmptyData(file.name);

  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    if (!filename.endsWith('.csv') || zipEntry.dir) continue;
    results.metadata.filesFound.push(filename);
    const csvText = await zipEntry.async('string');
    const rows = parseCsvText(csvText);
    categorizeData(results, filename, rows);
  }

  results.summary = calculateSummary(results);
  return results;
}

export async function parseGscCsvFiles(files: File[]): Promise<GscParsedData> {
  const results = createEmptyData('csv-upload');

  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.csv')) continue;
    results.metadata.filesFound.push(file.name);
    const text = await file.text();
    const rows = parseCsvText(text);
    categorizeData(results, file.name, rows);
  }

  results.summary = calculateSummary(results);
  return results;
}
