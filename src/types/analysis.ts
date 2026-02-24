import type { GscQueryRow, BrandSummary } from './gsc';

export type AnalysisMode = 'brand' | 'seo' | 'content' | 'paid' | 'summary';

export interface BrandAnalysisResult {
  composition: { brand: BrandSummary; nonBrand: BrandSummary };
  dependencyScore: number;
  healthLevel: 'healthy' | 'warning' | 'critical';
  topBrandKeywords: GscQueryRow[];
  topNonBrandKeywords: GscQueryRow[];
  risks: string[];
  recommendations: string[];
}

export interface SeoOpportunity extends GscQueryRow {
  opportunityType: 'quick_win' | 'striking_distance' | 'high_volume_underperformer' | 'ctr_optimization';
  potentialClicks: number;
  expectedCtr?: number;
  ctrGap?: number;
}

export interface SeoAnalysisResult {
  quickWins: SeoOpportunity[];
  strikingDistance: SeoOpportunity[];
  highVolumeUnderperformers: SeoOpportunity[];
  ctrOptimizations: SeoOpportunity[];
  cannibalization: CannibalizationIssue[];
}

export interface CannibalizationIssue {
  query: string;
  pages: string[];
  clicks: number;
  impressions: number;
}

export interface ContentOpportunity {
  type: 'question' | 'comparison' | 'long_tail' | 'topic_gap';
  queries: GscQueryRow[];
  totalImpressions: number;
  avgPosition: number;
  score: number;
  label: string;
}

export interface ContentAnalysisResult {
  questionOpportunities: ContentOpportunity[];
  comparisonGaps: ContentOpportunity[];
  topicGaps: ContentOpportunity[];
  funnelBreakdown: { tofu: number; mofu: number; bofu: number };
}

export interface PaidSearchOpportunity extends GscQueryRow {
  campaignType: 'non_ranking' | 'serp_domination' | 'competitor_conquesting';
  intentLevel: 'high' | 'medium' | 'low';
  bidStrategy: string;
}

export interface PaidSearchResult {
  nonRanking: PaidSearchOpportunity[];
  serpDomination: PaidSearchOpportunity[];
  competitorConquesting: PaidSearchOpportunity[];
}

export type FunnelStage = 'tofu' | 'mofu' | 'bofu';

export interface RevenueEstimate {
  trafficGain: number;
  newTrials: number;
  newCustomers: number;
  monthlyRevenue: number;
  annualRevenue: number;
}

export interface Anomaly {
  type: string;
  severity: 'high' | 'warning' | 'info';
  query?: string;
  page?: string;
  detail: string;
}

export interface StrategicSummaryResult {
  headlineMetrics: { label: string; value: string; trend?: string }[];
  risks: string[];
  opportunities: { label: string; revenueEstimate?: number }[];
  anomalies: Anomaly[];
  funnelBreakdown: { tofu: number; mofu: number; bofu: number };
  priorities: string[];
}
