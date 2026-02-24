export const CTR_BENCHMARKS: Record<string, number> = {
  '1': 0.30,
  '2': 0.15,
  '3': 0.10,
  '4-5': 0.065,
  '6-10': 0.035,
  '11-20': 0.01,
};

export const CTR_BELOW_AVERAGE: Record<string, number> = {
  '1': 0.20,
  '2': 0.10,
  '3': 0.06,
  '4-5': 0.04,
  '6-10': 0.02,
  '11-20': 0.005,
};

export function getPositionBucket(pos: number): string {
  if (pos <= 1.5) return '1';
  if (pos <= 2.5) return '2';
  if (pos <= 3.5) return '3';
  if (pos <= 5.5) return '4-5';
  if (pos <= 10.5) return '6-10';
  return '11-20';
}
