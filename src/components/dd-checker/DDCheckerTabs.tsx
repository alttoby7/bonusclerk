'use client';

import { useState } from 'react';
import type { Institution, DDPairRollup } from '@/types/dd-checker';
import type { BankBonus } from '@/types/bonus';
import { DDLookupTool } from './DDLookupTool';
import { RouteFinder } from './RouteFinder';

type Tab = 'lookup' | 'accounts';

export function DDCheckerTabs({
  institutions,
  trackedBanks,
  rollups,
  bonuses,
}: {
  institutions: Institution[];
  trackedBanks: Institution[];
  rollups: DDPairRollup[];
  bonuses: BankBonus[];
}) {
  const [tab, setTab] = useState<Tab>('lookup');

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-surface-raised p-1 border border-border max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setTab('lookup')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'lookup'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Check a Pair
        </button>
        <button
          type="button"
          onClick={() => setTab('accounts')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'accounts'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          My Accounts
        </button>
      </div>

      {tab === 'lookup' ? (
        <DDLookupTool
          institutions={institutions}
          trackedBanks={trackedBanks}
          rollups={rollups}
        />
      ) : (
        <RouteFinder
          institutions={institutions}
          rollups={rollups}
          bonuses={bonuses}
        />
      )}
    </div>
  );
}
