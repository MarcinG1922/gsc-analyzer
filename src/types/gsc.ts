export interface GscRow {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  country?: string;
  device?: string;
  date?: string;
  [key: string]: unknown;
}

export type GscQueryRow = GscRow & { query: string; isBrand?: boolean };
export type GscPageRow = GscRow & { page: string };

export interface GscParsedData {
  queries: GscQueryRow[];
  pages: GscPageRow[];
  countries: GscRow[];
  devices: GscRow[];
  dates: GscRow[];
  metadata: {
    sourceFile: string;
    filesFound: string[];
  };
  summary: GscSummary;
}

export interface GscSummary {
  totalQueries: number;
  totalPages: number;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  queriesInTop3: number;
  queriesPosition4To10: number;
  queriesPosition11To20: number;
}

export interface BrandSummary {
  queryCount: number;
  clicks: number;
  impressions: number;
  clickShare: number;
  avgCtr: number;
  avgPosition: number;
}
