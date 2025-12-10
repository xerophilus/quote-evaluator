import { Metadata } from 'next';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import { projectsData } from '@/lib/projectData';

const project = projectsData['bathroom-renovation'];

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
        url: '/og-bathroom-renovation.jpg',
        width: 1200,
        height: 630,
        alt: 'Bathroom Renovation Quote Checker - Verify Fair Pricing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: project.pageTitle,
    description: project.metaDescription,
    images: ['/og-bathroom-renovation.jpg'],
  },
  alternates: {
    canonical: `https://quoteevaluator.com/${project.slug}`,
  },
};

export default function BathroomRenovationPage() {
  return <ProjectLandingPage project={project} />;
}