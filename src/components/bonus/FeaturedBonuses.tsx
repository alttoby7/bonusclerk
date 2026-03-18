import type { BankBonus } from '@/types/bonus';
import { BonusCard } from './BonusCard';

export function FeaturedBonuses({ bonuses, title = 'Top Bonuses This Week' }: { bonuses: BankBonus[]; title?: string }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <a href="/bonuses" className="text-sm font-medium text-accent hover:text-accent-hover">
          See All →
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {bonuses.map(bonus => (
          <div key={bonus.id} className="snap-start shrink-0 w-[320px]">
            <BonusCard bonus={bonus} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
