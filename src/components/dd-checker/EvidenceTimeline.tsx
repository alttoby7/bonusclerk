import type { DDEvidence } from '@/types/dd-checker';

export function EvidenceTimeline({ evidence }: { evidence: DDEvidence[] }) {
  if (evidence.length === 0) {
    return <p className="text-xs text-text-tertiary py-2">No evidence details available.</p>;
  }

  return (
    <div className="space-y-2 py-2">
      {evidence.map(e => {
        const date = e.observedOn ?? e.reportedOn;
        const isSuccess = e.outcome === 'counts';
        return (
          <div key={e.id} className="flex items-center gap-3 text-xs">
            <span className="shrink-0 rounded-full bg-surface-sunken px-2 py-0.5 text-text-tertiary font-[var(--font-mono)]">
              {new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <span className={`shrink-0 ${isSuccess ? 'text-success' : 'text-danger'}`}>
              {isSuccess ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span className="text-text-secondary capitalize">
              {e.sourceType.replace(/_/g, ' ')}
            </span>
            <span className="text-text-tertiary font-[var(--font-mono)]">
              {(e.extractConfidence * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
