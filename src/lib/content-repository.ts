import type { Bank, Pillar } from '@/types/bonus';
import { supabase } from './supabase';
import { pillars as staticPillars } from '@/data/pillars';

function rowToBank(r: any): Bank {
  return {
    slug: r.slug,
    name: r.name,
    shortName: r.short_name ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    website: r.website,
    isFDICInsured: r.is_fdic_insured,
    isNationwide: r.is_nationwide,
    description: r.description,
  };
}

function rowToPillar(r: any): Pillar {
  return {
    slug: r.slug,
    title: r.title,
    description: r.description,
    icon: r.icon,
    clusters: r.clusters ?? [],
  };
}

export async function getAllBanks(): Promise<Bank[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .order('name');

  if (error) throw new Error(`getAllBanks: ${error.message}`);
  return (data ?? []).map(rowToBank);
}

export async function getBank(slug: string): Promise<Bank | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`getBank: ${error.message}`);
  return data ? rowToBank(data) : undefined;
}

export async function getAllBankSlugs(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('banks')
    .select('slug');

  if (error) throw new Error(`getAllBankSlugs: ${error.message}`);
  return (data ?? []).map((r: any) => r.slug);
}

export async function getAllPillars(): Promise<Pillar[]> {
  const client = supabase;
  if (!client) return staticPillars;
  try {
    const { data, error } = await client
      .from('pillars')
      .select('*')
      .order('title');
    if (error || !data) return staticPillars;
    return data.map(rowToPillar);
  } catch {
    return staticPillars;
  }
}

export async function getPillar(slug: string): Promise<Pillar | undefined> {
  const client = supabase;
  if (!client) return staticPillars.find(p => p.slug === slug);
  try {
    const { data, error } = await client
      .from('pillars')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return staticPillars.find(p => p.slug === slug);
    return rowToPillar(data);
  } catch {
    return staticPillars.find(p => p.slug === slug);
  }
}

export async function getAllPillarSlugs(): Promise<string[]> {
  const client = supabase;
  if (!client) return staticPillars.map(p => p.slug);
  try {
    const { data, error } = await client
      .from('pillars')
      .select('slug');
    if (error || !data) return staticPillars.map(p => p.slug);
    return data.map((r: any) => r.slug);
  } catch {
    return staticPillars.map(p => p.slug);
  }
}
