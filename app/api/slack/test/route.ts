import { type NextRequest, NextResponse } from 'next/server';
import { getBotInfo, getSlackClient } from '@/utils/slack-client';

export async function GET() {
  try {
    console.log('🧪 Testing Slack bot setup...');

    // Test 1: Environment variables
    const hasToken = !!process.env.SLACK_BOT_TOKEN;
    const hasSigningSecret = !!process.env.SLACK_SIGNING_SECRET;

    console.log('🔧 Environment check:', { hasToken, hasSigningSecret });

    if (!hasToken || !hasSigningSecret) {
      return NextResponse.json(
        {
          error: 'Missing environment variables',
          hasToken,
          hasSigningSecret,
        },
        { status: 400 }
      );
    }

    // Test 2: Bot info and auth
    const botInfo = await getBotInfo();
    console.log('🤖 Bot info:', botInfo);

    // Test 3: Client capabilities
    const client = getSlackClient();
    const authTest = await client.auth.test();
    console.log('🔐 Auth test:', authTest);

    // Test 4: List channels bot is in
    let channels = [];
    try {
      const channelsResponse = await client.conversations.list({
        types: 'public_channel,private_channel',
        limit: 10,
      });
      channels =
        channelsResponse.channels?.map(c => ({
          id: c.id,
          name: c.name,
          is_member: c.is_member,
        })) || [];
      console.log('📺 Channels:', channels);
    } catch (error) {
      console.log('❌ Could not list channels:', error);
    }

    return NextResponse.json({
      success: true,
      botInfo,
      authTest: {
        ok: authTest.ok,
        user: authTest.user,
        user_id: authTest.user_id,
        team: authTest.team,
        team_id: authTest.team_id,
      },
      channels,
      environment: {
        hasToken,
        hasSigningSecret,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('💥 Slack test failed:', error);
    return NextResponse.json(
      {
        error: 'Slack test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Test sending a message
export async function POST(request: NextRequest) {
  try {
    const { channel, message } = await request.json();

    if (!channel || !message) {
      return NextResponse.json(
        {
          error: 'Missing channel or message',
        },
        { status: 400 }
      );
    }

    console.log('📤 Testing message send:', { channel, message });

    const client = getSlackClient();
    const result = await client.chat.postMessage({
      channel,
      text: `🧪 Test message: ${message}`,
    });

    console.log('✅ Message sent:', result);

    return NextResponse.json({
      success: true,
      result: {
        ok: result.ok,
        ts: result.ts,
        channel: result.channel,
      },
    });
  } catch (error) {
    console.error('💥 Message send failed:', error);
    return NextResponse.json(
      {
        error: 'Message send failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
