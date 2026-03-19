'use client';

import { useState } from 'react';
import type { Institution, DDPairRollup, DDEvidence } from '@/types/dd-checker';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { EvidenceTimeline } from './EvidenceTimeline';

export function InboundRollupsTable({
  rollups,
  allInstitutions,
  evidenceBySource,
}: {
  rollups: DDPairRollup[];
  allInstitutions: Institution[];
  evidenceBySource: Record<string, DDEvidence[]>;
}) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  if (rollups.length === 0) {
    return <p className="text-sm text-text-tertiary">No data available yet.</p>;
  }

  return (
    <Card padding="sm" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary">Source</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary hidden sm:table-cell">Confidence</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-text-tertiary">Data Points</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-text-tertiary hidden md:table-cell">Last Verified</th>
          </tr>
        </thead>
        <tbody>
          {rollups.map(r => {
            const src = allInstitutions.find(i => i.slug === r.sourceInstitutionSlug);
            const isExpanded = expandedSource === r.sourceInstitutionSlug;
            const evidence = evidenceBySource[r.sourceInstitutionSlug] ?? [];

            return (
              <tr key={r.sourceInstitutionSlug} className="group">
                <td colSpan={5} className="p-0">
                  <button
                    type="button"
                    onClick={() => setExpandedSource(isExpanded ? null : r.sourceInstitutionSlug)}
                    className="flex w-full items-center hover:bg-surface-raised/50 transition-colors"
                  >
                    <span className="px-3 py-2.5 font-medium text-text-primary text-left flex items-center gap-1.5 flex-1 min-w-0">
                      <svg
                        className={`h-3 w-3 shrink-0 text-text-tertiary transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {src?.shortName ?? src?.name ?? r.sourceInstitutionSlug}
                    </span>
                    <span className="px-3 py-2.5">
                      <StatusBadge status={r.verdict} />
                    </span>
                    <span className="px-3 py-2.5 hidden sm:block">
                      <ConfidenceMeter level={r.confidenceLevel} score={r.confidenceScore} />
                    </span>
                    <span className="px-3 py-2.5 text-right font-[var(--font-mono)] text-text-secondary w-20">
                      {r.approvedEvidenceCount}
                    </span>
                    <span className="px-3 py-2.5 text-right text-text-tertiary hidden md:block w-28">
                      {r.latestObservedOn
                        ? new Date(r.latestObservedOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </button>
                  {isExpanded && evidence.length > 0 && (
                    <div className="px-6 pb-3 border-b border-border bg-surface-raised/30 animate-slide-up">
                      <EvidenceTimeline evidence={evidence} />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
