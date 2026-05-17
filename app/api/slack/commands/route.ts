import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import {
  createErrorResponse,
  createSlackCommandResponse,
  parseSlackCommandPayload,
  verifySlackSignature,
} from '@/utils/slack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    logger.info('Slack slash command received', {
      hasBody: !!body,
      hasTimestamp: !!timestamp,
      hasSignature: !!signature,
      bodyLength: body.length,
    });

    if (!verifySlackSignature(signature, timestamp, body)) {
      logger.warn('Invalid Slack slash command signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = parseSlackCommandPayload(body);

    logger.info('Slack slash command parsed', {
      command: payload.command,
      hasText: payload.text.length > 0,
      user: payload.user_name,
    });

    return NextResponse.json(createSlackCommandResponse(payload));
  } catch (error) {
    logger.error('Error handling Slack command', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      createErrorResponse('An internal error occurred. Please try again later.'),
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'help';

  return NextResponse.json({
    message: 'Slack Commands API endpoint is working',
    example_usage: `/tz ${text}`,
    timestamp: new Date().toISOString(),
  });
}
