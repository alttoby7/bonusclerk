import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BonusCard } from '@/components/bonus/BonusCard';
import { getAllPillars, getPillar } from '@/lib/content-repository';
import { getAllBonuses, sortBonuses } from '@/lib/bonus-repository';
import { getArticlesByPillar } from '@/lib/article-manifest';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const pillars = await getAllPillars();
    return pillars.map(p => ({ pillar: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar: slug } = await params;
  const pillar = await getPillar(slug);
  if (!pillar) return {};

  return {
    title: pillar.title,
    description: pillar.description,
  };
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: slug } = await params;
  const pillar = await getPillar(slug);
  if (!pillar) notFound();

  // Get bonuses related to this pillar's banks
  const allBonuses = await getAllBonuses();
  const pillarBonuses = getPillarBonuses(slug, allBonuses);
  const topBonuses = sortBonuses(pillarBonuses.filter(b => b.bonusAmount > 0), 'bonusAmount', 'desc').slice(0, 4);
  const articles = getArticlesByPillar(slug);

  return (
    <Container className="py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-text-tertiary">
        <a href="/" className="hover:text-accent">Home</a>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{pillar.title}</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <div className="text-4xl mb-3">{pillar.icon}</div>
        <h1 className="text-3xl font-extrabold text-text-primary font-[var(--font-display)] md:text-4xl">
          {pillar.title}
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl">
          {pillar.description}
        </p>
        <div className="mt-4 flex gap-6 text-sm text-text-tertiary">
          <span>{topBonuses.length} active bonuses</span>
          <span>{pillar.clusters.length} topics</span>
        </div>
      </div>

      {/* Top bonuses for this pillar */}
      {topBonuses.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-4">Top Bonuses</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {topBonuses.map(bonus => (
              <BonusCard key={bonus.id} bonus={bonus} />
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-4">Guides &amp; Articles</h2>
          <div className="grid gap-3">
            {articles.map(a => (
              <Link key={a.slug} href={`/${a.pillar}/${a.slug}`}>
                <Card hover padding="sm">
                  <h3 className="font-medium text-text-primary">{a.meta.title}</h3>
                  <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                    {a.meta.description}
                  </p>
                  <div className="mt-2 text-xs text-text-tertiary">
                    Updated {new Date(a.meta.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Topics */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text-primary mb-4">Topics in This Guide</h2>
        <div className="grid gap-3">
          {pillar.clusters.map(clusterSlug => (
            <Card key={clusterSlug} hover padding="sm">
              <h3 className="font-medium text-text-primary capitalize">
                {clusterSlug.replace(/-/g, ' ')}
              </h3>
              <p className="text-sm text-text-tertiary mt-1">
                Guides and reviews for {clusterSlug.replace(/-/g, ' ')}.
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-xl border border-border bg-accent-dim p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary">Ready to start earning bonuses?</h2>
        <p className="mt-2 text-text-secondary">Browse all current offers and find the best bonuses for you.</p>
        <div className="mt-4">
          <Button href="/bonuses">View All Bonuses</Button>
        </div>
      </div>
    </Container>
  );
}

function getPillarBonuses(pillarSlug: string, allBonuses: import('@/types/bonus').BankBonus[]) {
  const bankMappings: Record<string, string[]> = {
    'bank-account-bonuses': ['chase', 'wells-fargo', 'capital-one', 'citi', 'us-bank', 'pnc'],
    'chase-bank-bonuses': ['chase'],
    'major-bank-bonuses': ['wells-fargo', 'capital-one', 'citi', 'pnc', 'us-bank', 'td-bank', 'bank-of-america'],
    'high-yield-savings': ['amex', 'discover', 'capital-one', 'bmo', 'pnc', 'sofi'],
    'online-bank-bonuses': ['chime', 'sofi', 'bmo', 'huntington'],
    'bank-bonus-churning': [],
    'bank-reviews': [],
  };
  const bankSlugs = bankMappings[pillarSlug] || [];
  return allBonuses.filter(b => bankSlugs.includes(b.bankSlug));
}
