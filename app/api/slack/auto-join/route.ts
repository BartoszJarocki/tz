import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { createSlackOperationsAdapter, handleSlackAutoJoin } from '@/utils/slack';

export async function POST() {
  try {
    const result = await handleSlackAutoJoin(createSlackOperationsAdapter());
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Slack auto-join failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        error: 'Auto-join failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Auto-join endpoint - POST to join all public channels',
    usage: 'POST /api/slack/auto-join',
  });
}
