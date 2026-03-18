'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Institution, DDPairRollup, DDStatus } from '@/types/dd-checker';
import { Card } from '@/components/ui/Card';

const dotColors: Record<DDStatus, string> = {
  'likely-works': 'bg-success',
  'mixed': 'bg-warning',
  'likely-fails': 'bg-danger',
  'not-enough-data': 'bg-text-tertiary opacity-30',
};

const dotLabels: Record<DDStatus, string> = {
  'likely-works': 'Likely Works',
  'mixed': 'Mixed',
  'likely-fails': 'Likely Fails',
  'not-enough-data': 'No Data',
};

function getRollup(
  rollups: DDPairRollup[],
  sourceSlug: string,
  destSlug: string
): DDPairRollup | null {
  return rollups.find(
    r => r.sourceInstitutionSlug === sourceSlug && r.destinationBankSlug === destSlug
  ) ?? null;
}

export function DDMatrix({
  sources,
  destinations,
  rollups,
}: {
  sources: Institution[];
  destinations: Institution[];
  rollups: DDPairRollup[];
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DDStatus | 'all'>('all');
  const [popover, setPopover] = useState<{ source: string; dest: string } | null>(null);

  const filteredSources = sources.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.shortName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search institutions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as DDStatus | 'all')}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          <option value="all">All statuses</option>
          <option value="likely-works">Likely Works</option>
          <option value="mixed">Mixed</option>
          <option value="likely-fails">Likely Fails</option>
          <option value="not-enough-data">No Data</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        {(Object.entries(dotColors) as [DDStatus, string][]).map(([status, color]) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
            {dotLabels[status]}
          </span>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <Card padding="sm" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface px-3 py-2 text-left text-xs font-medium text-text-tertiary">
                  Source ↓ / Dest →
                </th>
                {destinations.map(dest => (
                  <th key={dest.slug} className="px-1 py-2 text-center">
                    <span className="inline-block origin-bottom-left -rotate-45 whitespace-nowrap text-xs font-medium text-text-secondary">
                      {dest.shortName ?? dest.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSources.map(source => (
                <tr key={source.slug} className="border-t border-border hover:bg-surface-raised/50">
                  <td className="sticky left-0 z-10 bg-surface px-3 py-2 text-xs font-medium text-text-primary whitespace-nowrap">
                    {source.shortName ?? source.name}
                  </td>
                  {destinations.map(dest => {
                    const rollup = getRollup(rollups, source.slug, dest.slug);
                    const verdict: DDStatus = rollup?.verdict ?? 'not-enough-data';

                    if (statusFilter !== 'all' && verdict !== statusFilter) {
                      return <td key={dest.slug} className="px-1 py-2 text-center"><span className="inline-block h-3 w-3" /></td>;
                    }

                    return (
                      <td key={dest.slug} className="px-1 py-2 text-center relative">
                        <button
                          type="button"
                          onClick={() => setPopover(
                            popover?.source === source.slug && popover?.dest === dest.slug
                              ? null
                              : { source: source.slug, dest: dest.slug }
                          )}
                          className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-surface-raised transition-colors"
                          title={`${source.shortName ?? source.name} → ${dest.shortName ?? dest.name}: ${dotLabels[verdict]}`}
                        >
                          <span className={`inline-block h-3 w-3 rounded-full ${dotColors[verdict]}`} />
                        </button>
                        {popover?.source === source.slug && popover?.dest === dest.slug && rollup && (
                          <div className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-1 w-48 rounded-lg border border-border bg-surface p-3 shadow-lg text-left">
                            <div className="text-xs font-medium text-text-primary mb-1">
                              {source.shortName ?? source.name} → {dest.shortName ?? dest.name}
                            </div>
                            <div className="text-xs text-text-secondary space-y-0.5">
                              <div>Status: {dotLabels[verdict]}</div>
                              <div>Data points: {rollup.approvedEvidenceCount}</div>
                              <div>Last verified: {rollup.latestObservedOn ? new Date(rollup.latestObservedOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</div>
                            </div>
                            <Link
                              href={`/dd-checker/${dest.slug}`}
                              className="block mt-2 text-xs text-accent hover:underline"
                            >
                              View bank details →
                            </Link>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Mobile accordion */}
      <div className="lg:hidden space-y-3">
        <DDMatrixCards
          sources={filteredSources}
          destinations={destinations}
          rollups={rollups}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
}

function DDMatrixCards({
  sources,
  destinations,
  rollups,
  statusFilter,
}: {
  sources: Institution[];
  destinations: Institution[];
  rollups: DDPairRollup[];
  statusFilter: DDStatus | 'all';
}) {
  const [expandedBank, setExpandedBank] = useState<string | null>(null);

  return (
    <>
      {destinations.map(dest => {
        const isExpanded = expandedBank === dest.slug;
        const destRollups = rollups.filter(r => r.destinationBankSlug === dest.slug);
        const worksCount = destRollups.filter(r => r.verdict === 'likely-works').length;

        return (
          <Card key={dest.slug} padding="sm">
            <button
              type="button"
              onClick={() => setExpandedBank(isExpanded ? null : dest.slug)}
              className="flex w-full items-center justify-between px-2 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-sm font-bold text-accent">
                  {(dest.shortName ?? dest.name).charAt(0)}
                </span>
                <div className="text-left">
                  <div className="text-sm font-medium text-text-primary">{dest.shortName ?? dest.name}</div>
                  <div className="text-xs text-text-tertiary">{worksCount} sources work</div>
                </div>
              </div>
              <svg
                className={`h-4 w-4 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="border-t border-border mt-1 pt-2 px-2 pb-1 space-y-1">
                {sources.map(source => {
                  const rollup = getRollup(rollups, source.slug, dest.slug);
                  const verdict: DDStatus = rollup?.verdict ?? 'not-enough-data';
                  if (statusFilter !== 'all' && verdict !== statusFilter) return null;

                  return (
                    <div key={source.slug} className="flex items-center justify-between py-1">
                      <span className="text-sm text-text-primary">{source.shortName ?? source.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${dotColors[verdict]}`} />
                        <span className="text-xs text-text-secondary w-16 text-right">{dotLabels[verdict]}</span>
                        {rollup && (
                          <span className="text-xs text-text-tertiary w-8 text-right">{rollup.approvedEvidenceCount}pt</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Link
                  href={`/dd-checker/${dest.slug}`}
                  className="block mt-2 text-xs text-accent hover:underline text-center py-1"
                >
                  View all {dest.shortName ?? dest.name} details →
                </Link>
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}
