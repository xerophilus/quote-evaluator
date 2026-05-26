import { MetadataRoute } from 'next';
import { allGuideSlugs } from '@/lib/guidesData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://quoteevaluator.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kitchen-remodel-cost-analysis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/roofing-estimate-analyzer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bathroom-renovation-quote-checker`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const guidePages: MetadataRoute.Sitemap = allGuideSlugs.map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified: new Date('2025-12-15'),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...guidePages];
}
