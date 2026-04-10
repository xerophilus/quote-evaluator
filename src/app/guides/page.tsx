import { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guidesData';

export const metadata: Metadata = {
  title: 'Home Improvement Cost Guides | QuoteEvaluator',
  description: 'Expert guides on home improvement costs, contractor quotes, and red flags. Real pricing data for kitchens, bathrooms, roofing, HVAC, decks, and more.',
  openGraph: {
    title: 'Home Improvement Cost Guides | QuoteEvaluator',
    description: 'Expert guides on home improvement costs, contractor quotes, and red flags. Real pricing data for kitchens, bathrooms, roofing, HVAC, decks, and more.',
    url: 'https://quoteevaluator.com/guides',
    siteName: 'QuoteEvaluator',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://quoteevaluator.com/guides',
  },
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Home Improvement Cost Guides
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Real cost data and expert advice for every major home improvement project.
          Written by people who review contractor quotes for a living.
        </p>
      </header>

      {/* Guides Grid */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block border border-gray-200 rounded-xl p-6 bg-white hover:border-blue-300 hover:shadow-lg transition-all group"
            >
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                {guide.metaDescription}
              </p>
              <span className="inline-block mt-4 text-sm font-medium text-blue-600 group-hover:underline">
                Read guide →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Already have a quote? Let us check it.
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Upload your contractor quote and our AI will analyze every line item,
            flag red flags, and tell you if the pricing is fair.
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg"
          >
            Upload Your Quote — It&apos;s Free
          </Link>
        </div>
      </section>
    </main>
  );
}
