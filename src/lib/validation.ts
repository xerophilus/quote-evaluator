import { z } from 'zod';

// Validation schemas for API routes
export const analyzeQuoteSchema = z.object({
  quoteText: z.string().min(10).max(50000),
  analysisType: z.enum(['free', 'pro', 'subscription', 'rush', 'lifetime'])
});

export const createCheckoutSchema = z.object({
  priceId: z.string().optional(),
  mode: z.enum(['payment', 'subscription']).default('payment'),
  quoteId: z.string().optional(),
  productType: z.enum(['single', 'subscription', 'rush', 'repeat', 'proplus', 'lifetime']).optional()
});

export const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1)
});

export const saveQuoteSchema = z.object({
  userEmail: z.string().email(),
  quoteName: z.string().min(1).max(100),
  quoteData: z.object({
    projectType: z.string().min(1).max(100),
    quoteText: z.string().min(10).max(50000),
    analysisType: z.enum(['free', 'pro', 'subscription', 'rush', 'lifetime'])
  }),
  analysisResult: z.object({
    plainEnglishBreakdown: z.array(z.string()),
    redFlags: z.array(z.string()).optional(),
    costComparison: z.array(z.string()).optional(),
    smartQuestions: z.array(z.string()).optional(),
    healthScore: z.object({
      grade: z.string(),
      color: z.string(),
      description: z.string(),
      percentage: z.number().optional()
    }).optional(),
    majorConcern: z.string().optional()
  })
});

export const sendChecklistSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(1).max(100).optional()
});

export const checkSubscriptionSchema = z.object({
  customerId: z.string().min(1)
});

export const createBillingPortalSchema = z.object({
  customerId: z.string().min(1)
});

// Sanitization helper for text content
export function sanitizeText(text: string): string {
  // Remove any potential script tags or HTML
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// File validation
export const validatePDFFile = (file: File) => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('No file provided');
    return errors;
  }
  
  if (file.type !== 'application/pdf') {
    errors.push('File must be a PDF');
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check filename for potential issues
  const filename = file.name.toLowerCase();
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    errors.push('Invalid filename');
  }
  
  return errors;
};