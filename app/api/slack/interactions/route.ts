import { type NextRequest, NextResponse } from 'next/server';
import {
  createErrorResponse,
  createTimezoneResponse,
  verifySlackSignature,
} from '@/utils/slack-utils';
import { convertTimeToTimezones } from '@/utils/timezone-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    // Verify Slack signature
    if (!verifySlackSignature(signature, timestamp, body)) {
      console.error('Invalid Slack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the form data
    const params = new URLSearchParams(body);
    const payloadStr = params.get('payload');

    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload found' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    console.log('Interaction received:', payload.type, payload.user?.name);

    // Handle different types of interactions
    switch (payload.type) {
      case 'block_actions':
        return handleBlockActions(payload);

      case 'shortcut':
        return handleShortcut(payload);

      case 'view_submission':
        return handleViewSubmission(payload);

      default:
        console.warn('Unhandled interaction type:', payload.type);
        return NextResponse.json({
          response_type: 'ephemeral',
          text: 'Interaction type not supported',
        });
    }
  } catch (error) {
    console.error('Error handling Slack interaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleBlockActions(payload: {
  actions: Array<{ action_id: string; value: string }>;
}) {
  const action = payload.actions[0];

  if (action.action_id === 'convert_timezone') {
    // Extract timezone info from button value
    const [sourceTime, sourceTimezone, targetTimezone] = action.value.split('|');

    try {
      const time = new Date(sourceTime);
      const conversions = convertTimeToTimezones(time, sourceTimezone, [targetTimezone]);

      if (conversions.length > 0) {
        const conv = conversions[0];
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `🕐 ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} ${sourceTimezone} = ${conv.time} ${conv.offset} (${conv.city})${conv.dayDiff ? ` ${conv.dayDiff}` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error in block action conversion:', error);
    }

    return NextResponse.json(createErrorResponse('Error converting timezone'));
  }

  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Action not recognized',
  });
}

async function handleShortcut(payload: { callback_id: string }) {
  // Handle global shortcuts or message shortcuts
  if (payload.callback_id === 'timezone_converter') {
    // Return a modal or simple response
    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'Use `/tz` command for timezone conversions. Example: `/tz 3pm EST to PST`',
    });
  }

  return NextResponse.json({
    response_type: 'ephemeral',
    text: 'Shortcut not recognized',
  });
}

async function handleViewSubmission(payload: { view: { state: { values: unknown } } }) {
  // Handle modal submissions
  const values = payload.view.state.values;

  // Extract form data and process timezone conversion
  // This would be used if we implement a modal interface

  return NextResponse.json({
    response_action: 'clear',
  });
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Slack Interactions API endpoint is working',
    supported_interactions: ['block_actions', 'shortcut', 'view_submission'],
    timestamp: new Date().toISOString(),
  });
}
