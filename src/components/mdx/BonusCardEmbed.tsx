import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface BonusCardEmbedProps {
  bank: string;
  bonus: string;
  requirement: string;
  bonusId?: string;
  ddBank?: string;
  expiry?: string;
}

export function BonusCardEmbed({ bank, bonus, requirement, bonusId, ddBank, expiry }: BonusCardEmbedProps) {
  return (
    <Card className="my-6 not-prose">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-text-primary">{bank}</h4>
          <p className="mt-1 text-sm text-text-tertiary">{requirement}</p>
          {expiry && (
            <Badge variant="expiring">{expiry}</Badge>
          )}
        </div>
        <span className="font-money text-2xl font-bold text-success shrink-0">{bonus}</span>
      </div>
      <div className="mt-3 flex gap-3 text-sm">
        {bonusId && (
          <Link href={`/bonuses#${bonusId}`} className="font-medium text-accent hover:text-accent-hover">
            View Details →
          </Link>
        )}
        {ddBank && (
          <Link href={`/dd-checker/${ddBank}`} className="font-medium text-accent hover:text-accent-hover">
            Check DD →
          </Link>
        )}
      </div>
    </Card>
  );
}
