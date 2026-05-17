import { type NextRequest, NextResponse } from 'next/server';
import { getRuntimeConfigStatus } from '@/utils/env';
import { logger } from '@/utils/logger';
import {
  createSlackOperationsAdapter,
  runSlackDiagnostics,
  sendSlackTestMessage,
} from '@/utils/slack';

export async function GET() {
  try {
    const environment = getRuntimeConfigStatus();

    if (!environment.hasSlackBotToken || !environment.hasSlackSigningSecret) {
      return NextResponse.json(
        {
          error: 'Missing environment variables',
          environment,
        },
        { status: 400 }
      );
    }

    const result = await runSlackDiagnostics(createSlackOperationsAdapter(), environment);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Slack diagnostics failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        error: 'Slack test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = await sendSlackTestMessage(
      createSlackOperationsAdapter(),
      await request.json()
    );
    return NextResponse.json(response.body, { status: response.status });
  } catch (error) {
    logger.error('Slack test message failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        error: 'Message send failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
