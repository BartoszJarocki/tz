import { type NextRequest, NextResponse } from 'next/server';
import { getSlackClient } from '@/utils/slack-client';

export async function POST(_request: NextRequest) {
  try {
    console.log('🤖 Auto-joining channels...');
    const client = getSlackClient();

    // Get list of public channels
    const channelsResponse = await client.conversations.list({
      types: 'public_channel',
      exclude_archived: true,
      limit: 100,
    });

    if (!channelsResponse.channels) {
      return NextResponse.json({ error: 'No channels found' });
    }

    const joinResults = [];

    // Join each public channel that the bot isn't already in
    for (const channel of channelsResponse.channels) {
      if (!channel.is_member && channel.id) {
        try {
          console.log(`🔗 Joining channel: #${channel.name}`);
          await client.conversations.join({
            channel: channel.id,
          });
          joinResults.push({ channel: channel.name, status: 'joined' });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ Failed to join #${channel.name}:`, errorMessage);
          joinResults.push({
            channel: channel.name,
            status: 'failed',
            error: errorMessage,
          });
        }
      } else {
        joinResults.push({ channel: channel.name, status: 'already_member' });
      }
    }

    return NextResponse.json({
      message: 'Auto-join completed',
      results: joinResults,
    });
  } catch (error) {
    console.error('💥 Auto-join failed:', error);
    return NextResponse.json(
      {
        error: 'Auto-join failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Auto-join endpoint - POST to join all public channels',
    usage: 'POST /api/slack/auto-join',
  });
}
