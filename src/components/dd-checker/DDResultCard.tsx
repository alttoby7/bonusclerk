'use client';

import type { DDPairRollup, Institution } from '@/types/dd-checker';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { ConfidenceDot } from './ConfidenceDot';

const borderColors: Record<string, string> = {
  'likely-works': 'border-l-success',
  'mixed': 'border-l-warning',
  'likely-fails': 'border-l-danger',
  'not-enough-data': 'border-l-text-tertiary',
};

const descriptions: Record<string, string> = {
  'likely-works': 'Based on community data, ACH pushes from this source are likely recognized as direct deposits at this bank.',
  'mixed': 'Reports are mixed — some users report success while others report failure. Results may vary by account type or timing.',
  'likely-fails': 'Based on community data, ACH pushes from this source are unlikely to count as direct deposits at this bank.',
  'not-enough-data': 'We don\'t have enough data points for this combination yet. Consider trying a well-known source like Fidelity or Schwab.',
};

export function DDResultCard({
  rollup,
  source,
  destination,
}: {
  rollup: DDPairRollup;
  source: Institution;
  destination: Institution;
}) {
  return (
    <Card className={`border-l-4 ${borderColors[rollup.verdict]}`} padding="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {source.shortName ?? source.name} → {destination.shortName ?? destination.name}
            </h3>
            <StatusBadge status={rollup.verdict} />
          </div>
          <p className="text-sm text-text-secondary">{descriptions[rollup.verdict]}</p>
        </div>
        <div className="flex gap-6 sm:gap-8 text-center">
          <div>
            <div className="text-lg font-semibold text-text-primary font-[var(--font-mono)]">
              {rollup.approvedEvidenceCount}
            </div>
            <div className="text-xs text-text-tertiary">Data Points</div>
          </div>
          <div>
            <div className="mb-0.5">
              <ConfidenceDot level={rollup.confidenceLevel} />
            </div>
            <div className="text-xs text-text-tertiary">Confidence</div>
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">
              {rollup.latestObservedOn
                ? new Date(rollup.latestObservedOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '—'}
            </div>
            <div className="text-xs text-text-tertiary">Last Verified</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
