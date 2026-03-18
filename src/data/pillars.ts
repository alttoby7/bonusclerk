import type { Pillar } from '@/types/bonus';

export const pillars: Pillar[] = [
  {
    slug: 'bank-account-bonuses',
    title: 'Bank Account Bonuses',
    description: 'Best bank account bonuses available now, including checking, savings, and business account sign-up offers.',
    icon: '💰',
    clusters: ['new-bank-account-offers', 'bonus-checking-accounts', 'chase-business-accounts', 'chase-total-checking'],
  },
  {
    slug: 'chase-bank-bonuses',
    title: 'Chase Bank Bonuses',
    description: 'All current Chase bank bonuses for checking, savings, business, and private client accounts.',
    icon: '🏦',
    clusters: ['open-chase-account', 'chase-checking-savings'],
  },
  {
    slug: 'major-bank-bonuses',
    title: 'Major Bank Bonuses',
    description: 'Current bonuses from Wells Fargo, Bank of America, Capital One, Citi, US Bank, TD Bank, and PNC.',
    icon: '🏛️',
    clusters: ['wells-fargo-checking', 'capital-one-360', 'citi-checking-bonus', 'pnc-checking', 'us-bank-checking', 'wells-fargo-combo'],
  },
  {
    slug: 'high-yield-savings',
    title: 'High Yield Savings Accounts',
    description: 'Best high-yield savings accounts, CD rates, and money market accounts to maximize your interest earnings.',
    icon: '📈',
    clusters: ['best-hysa-rates', 'cd-rates', 'money-market-rates'],
  },
  {
    slug: 'online-bank-bonuses',
    title: 'Online Bank Bonuses',
    description: 'Best bonuses from online banks, neobanks, and regional banks including Chime, SoFi, and more.',
    icon: '💻',
    clusters: ['fifth-third-promotions', 'chime-promotions', 'bmo-checking', 'chime-bank'],
  },
  {
    slug: 'bank-bonus-churning',
    title: 'Bank Bonus Churning Guide',
    description: 'Complete guide to bank bonus churning — direct deposit hacks, ChexSystems, tracking, taxes, and referrals.',
    icon: '🔄',
    clusters: ['referral-programs'],
  },
  {
    slug: 'bank-reviews',
    title: 'Bank Reviews',
    description: 'Honest bank reviews and comparisons to help you choose the best bank for bonuses and everyday banking.',
    icon: '⭐',
    clusters: ['best-online-banks', 'regional-banks'],
  },
];

export function getPillar(slug: string): Pillar | undefined {
  return pillars.find(p => p.slug === slug);
}

export function getAllPillarSlugs(): string[] {
  return pillars.map(p => p.slug);
}
