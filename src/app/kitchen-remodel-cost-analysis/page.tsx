import { Metadata } from 'next';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import { projectsData } from '@/lib/projectData';

const project = projectsData['kitchen-remodel'];

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
        url: '/og-kitchen-remodel.jpg',
        width: 1200,
        height: 630,
        alt: 'Kitchen Remodel Cost Analysis - Check for Overcharges',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: project.pageTitle,
    description: project.metaDescription,
    images: ['/og-kitchen-remodel.jpg'],
  },
  alternates: {
    canonical: `https://quoteevaluator.com/${project.slug}`,
  },
};

export default function KitchenRemodelPage() {
  return <ProjectLandingPage project={project} />;
}