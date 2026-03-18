import type { BankBonus } from '@/types/bonus';

export const wellsFargoBonuses: BankBonus[] = [
  {
    id: 'wf-everyday-checking-300',
    bank: 'Wells Fargo',
    bankSlug: 'wells-fargo',
    accountType: 'checking',
    bonusAmount: 300,
    bonusDescription: 'Open a new Everyday Checking account with qualifying direct deposits.',
    requirements: {
      directDeposit: { amount: 1000, frequency: 'cumulative within 90 days' },
    },
    fees: { monthly: 10, waivable: true, waiveCondition: '$500/mo direct deposit or $1,500 daily balance' },
    expirationDate: '2026-06-30',
    timeToBonus: 'Within 30 days of qualifying',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-03-18',
    tags: ['easy-dd', 'churnable'],
  },
  {
    id: 'wf-platinum-savings-200',
    bank: 'Wells Fargo',
    bankSlug: 'wells-fargo',
    accountType: 'savings',
    bonusAmount: 200,
    bonusDescription: 'Open a Wells Fargo Platinum Savings account with $25,000 deposit.',
    requirements: {
      minimumBalance: 25000,
      other: 'Maintain $25,000 for 90 days',
    },
    fees: { monthly: 12, waivable: true, waiveCondition: '$3,500 daily balance' },
    expirationDate: '2026-06-30',
    timeToBonus: 'Within 30 days of qualifying',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-03-18',
    tags: ['balance-hold'],
  },
];
