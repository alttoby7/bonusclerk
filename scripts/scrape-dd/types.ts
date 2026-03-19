export interface RawExtraction {
  sourceText: string;
  sourceUrl: string;
  sourcePlatform: 'doctor_of_credit' | 'reddit';
  extractedAt: string;
  sourceInstitution: string;
  destinationBank: string;
  outcome: 'counts' | 'does_not_count' | 'ambiguous';
  observedDate: string | null;
  datePrecision: 'exact' | 'month' | 'year' | 'unknown';
  extractConfidence: number;
  notes: string;
}

export interface RawComment {
  text: string;
  url: string;
  platform: 'doctor_of_credit' | 'reddit';
  postedOn: string | null;
}

export interface ScraperResult {
  newEntries: DDEvidenceEntry[];
  duplicatesSkipped: number;
  unmatchedNames: { raw: string; context: string; url: string }[];
}

export interface DDEvidenceEntry {
  id: string;
  sourceInstitutionSlug: string;
  sourceLabel: string;
  destinationBankSlug: string;
  outcome: 'counts' | 'does_not_count';
  observedOn: string | null;
  reportedOn: string;
  datePrecision: 'exact' | 'month' | 'year' | 'unknown';
  sourceType: string;
  sourceUrl?: string;
  extractConfidence: number;
  reviewStatus: 'approved' | 'pending' | 'rejected';
  notes?: string;
}
