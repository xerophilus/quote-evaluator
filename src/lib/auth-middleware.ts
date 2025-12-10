import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple API key authentication for sensitive endpoints
const API_KEY_HEADER = 'x-api-key';

// Generate a secure API key if needed
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify API key for protected routes
export function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get(API_KEY_HEADER);
  const validApiKey = process.env.INTERNAL_API_KEY;
  
  if (!validApiKey || !apiKey) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(validApiKey)
  );
}

// Middleware wrapper for protected API routes
export function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Skip auth for development if needed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
      return handler(request);
    }
    
    // Check if this is an internal API call
    const isInternalCall = verifyApiKey(request);
    
    // For now, we'll allow public access to most endpoints
    // but you can customize this based on your needs
    const publicEndpoints = [
      '/api/analyze-quote',
      '/api/parse-pdf',
      '/api/create-checkout-session',
      '/api/verify-payment',
      '/api/send-checklist',
      '/api/check-subscription',
      '/api/create-billing-portal',
      '/api/save-quote'
    ];
    
    const pathname = request.nextUrl.pathname;
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      pathname.startsWith(endpoint)
    );
    
    // Allow public endpoints or authenticated requests
    if (isPublicEndpoint || isInternalCall) {
      return handler(request);
    }
    
    // Reject unauthorized requests
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  };
}

// Session validation for user authentication
export async function validateSession(sessionId: string): Promise<boolean> {
  // This would typically check against a database or session store
  // For now, we'll use a simple validation
  if (!sessionId || sessionId.length < 32) {
    return false;
  }
  
  // Add your session validation logic here
  // Example: check Redis, database, or Firebase Auth
  return true;
}

// Rate limiting per user/session
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkUserRateLimit(
  userId: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userLimit = userRateLimits.get(userId);
  
  // Clean up old entries
  for (const [key, value] of userRateLimits.entries()) {
    if (value.resetTime < now) {
      userRateLimits.delete(key);
    }
  }
  
  if (!userLimit || userLimit.resetTime < now) {
    userRateLimits.set(userId, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}