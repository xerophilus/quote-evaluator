import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting for edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Configure CORS
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || 'https://quoteevaluator.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    // Rate limiting for API routes
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
    
    const now = Date.now();
    const rateLimitKey = `${ip}:${request.nextUrl.pathname}`;
    
    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
    
    const rateLimit = rateLimitMap.get(rateLimitKey);
    
    if (rateLimit) {
      if (rateLimit.resetTime > now) {
        if (rateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            { 
              status: 429, 
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
              }
            }
          );
        }
        rateLimit.count++;
      } else {
        // Reset the rate limit window
        rateLimit.count = 1;
        rateLimit.resetTime = now + RATE_LIMIT_WINDOW;
      }
    } else {
      rateLimitMap.set(rateLimitKey, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      });
    }
    
    // Add rate limit headers to response
    const currentLimit = rateLimitMap.get(rateLimitKey);
    if (currentLimit) {
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', 
        Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentLimit.count).toString()
      );
      response.headers.set('X-RateLimit-Reset', 
        new Date(currentLimit.resetTime).toISOString()
      );
    }
  }
  
  // Security headers for all routes
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://apis.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.openai.com https://api.stripe.com https://checkout.stripe.com https://*.firebase.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://accounts.google.com; " +
    "frame-src 'self' https://checkout.stripe.com https://js.stripe.com https://accounts.google.com https://*.firebaseapp.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none';"
  );
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};