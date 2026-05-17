import { type NextRequest, NextResponse } from 'next/server';
import { testSlackPatternDetection } from '@/utils/slack';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '3pm CEST -> EST';

  return NextResponse.json(testSlackPatternDetection(text));
}
