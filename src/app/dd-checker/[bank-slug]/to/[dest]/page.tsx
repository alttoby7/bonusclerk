import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/dd-checker/StatusBadge';
import { ConfidenceDot } from '@/components/dd-checker/ConfidenceDot';
import { EvidenceTimeline } from '@/components/dd-checker/EvidenceTimeline';
import {
  getInstitution,
  getRollupForPair,
  getEvidenceForPair,
  getMethodGuideForType,
  getBestSourcesForBank,
  getAllEvidence,
  getAllInstitutions,
} from '@/lib/dd/repository';
import { getBonusesByBank } from '@/lib/bonus-repository';

export const revalidate = 3600;

interface Props {
  params: Promise<{ 'bank-slug': string; dest: string }>;
}

export async function generateStaticParams() {
  try {
    const [evidence, institutions] = await Promise.all([
      getAllEvidence(),
      getAllInstitutions(),
    ]);
    const trackedSet = new Set(institutions.filter(i => i.isTrackedBank).map(i => i.slug));
    const instSet = new Set(institutions.map(i => i.slug));
    const seen = new Set<string>();
    const params: { 'bank-slug': string; dest: string }[] = [];
    for (const e of evidence) {
      const s = e.sourceInstitutionSlug;
      const d = e.destinationBankSlug;
      if (!s || !d || !instSet.has(s) || !trackedSet.has(d)) continue;
      const key = `${s}|${d}`;
      if (seen.has(key)) continue;
      seen.add(key);
      params.push({ 'bank-slug': s, dest: d });
    }
    return params;
  } catch {
    return [];
  }
}

async function loadPair(sourceSlug: string, destSlug: string) {
  const [source, dest] = await Promise.all([
    getInstitution(sourceSlug),
    getInstitution(destSlug),
  ]);
  if (!source || !dest || !dest.isTrackedBank) return null;
  const [rollup, evidence] = await Promise.all([
    getRollupForPair(sourceSlug, destSlug),
    getEvidenceForPair(sourceSlug, destSlug),
  ]);
  const methodGuide = await getMethodGuideForType(source.type);
  return { source, dest, rollup, evidence, methodGuide };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'bank-slug': sourceSlug, dest: destSlug } = await params;
  const pair = await loadPair(sourceSlug, destSlug);
  if (!pair) return {};
  const { source, dest, rollup, evidence } = pair;
  const sourceName = source.shortName ?? source.name;
  const destName = dest.shortName ?? dest.name;
  const verdictLabel: Record<string, string> = {
    'likely-works': 'usually counts',
    'mixed': 'mixed reports',
    'likely-fails': 'usually fails',
    'not-enough-data': 'limited data',
  };
  const year = new Date().getFullYear();
  const noIndex = evidence.length === 0;

  return {
    title: `Does ${sourceName} ACH Push Count as Direct Deposit at ${destName}? (${year})`,
    description: evidence.length > 0
      ? `${evidence.length} community ${evidence.length === 1 ? 'report' : 'reports'} — ${sourceName} → ${destName} ${verdictLabel[rollup.verdict]}. See evidence dates, push instructions, and matching bonuses.`
      : `Limited data on ${sourceName} → ${destName}. See alternative sources that work at ${destName} and submit your own data point.`,
    robots: noIndex ? { index: false, follow: true } : undefined,
    alternates: { canonical: `/dd-checker/${sourceSlug}/to/${destSlug}` },
  };
}

