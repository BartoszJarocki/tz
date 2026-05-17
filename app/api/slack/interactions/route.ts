import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import {
  createSlackInteractionResponse,
  parseSlackInteractionPayload,
  verifySlackSignature,
} from '@/utils/slack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    if (!verifySlackSignature(signature, timestamp, body)) {
      logger.warn('Invalid Slack interaction signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = parseSlackInteractionPayload(body);
    if (!payload) {
      return NextResponse.json({ error: 'No payload found' }, { status: 400 });
    }

    logger.info('Slack interaction received', { interactionType: payload.type });
    return NextResponse.json(createSlackInteractionResponse(payload));
  } catch (error) {
    logger.error('Error handling Slack interaction', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Slack Interactions endpoint is working',
    supported_interactions: ['block_actions', 'shortcut', 'view_submission'],
    timestamp: new Date().toISOString(),
  });
}
