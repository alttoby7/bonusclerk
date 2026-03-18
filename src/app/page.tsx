import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeaturedBonuses } from '@/components/bonus/FeaturedBonuses';
import { BonusRow } from '@/components/bonus/BonusRow';
import { allBonuses, getActiveBonuses, getTotalBonusValue, sortBonuses } from '@/data/bonuses';
import { pillars } from '@/data/pillars';
import { formatMoney } from '@/lib/dates';

export default function HomePage() {
  const activeBonuses = getActiveBonuses();
  const topBonuses = sortBonuses(activeBonuses.filter(b => b.bonusAmount > 0), 'bonusAmount', 'desc').slice(0, 6);
  const tableBonuses = sortBonuses(activeBonuses.filter(b => b.bonusAmount > 0), 'bonusAmount', 'desc').slice(0, 10);
  const totalValue = getTotalBonusValue();

  return (
    <>
      {/* Hero */}
      <section className="bg-surface border-b border-border">
        <Container className="py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl lg:text-6xl font-[var(--font-display)]">
              Track Every Bank Bonus
              <span className="text-accent"> Worth Your Time</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary md:text-xl leading-relaxed">
              BonusClerk monitors {allBonuses.length}+ bank account bonuses so you never miss a deadline.
              See what&apos;s live right now.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/bonuses" size="lg">
                Browse All Bonuses
              </Button>
              <Button href="/bank-bonus-churning" variant="outline" size="lg">
                Churning Guide
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-3 gap-4 rounded-xl border border-border bg-surface-raised p-4 md:p-6">
            <div className="text-center">
              <div className="font-money text-2xl font-bold text-text-primary md:text-3xl">
                {activeBonuses.length}
              </div>
              <div className="mt-1 text-xs text-text-tertiary md:text-sm">Active Bonuses</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="font-money text-2xl font-bold text-success md:text-3xl">
                {formatMoney(totalValue)}
              </div>
              <div className="mt-1 text-xs text-text-tertiary md:text-sm">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary md:text-3xl">
                Weekly
              </div>
              <div className="mt-1 text-xs text-text-tertiary md:text-sm">Data Updates</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Bonuses */}
      <section className="py-12">
        <Container>
          <FeaturedBonuses bonuses={topBonuses} />
        </Container>
      </section>

      {/* Bonus Table Preview */}
      <section className="py-8">
        <Container>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Highest Value Bonuses</h2>
            <a href="/bonuses" className="text-sm font-medium text-accent hover:text-accent-hover">
              View All →
            </a>
          </div>
          <Card padding="sm" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border bg-surface-raised text-left">
                    <th className="py-3 px-4 font-semibold text-text-primary">Bank</th>
                    <th className="py-3 px-4 font-semibold text-text-primary">Type</th>
                    <th className="py-3 px-4 font-semibold text-text-primary">Bonus</th>
                    <th className="hidden py-3 px-4 font-semibold text-text-primary md:table-cell">Requirement</th>
                    <th className="py-3 px-4 font-semibold text-text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableBonuses.map(bonus => (
                    <BonusRow key={bonus.id} bonus={bonus} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </section>

      {/* Pillar Navigation */}
      <section className="py-12 bg-surface border-y border-border">
        <Container>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Explore by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(pillar => (
              <a
                key={pillar.slug}
                href={`/${pillar.slug}`}
                className="group rounded-xl border border-border bg-surface-raised p-5 transition-all hover:shadow-md hover:border-accent/30"
              >
                <div className="text-2xl mb-2">{pillar.icon}</div>
                <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-sm text-text-tertiary line-clamp-2">
                  {pillar.description}
                </p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">
            How BonusClerk Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Find a Bonus',
                description: `Browse ${activeBonuses.length}+ verified offers filtered by bank, account type, and bonus value.`,
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Check Requirements',
                description: 'See exactly what direct deposit, minimum balance, or transactions are needed to earn the bonus.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Track Your Progress',
                description: 'Never miss a payout window or early termination deadline with our bonus tracker.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-dim text-accent">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust section */}
      <section className="border-t border-border bg-surface-raised py-8">
        <Container>
          <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:gap-10">
            {[
              'Data verified weekly',
              'No credit card offers',
              'Independent, not bank-sponsored',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-text-tertiary">
                <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
