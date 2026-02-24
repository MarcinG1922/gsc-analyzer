import type { GscQueryRow } from '@/types/gsc';
import type { Anomaly } from '@/types/analysis';

export function detectAnomalies(queries: GscQueryRow[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const q of queries) {
    // High impressions, very low CTR
    if (q.impressions > 1000 && q.ctr < 0.005) {
      anomalies.push({
        type: 'ctr_anomaly',
        severity: 'warning',
        query: q.query,
        detail: `${q.impressions.toLocaleString('pl-PL')} wyświetleń, ale tylko ${(q.ctr * 100).toFixed(2)}% CTR`,
      });
    }

    // Position 1-3 with low CTR (title/meta issue)
    if (q.position <= 3 && q.ctr < 0.10 && q.impressions > 500) {
      anomalies.push({
        type: 'low_ctr_top_position',
        severity: 'high',
        query: q.query,
        detail: `Pozycja ${q.position.toFixed(1)}, ale CTR tylko ${(q.ctr * 100).toFixed(1)}% — tytuł/meta prawdopodobnie wymaga poprawy`,
      });
    }
  }

  return anomalies
    .sort((a, b) => (a.severity === 'high' ? 0 : 1) - (b.severity === 'high' ? 0 : 1))
    .slice(0, 50);
}
