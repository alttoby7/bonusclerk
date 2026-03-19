import { DEDUP_DATE_WINDOW_DAYS } from './config.js';
import type { DDEvidenceEntry } from './types.js';

export function isDuplicate(
  candidate: DDEvidenceEntry,
  existing: DDEvidenceEntry[]
): boolean {
  const windowMs = DEDUP_DATE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return existing.some(e => {
    // Must match slug pair + outcome
    if (e.sourceInstitutionSlug !== candidate.sourceInstitutionSlug) return false;
    if (e.destinationBankSlug !== candidate.destinationBankSlug) return false;
    if (e.outcome !== candidate.outcome) return false;

    // Same source URL = definite duplicate
    if (candidate.sourceUrl && e.sourceUrl && candidate.sourceUrl === e.sourceUrl) {
      return true;
    }

    // Date within window
    if (candidate.observedOn && e.observedOn) {
      const diff = Math.abs(
        new Date(candidate.observedOn).getTime() - new Date(e.observedOn).getTime()
      );
      if (diff <= windowMs) return true;
    }

    // If no dates to compare, check reportedOn
    if (candidate.reportedOn && e.reportedOn) {
      const diff = Math.abs(
        new Date(candidate.reportedOn).getTime() - new Date(e.reportedOn).getTime()
      );
      if (diff <= windowMs) return true;
    }

    return false;
  });
}
