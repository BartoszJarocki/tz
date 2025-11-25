import { type NextRequest, NextResponse } from 'next/server';
import {
  convertTimezoneMatch,
  detectTimezoneConversions,
  shouldProcessMessage,
} from '@/utils/message-parser';
import { getBotInfo, getSlackClient, sendSimpleReply, verifySlackSignature } from '@/utils/slack';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Slack event received');
    const body = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    console.log('📦 Request details:', {
      hasBody: !!body,
      hasTimestamp: !!timestamp,
      hasSignature: !!signature,
      bodyLength: body.length,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
    });

    console.log('📋 Raw body preview:', body.substring(0, 200));

    // Log all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('📨 All headers:', headers);

    // Verify Slack signature
    if (!verifySlackSignature(signature, timestamp, body)) {
      console.error('❌ Invalid Slack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    console.log('✅ Slack signature verified');

    const payload = JSON.parse(body);
    console.log('📋 Payload type:', payload.type);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      console.log('🔗 URL verification challenge received');
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle events
    if (payload.type === 'event_callback') {
      const event = payload.event;
      console.log('🎯 Event received:', {
        type: event.type,
        hasText: !!event.text,
        hasBotId: !!event.bot_id,
        user: event.user,
        channel: event.channel,
      });

      // Handle message events for timezone conversion
      if (event.type === 'message' && event.text && !event.bot_id) {
        console.log('💬 Processing message:', event.text);
        await handleMessageEvent(event);
      }
      // Handle channel creation - auto-join new channels
      else if (event.type === 'channel_created') {
        console.log('🆕 New channel created:', event.channel?.name);
        await autoJoinChannel(event.channel?.id);
      }
      // Handle app installation - join all channels
      else if (event.type === 'app_home_opened') {
        console.log('🏠 App home opened, checking channel memberships');
        // Could trigger auto-join logic here
      } else {
        console.log('⏭️ Skipping event:', {
          type: event.type,
          isMessage: event.type === 'message',
          hasText: !!event.text,
          isBot: !!event.bot_id,
        });
      }

      return NextResponse.json({ status: 'ok' });
    }

    console.log('🤷 Unknown payload type, returning OK');
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('💥 Error handling Slack event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessageEvent(event: {
  type: string;
  text: string;
  user: string;
  channel: string;
  ts: string;
  bot_id?: string;
}) {
  try {
    console.log('🔍 Getting bot info...');
    // Get bot info to avoid responding to self
    const botInfo = await getBotInfo();
    console.log('🤖 Bot info:', botInfo);

    // Check if we should process this message
    const shouldProcess = shouldProcessMessage(event.text, event.user, botInfo?.userId);
    console.log('🤔 Should process message?', {
      shouldProcess,
      text: event.text,
      user: event.user,
      botUserId: botInfo?.userId,
    });

    if (!shouldProcess) {
      console.log('⏭️ Skipping message processing');
      return;
    }

    console.log('✅ Processing message for timezone conversion:', event.text);

    // Detect timezone conversions in the message
    const matches = detectTimezoneConversions(event.text);
    console.log('🎯 Detected matches:', matches);

    if (matches.length === 0) {
      console.log('❌ No timezone matches found');
      return;
    }

    // Process each match and send response
    for (const match of matches) {
      console.log('⚙️ Converting match:', match);
      const converted = convertTimezoneMatch(match);
      console.log('🔄 Converted result:', converted);

      if (converted.formattedResponse) {
        console.log('📤 Sending reply to channel:', event.channel, 'thread:', event.ts);
        await sendSimpleReply(event.channel, event.ts, converted.formattedResponse);
        console.log('✅ Sent timezone conversion:', converted.formattedResponse);
      } else {
        console.log('❌ No formatted response to send');
      }
    }
  } catch (error) {
    console.error('💥 Error handling message event:', error);
  }
}

async function autoJoinChannel(channelId: string | undefined) {
  if (!channelId) return;

  try {
    console.log('🔗 Auto-joining channel:', channelId);
    const client = getSlackClient();
    await client.conversations.join({ channel: channelId });
    console.log('✅ Successfully joined channel:', channelId);
  } catch (error) {
    console.error('❌ Failed to auto-join channel:', error);
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Slack Events API endpoint is working',
    timestamp: new Date().toISOString(),
  });
}
