import Link from 'next/link';
import type { BankBonus } from '@/types/bonus';
import type { DDPairRollup, Institution } from '@/types/dd-checker';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { getMethodGuideForType } from '@/data/direct-deposit/method-guides';

export function BonusMission({
  bonus,
  bestSources,
  failingSources,
  allInstitutions,
}: {
  bonus: BankBonus;
  bestSources: DDPairRollup[];
  failingSources: DDPairRollup[];
  allInstitutions: Institution[];
}) {
  const dd = bonus.requirements.directDeposit!;

  return (
    <div className="space-y-8">
      {/* Goal card */}
      <Card padding="lg" className="bg-accent-dim border-accent/20">
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Your Goal</div>
          <div className="text-xl font-bold text-text-primary">
            ${dd.amount.toLocaleString()} direct deposit {dd.frequency}
          </div>
        </div>
      </Card>

      {/* Recommended methods */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Recommended Methods</h2>
        {bestSources.length === 0 ? (
          <p className="text-sm text-text-tertiary">No confirmed working sources yet for this bank.</p>
        ) : (
          <div className="space-y-4">
            {bestSources.map((rollup, i) => {
              const src = allInstitutions.find(inst => inst.slug === rollup.sourceInstitutionSlug);
              if (!src) return null;
              const guide = getMethodGuideForType(src.type);

              return (
                <Card key={rollup.sourceInstitutionSlug} padding="md" className="animate-slide-up" >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-sm font-bold text-accent">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {src.shortName ?? src.name}
                        </h3>
                        <span className="text-xs text-text-tertiary capitalize">{src.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rollup.verdict} />
                      <ConfidenceMeter level={rollup.confidenceLevel} score={rollup.confidenceScore} />
                    </div>
                  </div>

                  {guide && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
                          Step-by-Step
                        </h4>
                        <ol className="space-y-1.5">
                          {guide.steps.map((step, si) => (
                            <li key={si} className="flex gap-2 text-sm text-text-secondary">
                              <span className="shrink-0 text-xs text-text-tertiary font-[var(--font-mono)] mt-0.5">{si + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
                        <span>Processing: {guide.processingTime}</span>
                        <span>{rollup.approvedEvidenceCount} data points</span>
                        {rollup.latestObservedOn && (
                          <span>Last confirmed: {new Date(rollup.latestObservedOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                      {guide.tips.length > 0 && (
                        <div className="rounded-md bg-success-light/50 px-3 py-2">
                          <p className="text-xs text-text-secondary">
                            <span className="font-medium">Tip:</span> {guide.tips[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Failing sources */}
      {failingSources.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Sources That DON&apos;T Work at {bonus.bank}
          </h2>
          <Card padding="md" className="bg-danger-light/30 border-danger/10">
            <div className="flex flex-wrap gap-2">
              {failingSources.map(r => {
                const src = allInstitutions.find(inst => inst.slug === r.sourceInstitutionSlug);
                return (
                  <span key={r.sourceInstitutionSlug} className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-sm border border-border">
                    <svg className="h-3 w-3 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-text-secondary">{src?.shortName ?? src?.name ?? r.sourceInstitutionSlug}</span>
                  </span>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* Link to bank page */}
      <div className="text-center">
        <Link
          href={`/dd-checker/${bonus.bankSlug}`}
          className="text-sm text-accent hover:underline"
        >
          View all {bonus.bank} DD data →
        </Link>
      </div>
    </div>
  );
}
