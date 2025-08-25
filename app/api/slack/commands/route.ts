import { type NextRequest, NextResponse } from 'next/server';
import {
  type SlackCommandPayload,
  createErrorResponse,
  createHelpResponse,
  createTimezoneResponse,
  verifySlackSignature,
} from '@/utils/slack-utils';
import { parseTimeCommand } from '@/utils/time-parser';
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
    const payload: SlackCommandPayload = {
      token: params.get('token') || '',
      team_id: params.get('team_id') || '',
      team_domain: params.get('team_domain') || '',
      channel_id: params.get('channel_id') || '',
      channel_name: params.get('channel_name') || '',
      user_id: params.get('user_id') || '',
      user_name: params.get('user_name') || '',
      command: params.get('command') || '',
      text: params.get('text') || '',
      response_url: params.get('response_url') || '',
      trigger_id: params.get('trigger_id') || '',
    };

    console.log(
      `Slash command received: ${payload.command} ${payload.text} from ${payload.user_name}`
    );

    // Handle help request
    if (
      !payload.text ||
      payload.text.trim() === '' ||
      payload.text.trim() === 'help' ||
      payload.text.trim() === '?'
    ) {
      return NextResponse.json(createHelpResponse());
    }

    // Parse the command
    const parsedCommand = parseTimeCommand(payload.text);
    if (!parsedCommand) {
      return NextResponse.json(
        createErrorResponse(
          'Could not understand the time conversion request. Type `/tz help` for usage examples.'
        )
      );
    }

    // Convert the time
    try {
      const conversions = convertTimeToTimezones(
        parsedCommand.sourceTime,
        parsedCommand.sourceTimezone,
        parsedCommand.targetTimezones
      );

      if (conversions.length === 0) {
        return NextResponse.json(
          createErrorResponse(
            'No valid timezones found for conversion. Please check your timezone names.'
          )
        );
      }

      // Create response
      const sourceTimeString = parsedCommand.isNow
        ? 'Current time'
        : parsedCommand.sourceTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

      const sourceTimezoneInfo =
        parsedCommand.sourceTimezone === 'UTC' ? 'UTC' : parsedCommand.sourceTimezone;

      const response = createTimezoneResponse(
        conversions,
        parsedCommand.isNow ? undefined : sourceTimeString,
        parsedCommand.isNow ? undefined : sourceTimezoneInfo
      );

      return NextResponse.json(response);
    } catch (conversionError) {
      console.error('Error converting timezone:', conversionError);
      return NextResponse.json(
        createErrorResponse(
          'Error performing timezone conversion. Please check your input and try again.'
        )
      );
    }
  } catch (error) {
    console.error('Error handling Slack command:', error);
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
