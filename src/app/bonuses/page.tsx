import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { allBonuses, sortBonuses } from '@/data/bonuses';
import { formatMoney, expirationLabel } from '@/lib/dates';

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
          {bonuses.length} offers tracked. Updated weekly with verified requirements and expiration dates.
        </p>
      </div>

      <Card padding="sm" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-surface-raised text-left">
                <th className="py-3 px-4 font-semibold text-text-primary">Bank</th>
                <th className="py-3 px-4 font-semibold text-text-primary">Type</th>
                <th className="py-3 px-4 font-semibold text-text-primary">Bonus</th>
                <th className="py-3 px-4 font-semibold text-text-primary">APY</th>
                <th className="hidden py-3 px-4 font-semibold text-text-primary md:table-cell">Requirement</th>
                <th className="hidden py-3 px-4 font-semibold text-text-primary lg:table-cell">Monthly Fee</th>
                <th className="hidden py-3 px-4 font-semibold text-text-primary md:table-cell">Keep Open</th>
                <th className="py-3 px-4 font-semibold text-text-primary">Status</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.map(bonus => {
                const expiry = expirationLabel(bonus.expirationDate);
                return (
                  <tr key={bonus.id} id={bonus.id} className="border-b border-border transition-colors hover:bg-surface-raised">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-primary">{bonus.bank}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge>{bonus.accountType}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {bonus.bonusAmount > 0 ? (
                        <span className="font-money font-bold text-success">{formatMoney(bonus.bonusAmount)}</span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {bonus.apy ? (
                        <span className="font-money font-medium text-accent">{bonus.apy}%</span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="hidden py-3 px-4 text-sm text-text-secondary md:table-cell max-w-[200px]">
                      {getRequirementText(bonus)}
                    </td>
                    <td className="hidden py-3 px-4 text-sm lg:table-cell">
                      {bonus.fees.monthly > 0 ? (
                        <div>
                          <span className="text-text-secondary">{formatMoney(bonus.fees.monthly)}/mo</span>
                          {bonus.fees.waivable && (
                            <div className="text-xs text-text-tertiary">Waivable</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-success font-medium">Free</span>
                      )}
                    </td>
                    <td className="hidden py-3 px-4 text-sm text-text-secondary md:table-cell">
                      {bonus.keepOpenMonths > 0 ? `${bonus.keepOpenMonths} months` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={expiry.status}>{expiry.text}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}

function getRequirementText(bonus: typeof allBonuses[number]): string {
  const parts: string[] = [];
  if (bonus.requirements.directDeposit) {
    parts.push(`${formatMoney(bonus.requirements.directDeposit.amount)} DD`);
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
  return parts.join(', ') || 'None';
}
