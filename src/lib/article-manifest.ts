import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { ArticleEntry, ArticleMeta } from '@/types/article';

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles');

function parseArticleFile(filePath: string, pillar: string, slug: string): ArticleEntry | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);
    return {
      slug,
      pillar,
      meta: data as ArticleMeta,
      filePath,
    };
  } catch {
    return null;
  }
}

export function getAllArticles(): ArticleEntry[] {
  const articles: ArticleEntry[] = [];

  if (!fs.existsSync(ARTICLES_DIR)) return articles;

  const pillarDirs = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true });

  for (const dir of pillarDirs) {
    if (!dir.isDirectory()) continue;
    const pillar = dir.name;
    const pillarPath = path.join(ARTICLES_DIR, pillar);
    const files = fs.readdirSync(pillarPath);

    for (const file of files) {
      if (!file.endsWith('.mdx')) continue;
      const slug = file.replace(/\.mdx$/, '');
      const entry = parseArticleFile(path.join(pillarPath, file), pillar, slug);
      if (entry) articles.push(entry);
    }
  }

  return articles.sort(
    (a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime()
  );
}

export function getArticle(pillar: string, slug: string): { entry: ArticleEntry; content: string } | null {
  const filePath = path.join(ARTICLES_DIR, pillar, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    entry: {
      slug,
      pillar,
      meta: data as ArticleMeta,
      filePath,
    },
    content,
  };
}

export function getArticlesByPillar(pillar: string): ArticleEntry[] {
  return getAllArticles().filter(a => a.pillar === pillar);
}

export function getRecentArticles(limit = 6): ArticleEntry[] {
  return getAllArticles().slice(0, limit);
}
