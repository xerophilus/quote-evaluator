import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { getAdminMetrics, AdminTimeRange } from '@/lib/admin-metrics';

export async function GET(request: NextRequest) {
  const authResult = requireAdminSession(request);
  if (authResult instanceof NextResponse) return authResult;

  const rangeParam = request.nextUrl.searchParams.get('range') || 'week';
  const range: AdminTimeRange =
    rangeParam === 'today' || rangeParam === 'month' ? rangeParam : 'week';

  try {
    const metrics = await getAdminMetrics(range);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
