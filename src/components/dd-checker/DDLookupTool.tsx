'use client';

import { useState } from 'react';
import type { Institution, DDPairRollup } from '@/types/dd-checker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BankSelect } from './BankSelect';
import { DDResultCard } from './DDResultCard';

export function DDLookupTool({
  institutions,
  trackedBanks,
  rollups,
}: {
  institutions: Institution[];
  trackedBanks: Institution[];
  rollups: DDPairRollup[];
}) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState<DDPairRollup | null>(null);
  const [checked, setChecked] = useState(false);

  function handleCheck() {
    if (!source || !destination) return;
    const rollup = rollups.find(
      r => r.sourceInstitutionSlug === source && r.destinationBankSlug === destination
    );
    setResult(rollup ?? {
      sourceInstitutionSlug: source,
      destinationBankSlug: destination,
      verdict: 'not-enough-data',
      confidenceLevel: 'insufficient',
      confidenceScore: 0,
      approvedEvidenceCount: 0,
      distinctClusterCount: 0,
      latestObservedOn: null,
      updatedAt: new Date().toISOString(),
    });
    setChecked(true);
  }

  const sourceInst = institutions.find(i => i.slug === source);
  const destInst = trackedBanks.find(i => i.slug === destination);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <BankSelect
            institutions={institutions}
            value={source}
            onChange={v => { setSource(v); setChecked(false); }}
            placeholder="Select source..."
            label="Pushing FROM (source)"
          />
          <div className="hidden md:flex items-center justify-center text-text-tertiary pb-1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div className="flex justify-center md:hidden text-text-tertiary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5 5m0 0l5-5m-5 5V6" />
            </svg>
          </div>
          <BankSelect
            institutions={trackedBanks}
            value={destination}
            onChange={v => { setDestination(v); setChecked(false); }}
            placeholder="Select destination..."
            label="Depositing INTO (destination)"
          />
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheck}
            className={!source || !destination ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Check Compatibility
          </Button>
        </div>
      </Card>

      {checked && result && sourceInst && destInst && (
        <DDResultCard rollup={result} source={sourceInst} destination={destInst} />
      )}
    </div>
  );
}
