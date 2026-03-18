import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { DDMatrix } from '@/components/dd-checker/DDMatrix';
import {
  getAllInstitutions,
  getTrackedBanks,
  getAllRollups,
} from '@/lib/dd/repository';

export const metadata: Metadata = {
  title: 'DD Compatibility Matrix — All Banks | BonusClerk',
  description: 'Full direct deposit compatibility matrix showing which ACH pushes count as direct deposits at every tracked bank. Visual grid with community-verified data.',
};

export default function MatrixPage() {
  const allInstitutions = getAllInstitutions();
  const trackedBanks = getTrackedBanks();
  const rollups = getAllRollups();

  return (
    <Container size="wide">
      <div className="py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl mb-2">
            DD Compatibility Matrix
          </h1>
          <p className="text-text-secondary">
            Visual overview of which ACH transfers count as direct deposits across all tracked banks.
            Click any cell for details.
          </p>
        </div>

        <DDMatrix
          sources={allInstitutions}
          destinations={trackedBanks}
          rollups={rollups}
        />
      </div>
    </Container>
  );
}
