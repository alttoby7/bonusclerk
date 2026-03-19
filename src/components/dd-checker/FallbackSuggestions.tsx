'use client';

import type { Institution, DDPairRollup } from '@/types/dd-checker';
import { ConfidenceDot } from './ConfidenceDot';

export function FallbackSuggestions({
  destSlug,
  currentSourceSlug,
  rollups,
  institutions,
}: {
  destSlug: string;
  currentSourceSlug: string;
  rollups: DDPairRollup[];
  institutions: Institution[];
}) {
  const alternatives = rollups
    .filter(
      r =>
        r.destinationBankSlug === destSlug &&
        r.sourceInstitutionSlug !== currentSourceSlug &&
        r.verdict === 'likely-works'
    )
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 3);

  if (alternatives.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-raised px-4 py-3 animate-slide-up">
      <p className="text-sm font-medium text-text-primary mb-2">Instead, try these sources:</p>
      <div className="flex flex-wrap gap-3">
        {alternatives.map(r => {
          const src = institutions.find(i => i.slug === r.sourceInstitutionSlug);
          if (!src) return null;
          return (
            <span
              key={r.sourceInstitutionSlug}
              className="inline-flex items-center gap-2 rounded-md bg-surface px-3 py-1.5 border border-border text-sm"
            >
              <span className="font-medium text-text-primary">{src.shortName ?? src.name}</span>
              <ConfidenceDot level={r.confidenceLevel} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