export default async function DDPairPage({ params }: Props) {
  const { 'bank-slug': sourceSlug, dest: destSlug } = await params;
  const pair = await loadPair(sourceSlug, destSlug);
  if (!pair) return notFound();
  const { source, dest, rollup, evidence, methodGuide } = pair;

  const [destBonuses, bestSources, allInstitutions] = await Promise.all([
    getBonusesByBank(destSlug),
    getBestSourcesForBank(destSlug, 5),
    getAllInstitutions(),
  ]);
  const instBySlug = new Map(allInstitutions.map(i => [i.slug, i]));
  const activeBonuses = destBonuses.filter(b => b.isActive && b.requirements.directDeposit);
  const altSources = bestSources.filter(r => r.sourceInstitutionSlug !== sourceSlug);

  const sourceName = source.shortName ?? source.name;
  const destName = dest.shortName ?? dest.name;
  const successCount = evidence.filter(e => e.outcome === 'counts').length;
  const failCount = evidence.filter(e => e.outcome === 'does_not_count').length;

  return (
    <Container>
      <div className="py-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-text-tertiary mb-6">
          <Link href="/dd-checker" className="hover:text-accent transition-colors">DD Checker</Link>
          <span>/</span>
          <Link href={`/dd-checker/${destSlug}`} className="hover:text-accent transition-colors">{destName}</Link>
          <span>/</span>
          <span className="text-text-secondary">from {sourceName}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Does {sourceName} ACH Push Count as Direct Deposit at {destName}?
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <StatusBadge status={rollup.verdict} />
            <ConfidenceDot level={rollup.confidenceLevel} />
            <span className="text-sm text-text-tertiary font-[var(--font-mono)]">
              {evidence.length} {evidence.length === 1 ? 'report' : 'reports'}
              {evidence.length > 0 && ` · ${successCount} counted, ${failCount} didn't`}
            </span>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            <Card padding="md">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Verdict</h2>
              {evidence.length > 0 ? (
                <p className="text-sm text-text-secondary leading-relaxed">
                  Based on {evidence.length} community {evidence.length === 1 ? 'report' : 'reports'},
                  ACH pushes from {sourceName} to {destName}{' '}
                  {rollup.verdict === 'likely-works' && <strong className="text-success">usually count</strong>}
                  {rollup.verdict === 'likely-fails' && <strong className="text-danger">usually do not count</strong>}
                  {rollup.verdict === 'mixed' && <strong className="text-warning">show mixed results</strong>}
                  {rollup.verdict === 'not-enough-data' && <strong className="text-text-tertiary">do not yet have enough data</strong>}
                  {' '}as a direct deposit for bonus purposes.
                  {rollup.latestObservedOn && (
                    <> Most recent data point: {new Date(rollup.latestObservedOn).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-text-secondary leading-relaxed">
                  We don&apos;t have community reports for {sourceName} → {destName} yet.
                  Bank policies change quietly — what worked six months ago may fail today.
                  Check the alternative sources below for {destName}, or test with a small push first.
                </p>
              )}
            </Card>

            {evidence.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Evidence Timeline</h2>
                <Card padding="md">
                  <EvidenceTimeline evidence={evidence} />
                </Card>
              </section>
            )}

            {methodGuide && (
              <section>
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  How to Push from {sourceName}
                </h2>
                <Card padding="md">
                  <p className="text-sm text-text-tertiary mb-3 font-[var(--font-mono)]">
                    Processing: {methodGuide.processingTime}
                  </p>
                  <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
                    {methodGuide.steps.map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                  {methodGuide.tips.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">Tips</h3>
                      <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                        {methodGuide.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                  {methodGuide.warnings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-warning uppercase tracking-wide mb-2">Watch Out</h3>
                      <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                        {methodGuide.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </Card>
              </section>
            )}

            {altSources.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  Other Sources That Work at {destName}
                </h2>
                <Card padding="sm" className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary">Source</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary">Status</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-text-tertiary">Reports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {altSources.map(r => {
                        const inst = instBySlug.get(r.sourceInstitutionSlug);
                        return (
                        <tr key={r.sourceInstitutionSlug} className="border-b border-border last:border-0 hover:bg-surface-raised/50">
                          <td className="px-3 py-2.5">
                            <Link
                              href={`/dd-checker/${r.sourceInstitutionSlug}/to/${destSlug}`}
                              className="font-medium text-text-primary hover:text-accent transition-colors"
                            >
                              {inst?.shortName ?? inst?.name ?? r.sourceInstitutionSlug}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5"><StatusBadge status={r.verdict} /></td>
                          <td className="px-3 py-2.5 text-right font-[var(--font-mono)] text-text-secondary">
                            {r.approvedEvidenceCount}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <Card padding="md">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Pair Stats</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Reports</dt>
                  <dd className="text-text-primary font-medium font-[var(--font-mono)]">{evidence.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Counted as DD</dt>
                  <dd className="text-success font-medium font-[var(--font-mono)]">{successCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Did not count</dt>
                  <dd className="text-danger font-medium font-[var(--font-mono)]">{failCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Distinct sources</dt>
                  <dd className="text-text-primary font-medium font-[var(--font-mono)]">{rollup.distinctClusterCount}</dd>
                </div>
              </dl>
            </Card>

            {activeBonuses.length > 0 && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-text-primary mb-3">{destName} Bonuses with DD</h3>
                <div className="space-y-2">
                  {activeBonuses.map(b => (
                    <Link
                      key={b.id}
                      href={`/dd-checker/bonus/${b.id}`}
                      className="block rounded-md p-2 hover:bg-surface-raised transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{b.accountType}</span>
                        <span className="text-sm font-semibold text-accent font-[var(--font-mono)]">
                          ${b.bonusAmount}
                        </span>
                      </div>
                      <span className="text-xs text-accent mt-0.5 block">View DD Mission →</span>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            <Card padding="md" className="bg-accent-dim border-accent/20">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Got a data point?</h3>
              <p className="text-xs text-text-secondary">
                Community submissions coming soon. Until then, check r/churning for the latest weekly Data Points thread.
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </Container>
  );
}
