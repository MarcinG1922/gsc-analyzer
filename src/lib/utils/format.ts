export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('pl-PL');
}

export function formatPercent(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M PLN';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K PLN';
  return n.toFixed(0) + ' PLN';
}

export function formatPosition(n: number): string {
  return n.toFixed(1);
}
