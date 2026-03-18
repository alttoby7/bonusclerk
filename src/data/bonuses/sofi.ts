import type { BankBonus } from '@/types/bonus';

export const sofiBonuses: BankBonus[] = [
  {
    id: 'sofi-checking-savings-300',
    bank: 'SoFi',
    bankSlug: 'sofi',
    accountType: 'checking',
    bonusAmount: 300,
    bonusDescription: 'Open a SoFi Checking and Savings account with $5,000+ direct deposit.',
    requirements: {
      directDeposit: { amount: 5000, frequency: 'within first 25 days' },
    },
    fees: { monthly: 0, waivable: false },
    apy: 3.8,
    expirationDate: '2026-06-30',
    timeToBonus: 'Within 14 days of qualifying DD',
    keepOpenMonths: 0,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-03-18',
    tags: ['high-value', 'no-fee', 'hysa'],
  },
];
