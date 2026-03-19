'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Institution, DDPairRollup } from '@/types/dd-checker';
import type { BankBonus } from '@/types/bonus';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { ConfidenceMeter } from './ConfidenceMeter';

const typeColors: Record<string, string> = {
  bank: 'bg-accent-light text-accent',
  brokerage: 'bg-success-light text-success',
  fintech: 'bg-warning-light text-warning',
  p2p: 'bg-danger-light text-danger',
  payroll: 'bg-surface-raised text-text-secondary',
  government: 'bg-surface-raised text-text-secondary',
  other: 'bg-surface-raised text-text-secondary',
};

interface RouteResult {
  destSlug: string;
  destName: string;
  bonusAmount: number;
  bonusId: string;
  sourceSlug: string;
  sourceName: string;
  rollup: DDPairRollup;
}

export function RouteFinder({
  institutions,
  rollups,
  bonuses,
}: {
  institutions: Institution[];
  rollups: DDPairRollup[];
  bonuses: BankBonus[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleInstitution(slug: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  // Build results: for each selected source, find likely-works rollups that match active bonuses with DD
  const results: RouteResult[] = [];
  if (selected.size > 0) {
    const ddBonuses = bonuses.filter(b => b.isActive && b.requirements.directDeposit);
    const ddBankSlugs = new Set(ddBonuses.map(b => b.bankSlug));

    for (const rollup of rollups) {
      if (!selected.has(rollup.sourceInstitutionSlug)) continue;
      if (rollup.verdict !== 'likely-works') continue;
      if (!ddBankSlugs.has(rollup.destinationBankSlug)) continue;

      const bonus = ddBonuses.find(b => b.bankSlug === rollup.destinationBankSlug);
      if (!bonus) continue;

      const dest = institutions.find(i => i.slug === rollup.destinationBankSlug);
      const src = institutions.find(i => i.slug === rollup.sourceInstitutionSlug);

      results.push({
        destSlug: rollup.destinationBankSlug,
        destName: dest?.shortName ?? dest?.name ?? rollup.destinationBankSlug,
        bonusAmount: bonus.bonusAmount,
        bonusId: bonus.id,
        sourceSlug: rollup.sourceInstitutionSlug,
        sourceName: src?.shortName ?? src?.name ?? rollup.sourceInstitutionSlug,
        rollup,
      });
    }

    // Sort by confidence * bonus amount descending
    results.sort((a, b) => (b.rollup.confidenceScore * b.bonusAmount) - (a.rollup.confidenceScore * a.bonusAmount));
  }

  // Dedupe by destination (keep best source per dest)
  const seen = new Set<string>();
  const dedupedResults = results.filter(r => {
    if (seen.has(r.destSlug)) return false;
    seen.add(r.destSlug);
    return true;
  });

  // Group institutions by type for the selection grid
  const grouped = new Map<string, Institution[]>();
  for (const inst of institutions) {
    const type = inst.type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(inst);
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Select the accounts you have:</h3>
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([type, insts]) => (
            <div key={type}>
              <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2 capitalize">{type}</div>
              <div className="flex flex-wrap gap-2">
                {insts.map(inst => {
                  const isSelected = selected.has(inst.slug);
                  return (
                    <button
                      key={inst.slug}
                      type="button"
                      onClick={() => toggleInstitution(inst.slug)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent-light text-accent font-medium'
                          : 'border-border bg-surface text-text-primary hover:border-border-strong'
                      }`}
                    >
                      <span className={`inline-block h-2 w-2 rounded-full ${typeColors[inst.type] ?? 'bg-surface-raised'}`} />
                      {inst.shortName ?? inst.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="mt-3 text-xs text-text-tertiary">
            {selected.size} account{selected.size !== 1 ? 's' : ''} selected
          </div>
        )}
      </Card>

      {selected.size > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            {dedupedResults.length > 0
              ? `${dedupedResults.length} bonus${dedupedResults.length !== 1 ? 'es' : ''} you can trigger`
              : 'No matching bonuses found'
            }
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {dedupedResults.map(r => (
              <Link key={`${r.destSlug}-${r.sourceSlug}`} href={`/dd-checker/bonus/${r.bonusId}`}>
                <Card hover padding="md" className="animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary">{r.destName}</span>
                    <span className="font-money text-sm font-bold text-accent">${r.bonusAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">via {r.sourceName}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.rollup.verdict} />
                      <ConfidenceMeter level={r.rollup.confidenceLevel} score={r.rollup.confidenceScore} showLabel={false} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
