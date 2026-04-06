import type { BankBonus, BonusFilter, BonusSortKey, SortDirection } from '@/types/bonus';
import { chaseBonuses } from './chase';
import { wellsFargoBonuses } from './wells-fargo';
import { capitalOneBonuses } from './capital-one';
import { citiBonuses } from './citi';
import { sofiBonuses } from './sofi';
import { hysaBonuses } from './hysa';
import { usBankBonuses } from './us-bank';
import { bankOfAmericaBonuses } from './bank-of-america';
import { bmoBonuses } from './bmo';
import { chimeBonuses } from './chime';

export const allBonuses: BankBonus[] = [
  ...chaseBonuses,
  ...wellsFargoBonuses,
  ...capitalOneBonuses,
  ...citiBonuses,
  ...sofiBonuses,
  ...hysaBonuses,
  ...usBankBonuses,
  ...bankOfAmericaBonuses,
  ...bmoBonuses,
  ...chimeBonuses,
];

export function filterBonuses(bonuses: BankBonus[], filter: BonusFilter): BankBonus[] {
  return bonuses.filter(b => {
    if (filter.bank && b.bankSlug !== filter.bank) return false;
    if (filter.accountType && b.accountType !== filter.accountType) return false;
    if (filter.minAmount && b.bonusAmount < filter.minAmount) return false;
    if (filter.isActive !== undefined && b.isActive !== filter.isActive) return false;
    if (filter.tag && !b.tags.includes(filter.tag)) return false;
    return true;
  });
}

export function sortBonuses(
  bonuses: BankBonus[],
  key: BonusSortKey = 'bonusAmount',
  direction: SortDirection = 'desc'
): BankBonus[] {
  const sorted = [...bonuses].sort((a, b) => {
    switch (key) {
      case 'bonusAmount':
        return a.bonusAmount - b.bonusAmount;
      case 'bank':
        return a.bank.localeCompare(b.bank);
      case 'expirationDate': {
        const dateA = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
        const dateB = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
        return dateA - dateB;
      }
      case 'lastVerified':
        return new Date(a.lastVerified).getTime() - new Date(b.lastVerified).getTime();
      default:
        return 0;
    }
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

export function getActiveBonuses(): BankBonus[] {
  return allBonuses.filter(b => b.isActive);
}

export function getBonusesByBank(bankSlug: string): BankBonus[] {
  return allBonuses.filter(b => b.bankSlug === bankSlug);
}

export function getBonusById(id: string): BankBonus | undefined {
  return allBonuses.find(b => b.id === id);
}

export function getTotalBonusValue(): number {
  return getActiveBonuses().reduce((sum, b) => sum + b.bonusAmount, 0);
}

export function getUniqueBanks(): string[] {
  return [...new Set(allBonuses.map(b => b.bankSlug))];
}
