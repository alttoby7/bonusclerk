export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function expirationLabel(dateStr?: string): { text: string; status: 'active' | 'expiring' | 'expired' | 'ongoing' } {
  if (!dateStr) return { text: 'Ongoing', status: 'ongoing' };

  const days = daysUntil(dateStr);

  if (days < 0) return { text: 'Expired', status: 'expired' };
  if (days <= 14) return { text: `Expires in ${days}d`, status: 'expiring' };
  if (days <= 30) return { text: `Expires in ${days}d`, status: 'expiring' };
  return { text: `Expires ${formatDate(dateStr)}`, status: 'active' };
}

export function formatMoney(amount: number): string {
  if (amount === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
