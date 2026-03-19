export type BonusAprBasisType = 'locked-capital' | 'direct-deposit' | 'activity' | 'none';
export type ScreeningAgency = 'ChexSystems' | 'EWS' | 'Experian' | 'Equifax' | 'TransUnion';
export type OpeningMethod = 'online' | 'in-person' | 'both';

export interface BankBonus {
  id: string;
  bank: string;
  bankSlug: string;
  accountType: 'checking' | 'savings' | 'money-market' | 'cd' | 'business';
  bonusAmount: number;
  bonusDescription: string;
  requirements: {
    directDeposit?: { amount: number; frequency: string };
    minimumBalance?: number;
    debitTransactions?: number;
    billPay?: number;
    other?: string;
  };
  fees: {
    monthly: number;
    waivable: boolean;
    waiveCondition?: string;
  };
  apy?: number;
  expirationDate?: string;
  timeToBonus: string;
  keepOpenMonths: number;
  availability: 'nationwide' | 'regional' | string[];
  isActive: boolean;
  lastVerified: string;
  affiliateUrl?: string;
  tags: string[];
  aprBasis?: {
    type: BonusAprBasisType;
    qualifyingAmount?: number;
    holdDays?: number;
  };
  screening?: {
    chexSensitive?: boolean;
    agencies?: ScreeningAgency[];
  };
  openingMethod?: OpeningMethod;
}

export interface Bank {
  slug: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  website: string;
  isFDICInsured: boolean;
  isNationwide: boolean;
  description: string;
}

export interface Pillar {
  slug: string;
  title: string;
  description: string;
  icon: string;
  clusters: string[];
}

export interface Cluster {
  slug: string;
  pillarSlug: string;
  title: string;
  description: string;
  articles: string[];
}

export interface ArticleFrontmatter {
  title: string;
  description: string;
  pillar: string;
  cluster?: string;
  contentType: 'review' | 'guide' | 'listicle' | 'how-to' | 'comparison' | 'tool' | 'service-page';
  publishedAt: string;
  updatedAt: string;
  featuredBonusIds?: string[];
  seoKeywords?: string[];
}

export type BonusFilter = {
  bank?: string;
  accountType?: BankBonus['accountType'];
  minAmount?: number;
  isActive?: boolean;
  availability?: string;
  tag?: string;
}

export type BonusSortKey = 'bonusAmount' | 'expirationDate' | 'bank' | 'lastVerified';
export type SortDirection = 'asc' | 'desc';
