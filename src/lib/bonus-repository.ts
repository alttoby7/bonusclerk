import type { BankBonus, BonusFilter, BonusSortKey, SortDirection } from '@/types/bonus';
import { supabase } from './supabase';
import { allBonuses as staticBonuses } from '@/data/bonuses';

// Transform a Supabase row → BankBonus type
function rowToBonus(r: any): BankBonus {
  return {
    id: r.id,
    bank: r.banks?.name ?? r.bank_slug,
    bankSlug: r.bank_slug,
    accountType: r.account_type,
    bonusAmount: r.bonus_amount,
    bonusDescription: r.bonus_description,
    requirements: r.requirements ?? {},
    fees: {
      monthly: r.monthly_fee,
      waivable: r.fee_waivable,
      waiveCondition: r.fee_waive_condition ?? undefined,
    },
    apy: r.apy ?? undefined,
    expirationDate: r.expiration_date ?? undefined,
    timeToBonus: r.time_to_bonus,
    keepOpenMonths: r.keep_open_months,
    availability: r.availability?.includes(',')
      ? r.availability.split(',')
      : r.availability,
    isActive: r.is_active,
    lastVerified: r.last_verified,
    affiliateUrl: r.affiliate_url ?? undefined,
    tags: r.tags ?? [],
    aprBasis: r.apr_basis_type
      ? {
          type: r.apr_basis_type,
          qualifyingAmount: r.apr_qualifying_amount ?? undefined,
          holdDays: r.apr_hold_days ?? undefined,
        }
      : undefined,
    screening:
      r.screening_chex_sensitive !== null
        ? {
            chexSensitive: r.screening_chex_sensitive,
            agencies: r.screening_agencies ?? [],
          }
        : undefined,
    openingMethod: r.opening_method ?? undefined,
  };
}

export async function getAllBonuses(): Promise<BankBonus[]> {
  const client = supabase;
  if (!client) return staticBonuses;
  try {
    const { data, error } = await client
      .from('bonuses')
      .select('*, banks(name)')
      .order('bonus_amount', { ascending: false });
    if (error || !data) return staticBonuses;
    return data.map(rowToBonus);
  } catch {
    return staticBonuses;
  }
}

export async function getActiveBonuses(): Promise<BankBonus[]> {
  const client = supabase;
  if (!client) return staticBonuses.filter(b => b.isActive);
  try {
    const { data, error } = await client
      .from('bonuses')
      .select('*, banks(name)')
      .eq('is_active', true)
      .order('bonus_amount', { ascending: false });
    if (error || !data) return staticBonuses.filter(b => b.isActive);
    return data.map(rowToBonus);
  } catch {
    return staticBonuses.filter(b => b.isActive);
  }
}

export async function getBonusesByBank(bankSlug: string): Promise<BankBonus[]> {
  const client = supabase;
  if (!client) return staticBonuses.filter(b => b.bankSlug === bankSlug);
  try {
    const { data, error } = await client
      .from('bonuses')
      .select('*, banks(name)')
      .eq('bank_slug', bankSlug);
    if (error || !data) return staticBonuses.filter(b => b.bankSlug === bankSlug);
    return data.map(rowToBonus);
  } catch {
    return staticBonuses.filter(b => b.bankSlug === bankSlug);
  }
}

export async function getBonusById(id: string): Promise<BankBonus | undefined> {
  const client = supabase;
  if (!client) return staticBonuses.find(b => b.id === id);
  try {
    const { data, error } = await client
      .from('bonuses')
      .select('*, banks(name)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return staticBonuses.find(b => b.id === id);
    return rowToBonus(data);
  } catch {
    return staticBonuses.find(b => b.id === id);
  }
}

export async function getTotalBonusValue(): Promise<number> {
  const bonuses = await getActiveBonuses();
  return bonuses.reduce((sum, b) => sum + b.bonusAmount, 0);
}

export async function getUniqueBanks(): Promise<string[]> {
  const client = supabase;
  if (!client) return [...new Set(staticBonuses.map(b => b.bankSlug))];
  try {
    const { data, error } = await client
      .from('bonuses')
      .select('bank_slug');
    if (error || !data) return [...new Set(staticBonuses.map(b => b.bankSlug))];
    return [...new Set(data.map((r: any) => r.bank_slug))];
  } catch {
    return [...new Set(staticBonuses.map(b => b.bankSlug))];
  }
}

// These utilities work on already-fetched data (no DB call needed)

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
