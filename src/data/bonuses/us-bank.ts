import type { BankBonus } from '@/types/bonus';

export const usBankBonuses: BankBonus[] = [
  {
    id: 'us-bank-smartly-checking-400',
    bank: 'U.S. Bank',
    bankSlug: 'us-bank',
    accountType: 'checking',
    bonusAmount: 400,
    bonusDescription:
      'Open a new U.S. Bank Smartly® Checking account and earn up to $400 with qualifying direct deposits within 90 days.',
    requirements: {
      directDeposit: { amount: 5000, frequency: '2+ deposits within 90 days' },
      other: '$200 tier: $3,000–$4,999.99 in DDs; $400 tier: $5,000+ in DDs. Must also enroll in mobile app or online banking within 90 days.',
    },
    fees: {
      monthly: 12,
      waivable: true,
      waiveCondition:
        '$1,500+ combined monthly DDs, $1,500+ average balance, U.S. Bank Smartly Visa Signature card, Smart Rewards Gold+ tier, eligible customer group (youth 13–24, seniors 65+, military), or U.S. Bank Small Business Checking account',
    },
    expirationDate: '2026-04-30',
    timeToBonus: 'Within 30 days after the month-end in which requirements are met',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-04-06',
    tags: ['easy-dd', 'tiered', 'no-capital-hold', 'nationwide'],
    aprBasis: { type: 'direct-deposit' },
    screening: { chexSensitive: true, agencies: ['ChexSystems', 'EWS'] },
    openingMethod: 'both',
  },
  {
    id: 'us-bank-business-essentials-400',
    bank: 'U.S. Bank',
    bankSlug: 'us-bank',
    accountType: 'business',
    bonusAmount: 400,
    bonusDescription:
      'Open a new U.S. Bank Business Essentials Checking account with promo code Q2AFL26, deposit $5,000 new money, and complete 6 qualifying transactions.',
    requirements: {
      minimumBalance: 5000,
      other: 'Use promo code Q2AFL26. Deposit $5,000 new money within 30 days, maintain $5,000 daily balance through day 60, complete 6 qualifying transactions within 60 days.',
    },
    fees: {
      monthly: 0,
      waivable: false,
    },
    expirationDate: '2026-06-30',
    timeToBonus: 'Within 30 days after the month-end in which requirements are met',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-04-06',
    tags: ['business', 'balance-hold', 'no-monthly-fee'],
    aprBasis: { type: 'locked-capital', qualifyingAmount: 5000, holdDays: 60 },
    screening: { chexSensitive: true, agencies: ['ChexSystems'] },
    openingMethod: 'both',
  },
  {
    id: 'us-bank-platinum-business-1200',
    bank: 'U.S. Bank',
    bankSlug: 'us-bank',
    accountType: 'business',
    bonusAmount: 1200,
    bonusDescription:
      'Open a new U.S. Bank Platinum Business Checking account with promo code Q2AFL26, deposit $25,000 new money, and complete 6 qualifying transactions.',
    requirements: {
      minimumBalance: 25000,
      other: 'Use promo code Q2AFL26. Deposit $25,000 new money within 30 days, maintain $25,000 daily balance through day 60, complete 6 qualifying transactions within 60 days.',
    },
    fees: {
      monthly: 30,
      waivable: true,
      waiveCondition: '$25,000+ daily balance',
    },
    expirationDate: '2026-06-30',
    timeToBonus: 'Within 30 days after the month-end in which requirements are met',
    keepOpenMonths: 6,
    availability: 'nationwide',
    isActive: true,
    lastVerified: '2026-04-06',
    tags: ['business', 'high-value', 'balance-hold'],
    aprBasis: { type: 'locked-capital', qualifyingAmount: 25000, holdDays: 60 },
    screening: { chexSensitive: true, agencies: ['ChexSystems'] },
    openingMethod: 'both',
  },
];
