import { NextRequest, NextResponse } from 'next/server';
import { verifySlackSignature } from '../../../../utils/slack-utils';

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

    // Handle other events here if needed
    if (payload.type === 'event_callback') {
      // Process the event
      console.log('Received event:', payload.event);
      
      // For now, just acknowledge the event
      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Slack event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Slack Events API endpoint is working',
    timestamp: new Date().toISOString()
  });
}