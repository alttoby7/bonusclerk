import type { Institution, DDEvidence, DDPairRollup, MethodGuide } from '@/types/dd-checker';
import { supabase } from '../supabase';
import { computeAllRollups, computeRollup } from './confidence';
import staticInstitutions from '@/data/direct-deposit/institutions.json';
import staticEvidenceRaw from '@/data/direct-deposit/evidence.json';
import { methodGuides as staticMethodGuides } from '@/data/direct-deposit/method-guides';

const staticEvidence = staticEvidenceRaw as DDEvidence[];

function rowToInstitution(r: any): Institution {
  return {
    slug: r.slug,
    name: r.name,
    shortName: r.short_name ?? undefined,
    type: r.type,
    isTrackedBank: r.is_tracked_bank,
  };
}

function rowToEvidence(r: any): DDEvidence {
  return {
    id: r.legacy_id ?? String(r.id),
    sourceInstitutionSlug: r.source_institution_slug,
    sourceLabel: r.source_label,
    destinationBankSlug: r.destination_bank_slug,
    outcome: r.outcome,
    observedOn: r.observed_on,
    reportedOn: r.reported_on,
    datePrecision: r.date_precision,
    sourceType: r.source_type,
    sourceUrl: r.source_url ?? undefined,
    extractConfidence: Number(r.extract_confidence),
    reviewStatus: r.review_status,
    notes: r.notes ?? undefined,
  };
}

function rowToMethodGuide(r: any): MethodGuide {
  return {
    type: r.type,
    title: r.title,
    steps: r.steps ?? [],
    processingTime: r.processing_time,
    tips: r.tips ?? [],
    warnings: r.warnings ?? [],
  };
}

