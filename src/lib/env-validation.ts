// Environment variable validation
export function validateEnv() {
  const required = [
    'ANTHROPIC_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_APP_URL'
  ];

  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env.local file and ensure all required variables are set.');
    
    // In production, throw an error to prevent the app from starting
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  // Validate format of certain env vars
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    console.warn('⚠️  Anthropic API key format looks incorrect (should start with "sk-ant-")');
  }
  
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.warn('⚠️  Stripe secret key format looks incorrect (should start with "sk_")');
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Check for test keys in production
    if (process.env.STRIPE_SECRET_KEY?.includes('_test_')) {
      console.warn('⚠️  Using Stripe TEST keys in production environment!');
    }
    
    // Ensure INTERNAL_API_KEY is set for production
    if (!process.env.INTERNAL_API_KEY) {
      console.warn('⚠️  INTERNAL_API_KEY not set - API endpoints may be unprotected');
    }

    if (!process.env.ADMIN_SESSION_SECRET) {
      console.warn('⚠️  ADMIN_SESSION_SECRET not set - using fallback (set for production admin auth)');
    }
  }
  
  console.log('✅ Environment variables validated successfully');
}

// Safe getter for environment variables with fallbacks
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set and no fallback provided`);
  }
  
  return value || fallback || '';
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}