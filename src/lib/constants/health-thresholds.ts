export const BRAND_HEALTH = {
  healthy: { min: 0, max: 40 },
  warning: { min: 40, max: 60 },
  critical: { min: 60, max: 100 },
} as const;

export function getBrandHealthLevel(brandPercent: number): 'healthy' | 'warning' | 'critical' {
  if (brandPercent < BRAND_HEALTH.warning.min) return 'healthy';
  if (brandPercent < BRAND_HEALTH.critical.min) return 'warning';
  return 'critical';
}
