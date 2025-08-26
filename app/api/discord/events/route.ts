import { type NextRequest, NextResponse } from 'next/server';
import { getBotInfo, sendDiscordReply } from '@/utils/discord-client';
import { shouldProcessDiscordMessage } from '@/utils/discord-utils';
import { convertTimezoneMatch, detectTimezoneConversions } from '@/utils/message-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // For webhook events, Discord doesn't use the same signature verification
    // In a production environment, you'd want to verify the source is Discord
    const payload = JSON.parse(body);

    // Handle different Discord gateway events
    if (payload.t === 'MESSAGE_CREATE') {
      await handleMessageEvent(payload.d);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Discord event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessageEvent(event: {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    bot?: boolean;
  };
  channel_id: string;
  guild_id?: string;
}) {
  try {
    // Skip messages from bots
    if (event.author.bot) {
      return;
    }

    // Get bot info to avoid responding to self
    const botInfo = await getBotInfo();

    // Check if we should process this message
    if (!shouldProcessDiscordMessage(event.content, event.author.id, botInfo?.userId)) {
      return;
    }

    console.log('Processing Discord message for timezone conversion:', event.content);

    // Detect timezone conversions in the message
    const matches = detectTimezoneConversions(event.content);

    if (matches.length === 0) {
      return;
    }

    // Process each match and send response
    for (const match of matches) {
      const converted = convertTimezoneMatch(match);

      if (converted.formattedResponse) {
        await sendDiscordReply(event.channel_id, `🌍 ${converted.formattedResponse}`, event.id);

        console.log(`Sent Discord timezone conversion: ${converted.formattedResponse}`);
      }
    }
  } catch (error) {
    console.error('Error handling Discord message event:', error);
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Discord Events API endpoint is working',
    supported_events: ['MESSAGE_CREATE'],
    timestamp: new Date().toISOString(),
  });
}
