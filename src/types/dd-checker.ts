export type DDStatus = 'likely-works' | 'mixed' | 'likely-fails' | 'not-enough-data';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient';
export type InstitutionType = 'bank' | 'brokerage' | 'fintech' | 'p2p' | 'payroll' | 'government' | 'other';
export type SourceType = 'doctor_of_credit' | 'staff_manual' | 'linked_public_report' | 'trusted_user' | 'new_user' | 'anonymous';

export interface Institution {
  slug: string;
  name: string;
  shortName?: string;
  type: InstitutionType;
  isTrackedBank: boolean;
}

export interface DDEvidence {
  id: string;
  sourceInstitutionSlug: string;
  sourceLabel: string;
  destinationBankSlug: string;
  outcome: 'counts' | 'does_not_count';
  observedOn: string | null;
  reportedOn: string;
  datePrecision: 'exact' | 'month' | 'year' | 'unknown';
  sourceType: SourceType;
  sourceUrl?: string;
  extractConfidence: number;
  reviewStatus: 'approved' | 'pending' | 'rejected';
  notes?: string;
}

export interface DDPairRollup {
  sourceInstitutionSlug: string;
  destinationBankSlug: string;
  verdict: DDStatus;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  approvedEvidenceCount: number;
  distinctClusterCount: number;
  latestObservedOn: string | null;
  updatedAt: string;
}
