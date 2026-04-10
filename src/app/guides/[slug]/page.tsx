import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getGuide, getAllGuides, allGuideSlugs, type Guide } from '@/lib/guidesData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `https://quoteevaluator.com/guides/${guide.slug}`,
      siteName: 'QuoteEvaluator',
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
    alternates: {
      canonical: `https://quoteevaluator.com/guides/${guide.slug}`,
    },
  };
}

function FAQSchema({ guide }: { guide: Guide }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function ArticleSchema({ guide }: { guide: Guide }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    dateModified: guide.lastUpdated,
    datePublished: guide.lastUpdated,
    author: {
      '@type': 'Organization',
      name: 'QuoteEvaluator',
      url: 'https://quoteevaluator.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuoteEvaluator',
      url: 'https://quoteevaluator.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const allGuides = getAllGuides();
  const relatedGuides = guide.relatedGuides
    .map((s) => allGuides.find((g) => g.slug === s))
    .filter(Boolean) as Guide[];

  return (
    <>
      <FAQSchema guide={guide} />
      <ArticleSchema guide={guide} />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-blue-600">Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{guide.title.split(':')[0]}</span>
          </nav>
        </div>

        {/* Hero */}
        <header className="max-w-3xl mx-auto px-4 pt-8 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {guide.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            {guide.heroDescription}
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Last updated: {new Date(guide.lastUpdated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </header>

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 pb-12">
          <div className="prose prose-lg prose-blue max-w-none">
            {guide.sections.map((section, i) => {
              const Tag = section.level === 2 ? 'h2' : 'h3';
              return (
                <section key={i}>
                  <Tag className={
                    section.level === 2
                      ? 'text-2xl font-bold text-gray-900 mt-10 mb-4'
                      : 'text-xl font-semibold text-gray-800 mt-6 mb-3'
                  }>
                    {section.heading}
                  </Tag>
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </section>
              );
            })}
          </div>

          {/* FAQ Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {guide.faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedGuides.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/guides/${related.slug}`}
                    className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {related.title.split(':')[0]}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {related.metaDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-16 bg-blue-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Got a quote? Let us analyze it for free.
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Upload your contractor quote and our AI will break down every line item,
              flag potential overcharges, and tell you if the pricing is fair for your area.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg"
            >
              Upload Your Quote — It&apos;s Free
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
