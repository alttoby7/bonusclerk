import type { BankBonus } from '@/types/bonus';

export const chimeBonuses: BankBonus[] = [
  {
    id: 'chime-checking-350',
    bank: 'Chime',
    bankSlug: 'chime',
    accountType: 'checking',
    bonusAmount: 350,
    bonusDescription: 'Open a Chime Checking Account. Earn $250 with $500+ qualifying direct deposit within 30 days. Earn up to $100 additional with 10% cashback on eligible purchases within 30 days.',
    requirements: {
      directDeposit: { amount: 500, frequency: 'within 30 days' },
      debitTransactions: 1,
    },
    fees: { monthly: 0, waivable: false },
    apy: 0,
    expirationDate: undefined,
    timeToBonus: 'Within 7-14 business days of qualification',
    keepOpenMonths: 0,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-04-06',
    tags: ['no-fee', 'easy-dd', 'neobank', 'low-capital'],
    aprBasis: { type: 'direct-deposit', qualifyingAmount: 500, holdDays: 30 },
    screening: { chexSensitive: false, agencies: [] },
    openingMethod: 'online',
  },
];
