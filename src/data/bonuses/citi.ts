import type { BankBonus } from '@/types/bonus';

export const citiBonuses: BankBonus[] = [
  {
    id: 'citi-checking-700',
    bank: 'Citibank',
    bankSlug: 'citi',
    accountType: 'checking',
    bonusAmount: 700,
    bonusDescription: 'Open a new Citi Priority Account and deposit $50,000+ within 20 days.',
    requirements: {
      minimumBalance: 50000,
      other: 'Maintain balance for 60 days',
    },
    fees: { monthly: 30, waivable: true, waiveCondition: '$30,000 combined balance' },
    expirationDate: '2026-05-31',
    timeToBonus: '90 days after meeting requirements',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-03-18',
    tags: ['high-value', 'balance-hold', 'premium'],
  },
  {
    id: 'citi-checking-200',
    bank: 'Citibank',
    bankSlug: 'citi',
    accountType: 'checking',
    bonusAmount: 200,
    bonusDescription: 'Open a Citi Basic Checking account with qualifying direct deposits.',
    requirements: {
      directDeposit: { amount: 1000, frequency: 'monthly for 2 consecutive months' },
    },
    fees: { monthly: 12, waivable: true, waiveCondition: '$1,500 balance or DD' },
    expirationDate: '2026-05-31',
    timeToBonus: '90 days after meeting requirements',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-03-18',
    tags: ['easy-dd'],
  },
];
