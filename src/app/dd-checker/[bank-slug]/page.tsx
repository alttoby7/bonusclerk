import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/dd-checker/StatusBadge';
import { ConfidenceDot } from '@/components/dd-checker/ConfidenceDot';
import { InboundRollupsTable } from '@/components/dd-checker/InboundRollupsTable';
import {
  getTrackedBanks,
  getInstitution,
  getRollupsForDestination,
  getRollupsForSource,
  getAllInstitutions,
  getEvidenceTimeline,
} from '@/lib/dd/repository';
import { getBonusesByBank } from '@/data/bonuses';

interface Props {
  params: Promise<{ 'bank-slug': string }>;
}

export async function generateStaticParams() {
  return getTrackedBanks().map(bank => ({ 'bank-slug': bank.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'bank-slug': slug } = await params;
  const bank = getInstitution(slug);
  if (!bank) return {};
  const name = bank.shortName ?? bank.name;
  return {
    title: `Does ACH Count as Direct Deposit at ${name}? | DD Checker | BonusClerk`,
    description: `Check which ACH transfers count as direct deposits at ${name}. Community-verified compatibility data for bank bonus hunters.`,
  };
}

export default async function BankDDPage({ params }: Props) {
  const { 'bank-slug': slug } = await params;
  const bank = getInstitution(slug);
  if (!bank || !bank.isTrackedBank) return notFound();

  const allInstitutions = getAllInstitutions();
  const inboundRollups = getRollupsForDestination(slug)
    .sort((a, b) => b.approvedEvidenceCount - a.approvedEvidenceCount);
  const outboundRollups = getRollupsForSource(slug)
    .sort((a, b) => b.approvedEvidenceCount - a.approvedEvidenceCount);
  const bonuses = getBonusesByBank(slug).filter(b => b.isActive);
  const name = bank.shortName ?? bank.name;

  // Build evidence map for expandable rows
  const evidenceBySource: Record<string, import('@/types/dd-checker').DDEvidence[]> = {};
  for (const r of inboundRollups) {
    evidenceBySource[r.sourceInstitutionSlug] = getEvidenceTimeline(r.sourceInstitutionSlug, slug);
  }

  return (
    <Container>
      <div className="py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-text-tertiary mb-6">
          <Link href="/dd-checker" className="hover:text-accent transition-colors">DD Checker</Link>
          <span>/</span>
          <span className="text-text-secondary">{name}</span>
        </nav>

        {/* Hero */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-light text-xl font-bold text-accent">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">{bank.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {bank.isTrackedBank && (
                <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Tracked Bank
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main */}
          <div className="space-y-8">
            {/* Inbound */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                What Counts as Direct Deposit at {name}
              </h2>
              <InboundRollupsTable
                rollups={inboundRollups}
                allInstitutions={allInstitutions}
                evidenceBySource={evidenceBySource}
              />
            </section>

            {/* Outbound */}
            {outboundRollups.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Where {name} Pushes Count as DD
                </h2>
                <Card padding="sm" className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary">Destination</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-tertiary hidden sm:table-cell">Confidence</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-text-tertiary">Data Points</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-text-tertiary hidden md:table-cell">Last Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outboundRollups.map(r => {
                        const dest = allInstitutions.find(i => i.slug === r.destinationBankSlug);
                        return (
                          <tr key={r.destinationBankSlug} className="border-b border-border last:border-0 hover:bg-surface-raised/50">
                            <td className="px-3 py-2.5 font-medium text-text-primary">
                              <Link href={`/dd-checker/${r.destinationBankSlug}`} className="hover:text-accent transition-colors">
                                {dest?.shortName ?? dest?.name ?? r.destinationBankSlug}
                              </Link>
                            </td>
                            <td className="px-3 py-2.5">
                              <StatusBadge status={r.verdict} />
                            </td>
                            <td className="px-3 py-2.5 hidden sm:table-cell">
                              <ConfidenceDot level={r.confidenceLevel} />
                            </td>
                            <td className="px-3 py-2.5 text-right font-[var(--font-mono)] text-text-secondary">
                              {r.approvedEvidenceCount}
                            </td>
                            <td className="px-3 py-2.5 text-right text-text-tertiary hidden md:table-cell">
                              {r.latestObservedOn
                                ? new Date(r.latestObservedOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                : '—'}
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

          {/* Sidebar */}
          <div className="space-y-4">
            <Card padding="md">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Bank Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Website</dt>
                  <dd><a href={`https://www.${slug === 'us-bank' ? 'usbank' : slug}.com`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs">Visit site</a></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Known combos</dt>
                  <dd className="text-text-primary font-medium">{inboundRollups.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Works</dt>
                  <dd className="text-success font-medium">{inboundRollups.filter(r => r.verdict === 'likely-works').length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Fails</dt>
                  <dd className="text-danger font-medium">{inboundRollups.filter(r => r.verdict === 'likely-fails').length}</dd>
                </div>
              </dl>
            </Card>

            {bonuses.length > 0 && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Active Bonuses</h3>
                <div className="space-y-2">
                  {bonuses.map(b => {
                    const hasDDMission = !!b.requirements.directDeposit;
                    return (
                      <Link
                        key={b.id}
                        href={hasDDMission ? `/dd-checker/bonus/${b.id}` : `/bonuses#${b.id}`}
                        className="block rounded-md p-2 hover:bg-surface-raised transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-primary">{b.accountType}</span>
                          <span className="text-sm font-semibold text-accent font-[var(--font-mono)]">
                            ${b.bonusAmount}
                          </span>
                        </div>
                        {hasDDMission && (
                          <span className="text-xs text-accent mt-0.5 block">View DD Mission →</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card padding="md" className="bg-accent-dim border-accent/20">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Have data to share?</h3>
              <p className="text-xs text-text-secondary">
                Community submissions coming soon. Help us build the most accurate DD compatibility database.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
