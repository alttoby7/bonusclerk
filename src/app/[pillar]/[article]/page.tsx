import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { getAllArticles, getArticle, getArticlesByPillar } from '@/lib/article-manifest';
import { getPillar } from '@/lib/content-repository';
import { getAllBonuses } from '@/lib/bonus-repository';
import { ArticleLayout } from '@/components/articles/ArticleLayout';
import { useMDXComponents } from '@/mdx-components';
import type { TocEntry } from '@/types/article';

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map(a => ({ pillar: a.pillar, article: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; article: string }>;
}): Promise<Metadata> {
  const { pillar, article: slug } = await params;
  const result = getArticle(pillar, slug);
  if (!result) return {};

  const { entry } = result;
  return {
    title: entry.meta.title,
    description: entry.meta.description,
    openGraph: {
      title: entry.meta.title,
      description: entry.meta.description,
      type: 'article',
      publishedTime: entry.meta.publishedAt,
      modifiedTime: entry.meta.updatedAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ pillar: string; article: string }>;
}) {
  const { pillar: pillarSlug, article: slug } = await params;
  const result = getArticle(pillarSlug, slug);
  if (!result) notFound();

  const { entry, content } = result;

  // Compile and run MDX
  const compiled = await compile(content, { outputFormat: 'function-body' });
  const { default: MDXContent } = await run(String(compiled), {
    ...runtime,
    baseUrl: import.meta.url,
  });

  // Extract TOC from content
  const toc = extractToc(content);

  // Get pillar info
  const pillar = await getPillar(pillarSlug);
  const pillarTitle = pillar?.title ?? pillarSlug.replace(/-/g, ' ');

  // Get featured bonuses
  const allBonuses = await getAllBonuses();
  const featuredBonuses = entry.meta.featuredBonusIds
    ? allBonuses.filter(b => entry.meta.featuredBonusIds!.includes(b.id))
    : [];

  // Get related articles from same pillar
  const relatedArticles = getArticlesByPillar(pillarSlug)
    .filter(a => a.slug !== slug)
    .slice(0, 4);

  const components = useMDXComponents({});

  return (
    <ArticleLayout
      meta={entry.meta}
      pillarTitle={pillarTitle}
      pillarSlug={pillarSlug}
      toc={toc}
      featuredBonuses={featuredBonuses}
      relatedArticles={relatedArticles}
    >
      <MDXContent components={components} />
    </ArticleLayout>
  );
}

function extractToc(mdxContent: string): TocEntry[] {
  const lines = mdxContent.split('\n');
  const toc: TocEntry[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      toc.push({ id, text, level });
    }
  }

  return toc;
}
