export interface BusinessContext {
  conversionRate: number;
  trialToPaidRate: number;
  acv: number;
  primaryGoal: ('growth' | 'competitive' | 'quarterly')[];
  companyName?: string;
}

export const DEFAULT_BUSINESS_CONTEXT: BusinessContext = {
  conversionRate: 0.025,
  trialToPaidRate: 0.12,
  acv: 300,
  primaryGoal: ['growth'],
};
