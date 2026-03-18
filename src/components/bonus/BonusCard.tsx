import type { BankBonus } from '@/types/bonus';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatMoney, expirationLabel } from '@/lib/dates';
import Link from 'next/link';

export function BonusCard({ bonus, compact = false }: { bonus: BankBonus; compact?: boolean }) {
  const expiry = expirationLabel(bonus.expirationDate);
  const requirementText = getRequirementSummary(bonus);

  return (
    <Card hover className={compact ? 'min-w-[280px]' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-text-primary">{bonus.bank}</h3>
            <Badge variant={bonus.accountType === 'checking' ? 'default' : 'ongoing'}>
              {bonus.accountType}
            </Badge>
          </div>
          {!compact && (
            <p className="mt-1 text-sm text-text-tertiary line-clamp-1">
              {bonus.bonusDescription}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {bonus.bonusAmount > 0 ? (
            <span className="font-money text-2xl font-bold text-success">
              {formatMoney(bonus.bonusAmount)}
            </span>
          ) : bonus.apy ? (
            <span className="font-money text-2xl font-bold text-accent">
              {bonus.apy}% <span className="text-sm font-normal text-text-tertiary">APY</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        {requirementText && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {requirementText}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {bonus.timeToBonus}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant={expiry.status}>{expiry.text}</Badge>
        <Link
          href={`/bonuses#${bonus.id}`}
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          View Details →
        </Link>
      </div>
    </Card>
  );
}

function getRequirementSummary(bonus: BankBonus): string {
  if (bonus.requirements.directDeposit) {
    return `${formatMoney(bonus.requirements.directDeposit.amount)} DD ${bonus.requirements.directDeposit.frequency}`;
  }
  if (bonus.requirements.minimumBalance) {
    return `${formatMoney(bonus.requirements.minimumBalance)} min balance`;
  }
  if (bonus.requirements.debitTransactions) {
    return `${bonus.requirements.debitTransactions} debit transactions`;
  }
  return '';
}

export function BonusCardCompact({ bonus }: { bonus: BankBonus }) {
  return <BonusCard bonus={bonus} compact />;
}
