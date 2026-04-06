import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from './Breadcrumbs';
import { ArticleTOC } from './ArticleTOC';
import { RelatedArticles } from './RelatedLinks';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { Button } from '@/components/ui/Button';
import type { ArticleMeta, TocEntry, ArticleEntry } from '@/types/article';
import type { BankBonus } from '@/types/bonus';
import { BonusCard } from '@/components/bonus/BonusCard';

interface ArticleLayoutProps {
  meta: ArticleMeta;
  pillarTitle: string;
  pillarSlug: string;
  toc: TocEntry[];
  featuredBonuses?: BankBonus[];
  relatedArticles?: ArticleEntry[];
  children: React.ReactNode;
}

export function ArticleLayout({
  meta,
  pillarTitle,
  pillarSlug,
  toc,
  featuredBonuses = [],
  relatedArticles = [],
  children,
}: ArticleLayoutProps) {
  const breadcrumbs = [
    { label: pillarTitle, href: `/${pillarSlug}` },
    { label: meta.title },
  ];

  const jsonLdBreadcrumbs = [
    { name: 'Home', url: 'https://bonusclerk.com' },
    { name: pillarTitle, url: `https://bonusclerk.com/${pillarSlug}` },
    { name: meta.title, url: `https://bonusclerk.com/${pillarSlug}/${meta.title}` },
  ];

  return (
    <>
      <ArticleJsonLd
        title={meta.title}
        description={meta.description}
        publishedAt={meta.publishedAt}
        updatedAt={meta.updatedAt}
        author={meta.author}
      />
      <BreadcrumbJsonLd items={jsonLdBreadcrumbs} />

      <Container className="py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-10">
          {/* Main content */}
          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold text-text-primary font-[var(--font-display)] md:text-4xl leading-tight">
                {meta.title}
              </h1>
              <p className="mt-3 text-lg text-text-secondary">{meta.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-tertiary">
                <time dateTime={meta.updatedAt}>
                  Updated {new Date(meta.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
                {meta.verifiedAt && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Verified {new Date(meta.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </header>

            <div className="prose">{children}</div>

            {/* Featured bonuses below article */}
            {featuredBonuses.length > 0 && (
              <section className="mt-10 border-t border-border pt-8">
                <h2 className="text-xl font-bold text-text-primary mb-4">Featured Bonuses</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredBonuses.map(bonus => (
                    <BonusCard key={bonus.id} bonus={bonus} />
                  ))}
                </div>
              </section>
            )}

            <RelatedArticles articles={relatedArticles} />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <ArticleTOC items={toc} />

              {/* DD Checker CTA */}
              <div className="rounded-xl border border-border bg-accent-dim p-4">
                <h4 className="font-semibold text-text-primary text-sm">DD Compatibility Checker</h4>
                <p className="mt-1 text-xs text-text-secondary">
                  Does your ACH push count as a direct deposit? Check before you transfer.
                </p>
                <div className="mt-3">
                  <Button href="/dd-checker" size="sm">Check Now →</Button>
                </div>
              </div>

              {/* Sidebar featured bonus */}
              {featuredBonuses.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Top Bonus
                  </h4>
                  <BonusCard bonus={featuredBonuses[0]} compact />
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
