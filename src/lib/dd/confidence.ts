import type { DDEvidence, DDPairRollup, DDStatus, ConfidenceLevel, SourceType } from '@/types/dd-checker';

const QUALITY_WEIGHTS: Record<SourceType, number> = {
  doctor_of_credit: 0.90,
  staff_manual: 1.00,
  linked_public_report: 0.70,
  trusted_user: 0.55,
  new_user: 0.35,
  anonymous: 0.20,
};

const HALF_LIFE_DAYS = 365;
const CLUSTER_CAP = 1.2;

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function bestDate(ev: DDEvidence): Date {
  return new Date(ev.observedOn ?? ev.reportedOn);
}

function clusterKey(ev: DDEvidence): string {
  const urlRoot = ev.sourceUrl ? new URL(ev.sourceUrl).hostname : 'none';
  const bucket = Math.floor(bestDate(ev).getTime() / (90 * 24 * 60 * 60 * 1000));
  return `${ev.sourceType}|${urlRoot}|${ev.sourceInstitutionSlug}|${ev.destinationBankSlug}|${bucket}`;
}

function computeWeight(ev: DDEvidence, now: Date): number {
  const ageDays = daysBetween(now, bestDate(ev));
  const decay = Math.pow(2, -ageDays / HALF_LIFE_DAYS);
  const quality = QUALITY_WEIGHTS[ev.sourceType];
  const extract = ev.extractConfidence;
  return decay * quality * extract;
}

export function computeRollup(
  sourceSlug: string,
  destSlug: string,
  evidence: DDEvidence[],
  now: Date = new Date()
): DDPairRollup {
  const approved = evidence.filter(e =>
    e.sourceInstitutionSlug === sourceSlug &&
    e.destinationBankSlug === destSlug &&
    e.reviewStatus === 'approved'
  );

  if (approved.length === 0) {
    return {
      sourceInstitutionSlug: sourceSlug,
      destinationBankSlug: destSlug,
      verdict: 'not-enough-data',
      confidenceLevel: 'insufficient',
      confidenceScore: 0,
      approvedEvidenceCount: 0,
      distinctClusterCount: 0,
      latestObservedOn: null,
      updatedAt: now.toISOString(),
    };
  }

  // Cluster evidence and cap weights
  const clusters = new Map<string, { totalWeight: number; outcome: 'counts' | 'does_not_count' }[]>();
  const clusterWeights = new Map<string, number>();

  for (const ev of approved) {
    const key = clusterKey(ev);
    const w = computeWeight(ev, now);

    if (!clusters.has(key)) {
      clusters.set(key, []);
      clusterWeights.set(key, 0);
    }

    const currentTotal = clusterWeights.get(key)!;
    const capped = Math.min(w, CLUSTER_CAP - currentTotal);
    if (capped > 0) {
      clusters.get(key)!.push({ totalWeight: capped, outcome: ev.outcome });
      clusterWeights.set(key, currentTotal + capped);
    }
  }

  let Y = 0;
  let N = 0;
  for (const entries of clusters.values()) {
    for (const entry of entries) {
      if (entry.outcome === 'counts') Y += entry.totalWeight;
      else N += entry.totalWeight;
    }
  }

  const T = Y + N;
  const distinctClusterCount = clusters.size;

  // Find latest observed date
  let latestObserved: Date | null = null;
  for (const ev of approved) {
    const d = bestDate(ev);
    if (!latestObserved || d > latestObserved) latestObserved = d;
  }

  // Verdict
  let verdict: DDStatus;
  if (T < 1.5 && distinctClusterCount < 2) {
    verdict = 'not-enough-data';
  } else if (Y / T >= 0.70) {
    verdict = 'likely-works';
  } else if (Y / T <= 0.30) {
    verdict = 'likely-fails';
  } else {
    verdict = 'mixed';
  }

  // Confidence score
  let confidenceScore = (1 - Math.exp(-T / 3)) * Math.abs(2 * (Y / T) - 1);
  if (T < 1.5 && distinctClusterCount < 2) confidenceScore = 0;

  // Confidence level
  let confidenceLevel: ConfidenceLevel;
  if (T < 1.5 && distinctClusterCount < 2) {
    confidenceLevel = 'insufficient';
  } else if (confidenceScore >= 0.75) {
    confidenceLevel = 'high';
  } else if (confidenceScore >= 0.45) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  // Staleness caps
  if (latestObserved) {
    const staleDays = daysBetween(now, latestObserved);
    if (staleDays > 1095 && confidenceLevel !== 'insufficient') {
      confidenceLevel = 'low';
    } else if (staleDays > 730 && confidenceLevel === 'high') {
      confidenceLevel = 'medium';
    }
  }

  // Recent-conflict guard
  const recentConflict = checkRecentConflict(approved, now);
  if (recentConflict === 'severe' && confidenceLevel !== 'insufficient') {
    confidenceLevel = 'low';
  } else if (recentConflict === 'moderate' && confidenceLevel === 'high') {
    confidenceLevel = 'medium';
  }

  return {
    sourceInstitutionSlug: sourceSlug,
    destinationBankSlug: destSlug,
    verdict,
    confidenceLevel,
    confidenceScore,
    approvedEvidenceCount: approved.length,
    distinctClusterCount,
    latestObservedOn: latestObserved?.toISOString().split('T')[0] ?? null,
    updatedAt: now.toISOString(),
  };
}

function checkRecentConflict(
  approved: DDEvidence[],
  now: Date
): 'none' | 'moderate' | 'severe' {
  const recent90 = approved.filter(e => daysBetween(now, bestDate(e)) <= 90);
  const recent180 = approved.filter(e => daysBetween(now, bestDate(e)) <= 180);

  const has90Conflict = recent90.some(e => e.outcome === 'counts') && recent90.some(e => e.outcome === 'does_not_count');
  const has180Conflict = recent180.some(e => e.outcome === 'counts') && recent180.some(e => e.outcome === 'does_not_count');

  if (has90Conflict) {
    const corroborating = recent90.filter(e => e.outcome === 'counts').length;
    if (corroborating < 2) return 'severe';
  }

  if (has180Conflict) return 'moderate';

  return 'none';
}

export function computeAllRollups(evidence: DDEvidence[], now: Date = new Date()): DDPairRollup[] {
  const pairs = new Set<string>();
  for (const ev of evidence) {
    if (ev.reviewStatus === 'approved') {
      pairs.add(`${ev.sourceInstitutionSlug}|${ev.destinationBankSlug}`);
    }
  }

  const rollups: DDPairRollup[] = [];
  for (const pair of pairs) {
    const [source, dest] = pair.split('|');
    rollups.push(computeRollup(source, dest, evidence, now));
  }

  return rollups;
}