let rollupsCache: { data: DDPairRollup[]; ts: number } | null = null;
let evidenceCache: { data: DDEvidence[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

async function fetchAllEvidence(): Promise<DDEvidence[]> {
  if (evidenceCache && Date.now() - evidenceCache.ts < CACHE_TTL) {
    return evidenceCache.data;
  }
  const client = supabase;
  if (!client) {
    const ev = staticEvidence.filter(e => e.reviewStatus === 'approved' || !e.reviewStatus);
    evidenceCache = { data: ev, ts: Date.now() };
    return ev;
  }
  try {
    const { data, error } = await client.from('dd_evidence').select('*').order('effective_on', { ascending: false });
    if (error || !data) {
      const ev = staticEvidence.filter(e => e.reviewStatus === 'approved' || !e.reviewStatus);
      evidenceCache = { data: ev, ts: Date.now() };
      return ev;
    }
    const ev = data.map(rowToEvidence);
    evidenceCache = { data: ev, ts: Date.now() };
    return ev;
  } catch {
    const ev = staticEvidence.filter(e => e.reviewStatus === 'approved' || !e.reviewStatus);
    evidenceCache = { data: ev, ts: Date.now() };
    return ev;
  }
}

async function getRollups(): Promise<DDPairRollup[]> {
  if (rollupsCache && Date.now() - rollupsCache.ts < CACHE_TTL) return rollupsCache.data;
  const evidence = await fetchAllEvidence();
  const rollups = computeAllRollups(evidence);
  rollupsCache = { data: rollups, ts: Date.now() };
  return rollups;
}

export async function getAllInstitutions(): Promise<Institution[]> {
  const client = supabase;
  if (!client) return staticInstitutions as Institution[];
  try {
    const { data, error } = await client.from('dd_institutions').select('*').order('name');
    if (error || !data) return staticInstitutions as Institution[];
    return data.map(rowToInstitution);
  } catch { return staticInstitutions as Institution[]; }
}

export async function getTrackedBanks(): Promise<Institution[]> {
  const client = supabase;
  if (!client) return (staticInstitutions as Institution[]).filter(i => i.isTrackedBank);
  try {
    const { data, error } = await client.from('dd_institutions').select('*').eq('is_tracked_bank', true).order('name');
    if (error || !data) return (staticInstitutions as Institution[]).filter(i => i.isTrackedBank);
    return data.map(rowToInstitution);
  } catch { return (staticInstitutions as Institution[]).filter(i => i.isTrackedBank); }
}

export async function getSourceInstitutions(): Promise<Institution[]> { return getAllInstitutions(); }

export async function getInstitution(slug: string): Promise<Institution | undefined> {
  const client = supabase;
  if (!client) return (staticInstitutions as Institution[]).find(i => i.slug === slug);
  try {
    const { data, error } = await client.from('dd_institutions').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return (staticInstitutions as Institution[]).find(i => i.slug === slug);
    return rowToInstitution(data);
  } catch { return (staticInstitutions as Institution[]).find(i => i.slug === slug); }
}

export async function getEvidenceForPair(sourceSlug: string, destSlug: string): Promise<DDEvidence[]> {
  const client = supabase;
  const fallback = staticEvidence.filter(e => e.sourceInstitutionSlug === sourceSlug && e.destinationBankSlug === destSlug);
  if (!client) return fallback;
  try {
    const { data, error } = await client.from('dd_evidence').select('*').eq('source_institution_slug', sourceSlug).eq('destination_bank_slug', destSlug).eq('review_status', 'approved').order('effective_on', { ascending: false });
    if (error || !data) return fallback;
    return data.map(rowToEvidence);
  } catch { return fallback; }
}

export async function getAllEvidence(): Promise<DDEvidence[]> { return fetchAllEvidence(); }

export async function getRollupForPair(sourceSlug: string, destSlug: string): Promise<DDPairRollup> {
  const rollups = await getRollups();
  const existing = rollups.find(r => r.sourceInstitutionSlug === sourceSlug && r.destinationBankSlug === destSlug);
  if (existing) return existing;
  const evidence = await fetchAllEvidence();
  return computeRollup(sourceSlug, destSlug, evidence);
}

export async function getAllRollups(): Promise<DDPairRollup[]> { return getRollups(); }

export async function getRollupsForDestination(destSlug: string): Promise<DDPairRollup[]> {
  return (await getRollups()).filter(r => r.destinationBankSlug === destSlug);
}

export async function getRollupsForSource(sourceSlug: string): Promise<DDPairRollup[]> {
  return (await getRollups()).filter(r => r.sourceInstitutionSlug === sourceSlug);
}

export async function getTotalDataPoints(): Promise<number> {
  const client = supabase;
  if (!client) return staticEvidence.filter(e => e.reviewStatus === 'approved' || !e.reviewStatus).length;
  try {
    const { count, error } = await client.from('dd_evidence').select('*', { count: 'exact', head: true }).eq('review_status', 'approved');
    if (error) return staticEvidence.length;
    return count ?? 0;
  } catch { return staticEvidence.length; }
}

export async function getTotalPairs(): Promise<number> { return (await getRollups()).length; }

export async function getPopularPairs(limit: number = 6): Promise<DDPairRollup[]> {
  return [...(await getRollups())].sort((a, b) => b.approvedEvidenceCount - a.approvedEvidenceCount).slice(0, limit);
}

export async function getBestSourcesForBank(destSlug: string, limit: number = 5): Promise<DDPairRollup[]> {
  return (await getRollups()).filter(r => r.destinationBankSlug === destSlug && r.verdict === 'likely-works').sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, limit);
}

export async function getSourceCoverage(sourceSlugs: string[]): Promise<DDPairRollup[]> {
  const slugSet = new Set(sourceSlugs);
  return (await getRollups()).filter(r => slugSet.has(r.sourceInstitutionSlug));
}

export async function getEvidenceTimeline(sourceSlug: string, destSlug: string): Promise<DDEvidence[]> {
  return getEvidenceForPair(sourceSlug, destSlug);
}

export async function getFailingSourcesForBank(destSlug: string): Promise<DDPairRollup[]> {
  return (await getRollups()).filter(r => r.destinationBankSlug === destSlug && r.verdict === 'likely-fails').sort((a, b) => b.approvedEvidenceCount - a.approvedEvidenceCount);
}

export async function getMethodGuides(): Promise<MethodGuide[]> {
  const client = supabase;
  if (!client) return staticMethodGuides;
  try {
    const { data, error } = await client.from('dd_method_guides').select('*');
    if (error || !data) return staticMethodGuides;
    return data.map(rowToMethodGuide);
  } catch { return staticMethodGuides; }
}

export async function getMethodGuideForType(type: string): Promise<MethodGuide | undefined> {
  const client = supabase;
  if (!client) return staticMethodGuides.find(g => g.type === type);
  try {
    const { data, error } = await client.from('dd_method_guides').select('*').eq('type', type).maybeSingle();
    if (error || !data) return staticMethodGuides.find(g => g.type === type);
    return rowToMethodGuide(data);
  } catch { return staticMethodGuides.find(g => g.type === type); }
}
