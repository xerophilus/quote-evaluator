export interface ProjectData {
  slug: string;
  title: string;
  headline: string;
  subheadline: string;
  urgencyText: string;
  averageSavings: string;
  averageProject: string;
  keywords: string[];
  testimonials: Array<{
    name: string;
    location: string;
    amount: string;
    quote: string;
    details: string;
  }>;
  commonOvercharges: string[];
  redFlags: string[];
  costBreakdown: Array<{
    item: string;
    fairPrice: string;
    overchargePrice: string;
    savings: string;
  }>;
  metaDescription: string;
  pageTitle: string;
}

export const projectsData: Record<string, ProjectData> = {
  'kitchen-remodel': {
    slug: 'kitchen-remodel-cost-analysis',
    title: 'Kitchen Remodel Cost Analysis',
    headline: 'Kitchen Remodel Getting Expensive?',
    subheadline: 'Check for Overcharges Before You Sign',
    urgencyText: '⏰ Don\'t let contractors overcharge you on your dream kitchen',
    averageSavings: '$4,800',
    averageProject: '$35,000',
    keywords: ['kitchen remodel cost', 'kitchen renovation estimate', 'kitchen contractor quote', 'kitchen remodeling prices', 'kitchen cabinets cost', 'kitchen countertop prices'],
    testimonials: [
      {
        name: 'Sarah M.',
        location: 'Kitchen Remodel, Portland',
        amount: '$6,247',
        quote: 'Almost paid $47K for my kitchen remodel! The analysis revealed $6,247 in overcharges including inflated cabinet markup and unnecessary electrical work.',
        details: 'Saved on: Cabinet markup (40% overcharge), electrical permits, and countertop installation fees'
      },
      {
        name: 'Mike D.',
        location: 'Kitchen Renovation, Denver',
        amount: '$3,890',
        quote: 'Found hidden fees in my kitchen quote that would have cost me thousands. The contractor was charging premium prices for standard materials.',
        details: 'Discovered: Standard quartz marked up as premium, inflated plumbing costs, unnecessary demolition charges'
      },
      {
        name: 'Lisa K.',
        location: 'Kitchen Upgrade, Austin',
        amount: '$2,650',
        quote: 'The cost breakdown analysis helped me negotiate from $42K down to $39K. Contractor admitted the markup was too high.',
        details: 'Negotiated down: Appliance installation, tile work, and project management fees'
      }
    ],
    commonOvercharges: [
      'Cabinet markup of 50-100% (should be 20-30%)',
      'Countertop installation fees when included in material cost',
      'Electrical permits charged at 3x actual cost',
      'Appliance installation marked up 200-400%',
      'Demolition labor charged at premium carpentry rates',
      'Project management fees over 10% of total cost'
    ],
    redFlags: [
      'No itemized breakdown for cabinet costs',
      'Appliance installation bundled with unclear pricing',
      'Electrical work without permits or licenses',
      'Countertop template and installation as separate line items',
      'Demolition costs exceeding $150/hour labor rate',
      'Change order clauses allowing unlimited cost increases'
    ],
    costBreakdown: [
      { item: 'Custom Cabinets (Mid-range)', fairPrice: '$12,000-18,000', overchargePrice: '$25,000+', savings: '$7,000+' },
      { item: 'Quartz Countertops', fairPrice: '$2,800-4,200', overchargePrice: '$6,500+', savings: '$2,300+' },
      { item: 'Appliance Installation', fairPrice: '$800-1,200', overchargePrice: '$2,500+', savings: '$1,300+' },
      { item: 'Electrical Work', fairPrice: '$1,500-2,500', overchargePrice: '$4,000+', savings: '$1,500+' },
      { item: 'Flooring Installation', fairPrice: '$2,000-3,500', overchargePrice: '$5,500+', savings: '$2,000+' }
    ],
    metaDescription: 'Kitchen remodel getting expensive? Analyze your contractor quote for overcharges and hidden fees. Average savings: $4,800 on kitchen renovation estimates.',
    pageTitle: 'Kitchen Remodel Cost Analysis - Check for Overcharges | QuoteEvaluator'
  },

  'bathroom-renovation': {
    slug: 'bathroom-renovation-quote-checker',
    title: 'Bathroom Renovation Quote Checker',
    headline: 'Bathroom Renovation Costs Seem High?',
    subheadline: 'Verify Fair Pricing Before Construction Starts',
    urgencyText: '⏰ Bathroom contractors often overcharge - protect your investment',
    averageSavings: '$2,900',
    averageProject: '$18,000',
    keywords: ['bathroom renovation cost', 'bathroom remodel estimate', 'bathroom contractor quote', 'bathroom remodeling prices', 'bathroom tile cost', 'shower installation cost'],
    testimonials: [
      {
        name: 'Jennifer R.',
        location: 'Master Bath, Seattle',
        amount: '$4,100',
        quote: 'Bathroom renovation quote seemed steep at $22K. Analysis revealed massive overcharges on tile work and plumbing - saved over $4K!',
        details: 'Found: Tile markup at 300%, plumbing permits overcharged, unnecessary waterproofing extras'
      },
      {
        name: 'Tom H.',
        location: 'Guest Bath, Phoenix',
        amount: '$2,200',
        quote: 'Small bathroom, big quote! $16K seemed excessive for a 5x8 space. The analysis helped me spot inflated labor costs and material markups.',
        details: 'Reduced: Demolition costs, vanity markup, and excessive project timeline padding'
      },
      {
        name: 'Maria S.',
        location: 'Hall Bath, Miami',
        amount: '$3,400',
        quote: 'Contractor wanted $19K for basic bathroom update. Analysis showed I was being charged luxury prices for standard materials.',
        details: 'Exposed: Standard fixtures priced as luxury, inflated electrical work, unnecessary structural claims'
      }
    ],
    commonOvercharges: [
      'Tile markup of 200-400% (should be 30-50%)',
      'Plumbing permit fees inflated by 400%',
      'Demolition charged at skilled trade rates',
      'Vanity installation bundled with unclear costs',
      'Waterproofing marked up 150-300%',
      'Electrical work for simple outlet/fan installation'
    ],
    redFlags: [
      'No breakdown between tile material and installation',
      'Plumbing permits not itemized separately',
      'Demolition exceeding 1-2 days for standard bathroom',
      'Waterproofing required for simple updates',
      'Vanity costs not separated from installation',
      'Timeline padding beyond reasonable construction time'
    ],
    costBreakdown: [
      { item: 'Tile & Installation', fairPrice: '$3,500-5,500', overchargePrice: '$8,000+', savings: '$2,500+' },
      { item: 'Vanity & Installation', fairPrice: '$1,800-3,200', overchargePrice: '$5,000+', savings: '$1,800+' },
      { item: 'Shower/Tub Installation', fairPrice: '$2,200-3,800', overchargePrice: '$6,000+', savings: '$2,200+' },
      { item: 'Plumbing Work', fairPrice: '$1,200-2,000', overchargePrice: '$3,500+', savings: '$1,500+' },
      { item: 'Electrical & Ventilation', fairPrice: '$800-1,200', overchargePrice: '$2,200+', savings: '$1,000+' }
    ],
    metaDescription: 'Bathroom renovation quote too high? Check for contractor overcharges and hidden fees. Average savings: $2,900 on bathroom remodel estimates.',
    pageTitle: 'Bathroom Renovation Quote Checker - Avoid Overcharges | QuoteEvaluator'
  },

  'roofing-estimate': {
    slug: 'roofing-estimate-analyzer',
    title: 'Roofing Estimate Analyzer',
    headline: 'Roofing Estimate Seems Expensive?',
    subheadline: 'Check for Inflated Costs and Unnecessary Work',
    urgencyText: '⏰ Don\'t get taken advantage of - roofing scams are common',
    averageSavings: '$3,200',
    averageProject: '$15,000',
    keywords: ['roofing estimate', 'roof replacement cost', 'roofing contractor quote', 'roof repair cost', 'shingle installation cost', 'roofing material prices'],
    testimonials: [
      {
        name: 'David L.',
        location: 'Roof Replacement, Dallas',
        amount: '$5,800',
        quote: 'Roofer quoted $23K for complete replacement. Analysis showed they were charging for unnecessary structural work and premium shingles at luxury prices.',
        details: 'Avoided: Unnecessary decking replacement, inflated permit costs, premium shingle markup'
      },
      {
        name: 'Nancy P.',
        location: 'Roof Repair, Atlanta',
        amount: '$2,100',
        quote: 'What started as a leak repair turned into a $8K nightmare quote. The analysis revealed they were trying to upsell unnecessary work.',
        details: 'Prevented: Full gutter replacement, unnecessary chimney work, inflated emergency repair fees'
      },
      {
        name: 'Robert K.',
        location: 'New Roof, Chicago',
        amount: '$4,700',
        quote: 'Contractor insisted on $28K for roof replacement citing code issues. Analysis showed most code claims were false - saved thousands.',
        details: 'Exposed: False code compliance claims, unnecessary permit fees, inflated disposal costs'
      }
    ],
    commonOvercharges: [
      'Shingle markup of 150-300% (should be 25-40%)',
      'Unnecessary structural repair claims',
      'Inflated permit and disposal fees',
      'Emergency repair surcharges on standard work',
      'Gutter replacement bundled without justification',
      'Insurance claim padding and unnecessary work'
    ],
    redFlags: [
      'Door-to-door solicitation after storms',
      'Requires full payment before starting work',
      'Claims immediate structural danger without evidence',
      'Bundles gutter/chimney work without clear need',
      'No itemized breakdown of material vs labor',
      'Pressures to sign same day with "storm damage" claims'
    ],
    costBreakdown: [
      { item: 'Asphalt Shingles (25-30 year)', fairPrice: '$4,500-7,000', overchargePrice: '$12,000+', savings: '$5,000+' },
      { item: 'Labor & Installation', fairPrice: '$6,000-9,000', overchargePrice: '$14,000+', savings: '$5,000+' },
      { item: 'Underlayment & Materials', fairPrice: '$1,200-2,000', overchargePrice: '$3,500+', savings: '$1,500+' },
      { item: 'Permits & Disposal', fairPrice: '$800-1,200', overchargePrice: '$2,500+', savings: '$1,300+' },
      { item: 'Gutters (if needed)', fairPrice: '$1,500-2,500', overchargePrice: '$4,500+', savings: '$2,000+' }
    ],
    metaDescription: 'Roofing estimate too high? Analyze contractor quotes for overcharges and unnecessary work. Average savings: $3,200 on roof replacement costs.',
    pageTitle: 'Roofing Estimate Analyzer - Check for Overcharges | QuoteEvaluator'
  }
};