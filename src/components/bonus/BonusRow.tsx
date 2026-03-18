import type { BankBonus } from '@/types/bonus';
import { Badge } from '@/components/ui/Badge';
import { formatMoney, expirationLabel } from '@/lib/dates';

export function BonusRow({ bonus }: { bonus: BankBonus }) {
  const expiry = expirationLabel(bonus.expirationDate);
  const requirement = getRequirementLine(bonus);

  return (
    <tr className="border-b border-border transition-colors hover:bg-surface-raised">
      <td className="py-3 px-4">
        <div className="font-medium text-text-primary">{bonus.bank}</div>
      </td>
      <td className="py-3 px-4">
        <Badge>{bonus.accountType}</Badge>
      </td>
      <td className="py-3 px-4">
        {bonus.bonusAmount > 0 ? (
          <span className="font-money font-bold text-success">{formatMoney(bonus.bonusAmount)}</span>
        ) : bonus.apy ? (
          <span className="font-money font-bold text-accent">{bonus.apy}% APY</span>
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </td>
      <td className="hidden py-3 px-4 text-sm text-text-secondary md:table-cell">
        {requirement}
      </td>
      <td className="py-3 px-4">
        <Badge variant={expiry.status}>{expiry.text}</Badge>
      </td>
    </tr>
  );
}

function getRequirementLine(bonus: BankBonus): string {
  if (bonus.requirements.directDeposit) {
    return `${formatMoney(bonus.requirements.directDeposit.amount)} direct deposit`;
  }
  if (bonus.requirements.minimumBalance) {
    return `${formatMoney(bonus.requirements.minimumBalance)} balance`;
  }
  if (bonus.requirements.other) {
    return bonus.requirements.other;
  }
  return 'No requirements';
}
