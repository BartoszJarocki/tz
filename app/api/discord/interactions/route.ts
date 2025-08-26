import { InteractionType } from 'discord.js';
import { type NextRequest, NextResponse } from 'next/server';

import {
  createDiscordEmbedResponse,
  createDiscordErrorResponse,
  createDiscordHelpResponse,
  createDiscordResponse,
  type DiscordInteractionPayload,
  verifyDiscordSignature,
} from '@/utils/discord-utils';
import { parseTimeCommand } from '@/utils/time-parser';
import { convertTimeToTimezones } from '@/utils/timezone-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get('x-signature-timestamp') || '';
    const signature = request.headers.get('x-signature-ed25519') || '';

    // Verify Discord signature
    if (!verifyDiscordSignature(signature, timestamp, body)) {
      console.error('Invalid Discord signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: DiscordInteractionPayload = JSON.parse(body);

    // Handle ping interactions (Discord verification)
    if (payload.type === InteractionType.Ping) {
      return NextResponse.json({ type: 1 });
    }

    // Handle application command interactions (slash commands)
    if (payload.type === InteractionType.ApplicationCommand) {
      if (payload.data?.name === 'tz') {
        return await handleTimezoneCommand(payload);
      }
    }

    return NextResponse.json({
      type: 4,
      data: { content: 'Unknown interaction type' },
    });
  } catch (error) {
    console.error('Error handling Discord interaction:', error);
    return NextResponse.json(
      createDiscordErrorResponse('An internal error occurred. Please try again later.'),
      { status: 500 }
    );
  }
}

async function handleTimezoneCommand(payload: DiscordInteractionPayload) {
  try {
    const timeOption = payload.data?.options?.find(option => option.name === 'time');
    const timeText = timeOption?.value;

    console.log(
      `Discord slash command received: /tz ${timeText} from ${
        payload.user?.username || payload.member?.user?.username
      }`
    );

    // Handle help request
    if (
      !timeText ||
      timeText.trim() === '' ||
      timeText.trim() === 'help' ||
      timeText.trim() === '?'
    ) {
      return NextResponse.json(createDiscordHelpResponse(true));
    }

    // Parse the command
    const parsedCommand = parseTimeCommand(timeText);
    if (!parsedCommand) {
      return NextResponse.json(
        createDiscordErrorResponse(
          'Could not understand the time conversion request. Use `/tz help` for usage examples.',
          true
        )
      );
    }

    // Convert the time
    const conversions = convertTimeToTimezones(
      parsedCommand.sourceTime,
      parsedCommand.sourceTimezone,
      parsedCommand.targetTimezones
    );

    if (conversions.length === 0) {
      return NextResponse.json(
        createDiscordErrorResponse(
          'No valid timezones found for conversion. Please check your timezone names.',
          true
        )
      );
    }

    // Create response
    const sourceTimeString = parsedCommand.isNow
      ? undefined
      : parsedCommand.sourceTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

    const sourceTimezoneInfo =
      parsedCommand.sourceTimezone === 'UTC' ? 'UTC' : parsedCommand.sourceTimezone;

    return NextResponse.json(
      createDiscordEmbedResponse(
        conversions,
        parsedCommand.isNow ? undefined : sourceTimeString,
        parsedCommand.isNow ? undefined : sourceTimezoneInfo,
        false // Not ephemeral for slash commands
      )
    );
  } catch (conversionError) {
    console.error('Error converting timezone:', conversionError);
    return NextResponse.json(
      createDiscordErrorResponse(
        'Error performing timezone conversion. Please check your input and try again.',
        true
      )
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'help';

  return NextResponse.json({
    message: 'Discord Interactions API endpoint is working',
    example_usage: `/tz ${text}`,
    timestamp: new Date().toISOString(),
  });
}
