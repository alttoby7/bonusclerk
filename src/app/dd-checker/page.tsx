import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/dd-checker/StatusBadge';
import { DDLookupTool } from '@/components/dd-checker/DDLookupTool';
import {
  getAllInstitutions,
  getTrackedBanks,
  getAllRollups,
  getPopularPairs,
  getTotalDataPoints,
  getInstitution,
} from '@/lib/dd/repository';

export const metadata: Metadata = {
  title: 'Direct Deposit Compatibility Checker | BonusClerk',
  description: 'Check if your ACH transfer counts as a direct deposit for bank bonuses. Community-verified data for 14+ banks and 30+ source institutions.',
};

export default function DDCheckerPage() {
  const institutions = getAllInstitutions();
  const trackedBanks = getTrackedBanks();
  const rollups = getAllRollups();
  const popular = getPopularPairs(6);
  const totalPoints = getTotalDataPoints();

  return (
    <Container>
      <div className="py-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl mb-3">
            Direct Deposit Compatibility Checker
          </h1>
          <p className="text-text-secondary">
            Check if an ACH push from your bank or brokerage counts as a direct deposit. Based on{' '}
            <span className="font-semibold text-text-primary">{totalPoints}</span> community-verified data points.
          </p>
        </div>

        {/* Lookup Tool */}
        <DDLookupTool
          institutions={institutions}
          trackedBanks={trackedBanks}
          rollups={rollups}
        />

        {/* Popular Combinations */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Popular Combinations</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map(r => {
              const src = getInstitution(r.sourceInstitutionSlug);
              const dest = getInstitution(r.destinationBankSlug);
              if (!src || !dest) return null;
              return (
                <Link key={`${r.sourceInstitutionSlug}-${r.destinationBankSlug}`} href={`/dd-checker/${dest.slug}`}>
                  <Card hover padding="md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">
                        {src.shortName ?? src.name} → {dest.shortName ?? dest.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={r.verdict} />
                      <span className="text-xs text-text-tertiary">{r.approvedEvidenceCount} data points</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Browse by bank */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Browse by Bank</h2>
            <Link href="/dd-checker/matrix" className="text-sm text-accent hover:underline">
              View full matrix →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trackedBanks.map(bank => {
              const bankRollups = rollups.filter(r => r.destinationBankSlug === bank.slug);
              const worksCount = bankRollups.filter(r => r.verdict === 'likely-works').length;
              return (
                <Link key={bank.slug} href={`/dd-checker/${bank.slug}`}>
                  <Card hover padding="md">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-sm font-bold text-accent">
                        {(bank.shortName ?? bank.name).charAt(0)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{bank.shortName ?? bank.name}</div>
                        <div className="text-xs text-text-tertiary">
                          {worksCount} source{worksCount !== 1 ? 's' : ''} verified
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <Card padding="lg" className="bg-accent-dim border-accent/20 text-center">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Help Build the Database</h2>
          <p className="text-sm text-text-secondary max-w-lg mx-auto">
            Community submissions are coming soon. We&apos;re building the most comprehensive direct deposit compatibility database for bank bonus hunters.
          </p>
        </Card>
      </div>
    </Container>
  );
}
