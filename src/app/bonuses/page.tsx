import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { allBonuses, sortBonuses } from '@/data/bonuses';
import { formatMoney, expirationLabel } from '@/lib/dates';
import { formatBonusApr, getScreeningLabel, getOpeningMethodLabel } from '@/lib/bonus-metrics';

export const metadata: Metadata = {
  title: 'All Bank Bonuses — Current Offers & Promotions',
  description:
    'Complete list of bank account bonuses available right now. Filter by bank, account type, and bonus value. Updated weekly.',
};

export default function BonusesPage() {
  const bonuses = sortBonuses(allBonuses, 'bonusAmount', 'desc');

  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary font-[var(--font-display)]">
          All Bank Bonuses
        </h1>
        <p className="mt-2 text-text-secondary">
          {bonuses.filter(b => b.isActive).length} active offers tracked. Updated weekly with verified requirements and expiration dates.
        </p>
      </div>

      <div className="space-y-3">
        {bonuses.map(bonus => {
          const expiry = expirationLabel(bonus.expirationDate);
          const apr = formatBonusApr(bonus);
          const screeningAgencies = getScreeningLabel(bonus);
          const openMethod = getOpeningMethodLabel(bonus);

          return (
            <Card key={bonus.id} id={bonus.id} padding="sm" className={`transition-colors hover:border-border-hover ${!bonus.isActive ? 'opacity-60' : ''}`}>
              {/* Row 1: Core financial data */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Bank + Type */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="font-semibold text-text-primary">{bonus.bank}</span>
                  <Badge variant={bonus.accountType === 'checking' ? 'default' : 'ongoing'}>
                    {bonus.accountType}
                  </Badge>
                </div>

                {/* Bonus amount */}
                <div className="min-w-[70px]">
                  {bonus.bonusAmount > 0 ? (
                    <span className="font-money text-lg font-bold text-success">{formatMoney(bonus.bonusAmount)}</span>
                  ) : (
                    <span className="text-text-tertiary text-sm">No bonus</span>
                  )}
                </div>

                {/* Bonus APR */}
                <div className="min-w-[80px]">
                  {apr !== '—' ? (
                    <span className="font-money font-medium text-success">{apr} <span className="text-xs text-text-tertiary font-normal">APR</span></span>
                  ) : bonus.apy ? (
                    <span className="font-money font-medium text-accent">{bonus.apy}% <span className="text-xs text-text-tertiary font-normal">APY</span></span>
                  ) : (
                    <span className="text-text-tertiary text-sm">—</span>
                  )}
                </div>

                {/* Requirement (hidden on tiny screens) */}
                <div className="hidden sm:block text-sm text-text-secondary flex-1 min-w-[160px]">
                  {getRequirementText(bonus)}
                </div>

                {/* Status */}
                <div className="ml-auto">
                  {!bonus.isActive ? (
                    <Badge variant="expired">Closed</Badge>
                  ) : (
                    <Badge variant={expiry.status}>{expiry.text}</Badge>
                  )}
                </div>
              </div>

              {/* Row 2: Details — always visible */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-tertiary">
                {/* Chex sensitivity */}
                {bonus.screening && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-text-secondary">Chex:</span>
                    {bonus.screening.chexSensitive ? (
                      <span className="text-danger font-medium">Sensitive</span>
                    ) : (
                      <span className="text-success font-medium">Not Sensitive</span>
                    )}
                  </span>
                )}

                {/* Screening agencies */}
                {screeningAgencies !== '—' && (
                  <span>
                    <span className="font-medium text-text-secondary">Screening:</span> {screeningAgencies}
                  </span>
                )}
                {screeningAgencies === '—' && bonus.screening && (
                  <span>
                    <span className="font-medium text-text-secondary">Screening:</span> None reported
                  </span>
                )}

                {/* Opening method */}
                {bonus.openingMethod && (
                  <span>
                    <span className="font-medium text-text-secondary">Open:</span> {openMethod}
                  </span>
                )}

                {/* Fee */}
                <span>
                  <span className="font-medium text-text-secondary">Fee:</span>{' '}
                  {bonus.fees.monthly > 0
                    ? `${formatMoney(bonus.fees.monthly)}/mo${bonus.fees.waivable ? ' (waivable)' : ''}`
                    : 'Free'}
                </span>

                {/* Keep open */}
                {bonus.keepOpenMonths > 0 && (
                  <span>
                    <span className="font-medium text-text-secondary">Keep Open:</span> {bonus.keepOpenMonths} months
                  </span>
                )}
              </div>

              {/* Mobile: show requirement */}
              <div className="sm:hidden mt-1 text-xs text-text-tertiary">
                {getRequirementText(bonus)}
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}

function getRequirementText(bonus: typeof allBonuses[number]): string {
  const parts: string[] = [];
  if (bonus.requirements.directDeposit) {
    parts.push(`${formatMoney(bonus.requirements.directDeposit.amount)} DD ${bonus.requirements.directDeposit.frequency}`);
  }
  if (bonus.requirements.minimumBalance) {
    parts.push(`${formatMoney(bonus.requirements.minimumBalance)} balance`);
  }
  if (bonus.requirements.debitTransactions) {
    parts.push(`${bonus.requirements.debitTransactions} debit txns`);
  }
  if (bonus.requirements.other) {
    parts.push(bonus.requirements.other);
  }
  return parts.join(' · ') || 'None';
}
