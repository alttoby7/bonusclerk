export function ArticleJsonLd({
  title,
  description,
  publishedAt,
  updatedAt,
  author,
}: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author?: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Organization',
      name: author ?? 'BonusClerk',
      url: 'https://bonusclerk.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BonusClerk',
      url: 'https://bonusclerk.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
