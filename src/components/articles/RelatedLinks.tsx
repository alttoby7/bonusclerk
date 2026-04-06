import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { ArticleEntry } from '@/types/article';

export function RelatedArticles({ articles }: { articles: ArticleEntry[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-bold text-text-primary mb-4">Related Guides</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {articles.map(a => (
          <Link key={`${a.pillar}/${a.slug}`} href={`/${a.pillar}/${a.slug}`}>
            <Card hover padding="sm">
              <h3 className="font-medium text-text-primary text-sm">{a.meta.title}</h3>
              <p className="mt-1 text-xs text-text-tertiary line-clamp-2">{a.meta.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
