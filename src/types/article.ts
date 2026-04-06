export interface ArticleMeta {
  title: string;
  description: string;
  pillar: string;
  cluster?: string;
  contentType: 'review' | 'guide' | 'listicle' | 'how-to' | 'comparison' | 'tool' | 'service-page';
  publishedAt: string;
  updatedAt: string;
  verifiedAt?: string;
  author?: string;
  featuredBonusIds?: string[];
  seoKeywords?: string[];
  toc?: TocEntry[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ArticleEntry {
  slug: string;
  pillar: string;
  meta: ArticleMeta;
  filePath: string;
}
