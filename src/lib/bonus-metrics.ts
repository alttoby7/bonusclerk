import type { BankBonus } from '@/types/bonus';

export function getAnnualizedBonusApr(bonus: BankBonus): number | null {
  if (bonus.bonusAmount <= 0) return null;
  if (!bonus.aprBasis || bonus.aprBasis.type !== 'locked-capital') return null;
  if (!bonus.aprBasis.qualifyingAmount || !bonus.aprBasis.holdDays) return null;
  return (bonus.bonusAmount / bonus.aprBasis.qualifyingAmount) * (365 / bonus.aprBasis.holdDays) * 100;
}

export function formatBonusApr(bonus: BankBonus): string {
  const apr = getAnnualizedBonusApr(bonus);
  if (apr === null) return '—';
  return `${apr.toFixed(2)}%`;
}

export function getScreeningLabel(bonus: BankBonus): string {
  if (!bonus.screening?.agencies?.length) return '—';
  return bonus.screening.agencies.join(', ');
}

export function getOpeningMethodLabel(bonus: BankBonus): string {
  if (!bonus.openingMethod) return '—';
  switch (bonus.openingMethod) {
    case 'online': return 'Online';
    case 'in-person': return 'In-Person';
    case 'both': return 'Both';
  }
}

export function getMobileMetaLine(bonus: BankBonus): string {
  const parts: string[] = [];
  const apr = formatBonusApr(bonus);
  if (apr !== '—') parts.push(`APR ${apr}`);
  if (bonus.openingMethod) parts.push(getOpeningMethodLabel(bonus));
  if (bonus.screening?.agencies?.length) parts.push(getScreeningLabel(bonus));
  return parts.join(' \u00B7 ');
}
