import type { DDEvidenceEntry } from './types.js';

/**
 * Dedup logic: an entry is only a duplicate if its sourceUrl already exists
 * for the same pair + outcome. Multiple independent reports of the same
 * pair+outcome are NOT duplicates — confidence scoring relies on counting
 * independent reporters.
 *
 * Edge case: if either entry lacks a URL, fall back to (pair + outcome +
 * reportedOn) to avoid double-storing seed data.
 */
export function isDuplicate(
  candidate: DDEvidenceEntry,
  existing: DDEvidenceEntry[]
): boolean {
  return existing.some(e => {
    if (candidate.sourceUrl && e.sourceUrl) {
      return candidate.sourceUrl === e.sourceUrl
        && e.sourceInstitutionSlug === candidate.sourceInstitutionSlug
        && e.destinationBankSlug === candidate.destinationBankSlug
        && e.outcome === candidate.outcome;
    }

    if (e.sourceInstitutionSlug !== candidate.sourceInstitutionSlug) return false;
    if (e.destinationBankSlug !== candidate.destinationBankSlug) return false;
    if (e.outcome !== candidate.outcome) return false;
    return e.reportedOn === candidate.reportedOn;
  });
}
