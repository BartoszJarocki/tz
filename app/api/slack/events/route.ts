import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import {
  createSlackEventAdapter,
  handleSlackEventEnvelope,
  verifySlackSignature,
} from '@/utils/slack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    logger.info('Slack event received', {
      hasBody: !!body,
      hasTimestamp: !!timestamp,
      hasSignature: !!signature,
      bodyLength: body.length,
    });

    if (!verifySlackSignature(signature, timestamp, body)) {
      logger.warn('Invalid Slack event signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const response = await handleSlackEventEnvelope(payload, createSlackEventAdapter());
    return NextResponse.json(response.body, { status: response.status });
  } catch (error) {
    logger.error('Error handling Slack event', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Slack Events API endpoint is working',
    timestamp: new Date().toISOString(),
  });
}
