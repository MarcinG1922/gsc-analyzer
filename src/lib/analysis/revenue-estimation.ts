import type { BusinessContext } from '@/types/business-context';
import type { RevenueEstimate } from '@/types/analysis';

export function estimateRevenue(
  trafficGain: number,
  ctx: BusinessContext
): RevenueEstimate {
  const newTrials = trafficGain * ctx.conversionRate;
  const newCustomers = newTrials * ctx.trialToPaidRate;
  const annualRevenue = newCustomers * ctx.acv;
  const monthlyRevenue = annualRevenue / 12;

  return {
    trafficGain,
    newTrials: Math.round(newTrials),
    newCustomers: Math.round(newCustomers * 10) / 10,
    monthlyRevenue: Math.round(monthlyRevenue),
    annualRevenue: Math.round(annualRevenue),
  };
}
