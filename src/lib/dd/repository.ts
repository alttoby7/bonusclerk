import type { Institution, DDEvidence, DDPairRollup } from '@/types/dd-checker';
import institutionsData from '@/data/direct-deposit/institutions.json';
import evidenceData from '@/data/direct-deposit/evidence.json';
import { computeAllRollups, computeRollup } from './confidence';

const institutions: Institution[] = institutionsData as Institution[];
const evidence: DDEvidence[] = evidenceData as DDEvidence[];

let rollupsCache: DDPairRollup[] | null = null;

function getRollups(): DDPairRollup[] {
  if (!rollupsCache) {
    rollupsCache = computeAllRollups(evidence);
  }
  return rollupsCache;
}

// Institutions
export function getAllInstitutions(): Institution[] {
  return institutions;
}

export function getTrackedBanks(): Institution[] {
  return institutions.filter(i => i.isTrackedBank);
}

export function getSourceInstitutions(): Institution[] {
  return institutions;
}

export function getInstitution(slug: string): Institution | undefined {
  return institutions.find(i => i.slug === slug);
}

// Evidence
export function getEvidenceForPair(sourceSlug: string, destSlug: string): DDEvidence[] {
  return evidence.filter(
    e => e.sourceInstitutionSlug === sourceSlug &&
         e.destinationBankSlug === destSlug &&
         e.reviewStatus === 'approved'
  );
}

export function getAllEvidence(): DDEvidence[] {
  return evidence;
}

// Rollups
export function getRollupForPair(sourceSlug: string, destSlug: string): DDPairRollup {
  const existing = getRollups().find(
    r => r.sourceInstitutionSlug === sourceSlug && r.destinationBankSlug === destSlug
  );
  if (existing) return existing;
  return computeRollup(sourceSlug, destSlug, evidence);
}

export function getAllRollups(): DDPairRollup[] {
  return getRollups();
}

export function getRollupsForDestination(destSlug: string): DDPairRollup[] {
  return getRollups().filter(r => r.destinationBankSlug === destSlug);
}

export function getRollupsForSource(sourceSlug: string): DDPairRollup[] {
  return getRollups().filter(r => r.sourceInstitutionSlug === sourceSlug);
}

// Stats
export function getTotalDataPoints(): number {
  return evidence.filter(e => e.reviewStatus === 'approved').length;
}

export function getTotalPairs(): number {
  return getRollups().length;
}

// Popular pairs (most data points, for homepage)
export function getPopularPairs(limit: number = 6): DDPairRollup[] {
  return [...getRollups()]
    .sort((a, b) => b.approvedEvidenceCount - a.approvedEvidenceCount)
    .slice(0, limit);
}
