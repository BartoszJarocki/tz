import { NextRequest, NextResponse } from 'next/server';
import { verifySlackSignature } from '../../../../utils/slack-utils';
import { detectTimezoneConversions, convertTimezoneMatch, shouldProcessMessage } from '../../../../utils/message-parser';
import { sendSimpleReply, getBotInfo } from '../../../../utils/slack-client';

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

    const payload = JSON.parse(body);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle events
    if (payload.type === 'event_callback') {
      const event = payload.event;
      
      // Handle message events for timezone conversion
      if (event.type === 'message' && event.text && !event.bot_id) {
        await handleMessageEvent(event);
      }
      
      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Slack event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessageEvent(event: any) {
  try {
    // Get bot info to avoid responding to self
    const botInfo = await getBotInfo();
    
    // Check if we should process this message
    if (!shouldProcessMessage(event.text, event.user, botInfo?.userId)) {
      return;
    }
    
    console.log('Processing message for timezone conversion:', event.text);
    
    // Detect timezone conversions in the message
    const matches = detectTimezoneConversions(event.text);
    
    if (matches.length === 0) {
      return;
    }
    
    // Process each match and send response
    for (const match of matches) {
      const converted = convertTimezoneMatch(match);
      
      if (converted.formattedResponse) {
        await sendSimpleReply(
          event.channel,
          event.ts,
          converted.formattedResponse
        );
        
        console.log(`Sent timezone conversion: ${converted.formattedResponse}`);
      }
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Slack Events API endpoint is working',
    timestamp: new Date().toISOString()
  });
}