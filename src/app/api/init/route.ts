import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env-validation';

// Health check and initialization endpoint
export async function GET() {
  try {
    // Validate environment variables
    validateEnv();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}