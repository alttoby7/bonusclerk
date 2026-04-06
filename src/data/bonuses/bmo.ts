import type { BankBonus } from '@/types/bonus';

export const bmoBonuses: BankBonus[] = [
  {
    id: 'bmo-smart-advantage-400',
    bank: 'BMO',
    bankSlug: 'bmo',
    accountType: 'checking',
    bonusAmount: 400,
    bonusDescription: 'Open a BMO Smart Advantage Checking, Smart Money Checking, or Relationship Checking account with $4,000+ in qualifying direct deposits within 90 days.',
    requirements: {
      directDeposit: { amount: 4000, frequency: 'within 90 days of account opening' },
    },
    fees: { monthly: 0, waivable: false },
    apy: undefined,
    expirationDate: '2026-05-04',
    timeToBonus: 'Within 120 days of account opening',
    keepOpenMonths: 0,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-04-06',
    tags: ['high-value', 'no-fee'],
    aprBasis: { type: 'direct-deposit', qualifyingAmount: 4000, holdDays: 90 },
    screening: { chexSensitive: true, agencies: ['ChexSystems'] },
    openingMethod: 'online',
  },
];
