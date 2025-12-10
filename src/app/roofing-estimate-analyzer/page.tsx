import { Metadata } from 'next';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import { projectsData } from '@/lib/projectData';

const project = projectsData['roofing-estimate'];

export const metadata: Metadata = {
  title: project.pageTitle,
  description: project.metaDescription,
  keywords: project.keywords.join(', '),
  openGraph: {
    title: project.pageTitle,
    description: project.metaDescription,
    url: `https://quoteevaluator.com/${project.slug}`,
    siteName: 'QuoteEvaluator',
    images: [
      {
        url: '/og-roofing-estimate.jpg',
        width: 1200,
        height: 630,
        alt: 'Roofing Estimate Analyzer - Check for Inflated Costs',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: project.pageTitle,
    description: project.metaDescription,
    images: ['/og-roofing-estimate.jpg'],
  },
  alternates: {
    canonical: `https://quoteevaluator.com/${project.slug}`,
  },
};

export default function RoofingEstimatePage() {
  return <ProjectLandingPage project={project} />;
}