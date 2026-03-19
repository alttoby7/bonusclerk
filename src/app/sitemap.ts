import type { MetadataRoute } from 'next';
import { pillars } from '@/data/pillars';
import { getTrackedBanks } from '@/lib/dd/repository';
import { allBonuses } from '@/data/bonuses';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bonusclerk.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/bonuses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/dd-checker`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/dd-checker/matrix`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.1 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.1 },
  ];

  const pillarPages: MetadataRoute.Sitemap = pillars.map(pillar => ({
    url: `${baseUrl}/${pillar.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const ddBankPages: MetadataRoute.Sitemap = getTrackedBanks().map(bank => ({
    url: `${baseUrl}/dd-checker/${bank.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const ddBonusMissionPages: MetadataRoute.Sitemap = allBonuses
    .filter(b => b.isActive && b.requirements.directDeposit)
    .map(b => ({
      url: `${baseUrl}/dd-checker/bonus/${b.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...pillarPages, ...ddBankPages, ...ddBonusMissionPages];
}
