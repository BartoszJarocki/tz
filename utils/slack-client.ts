import { WebClient } from '@slack/web-api';

let slackClient: WebClient | null = null;

export function getSlackClient(): WebClient {
  if (!slackClient) {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      throw new Error('SLACK_BOT_TOKEN environment variable is required');
    }
    slackClient = new WebClient(token);
  }
  return slackClient;
}

export interface UnfurlAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
}

export async function sendUnfurlResponse(
  channel: string,
  timestamp: string,
  conversion: string
): Promise<void> {
  try {
    const client = getSlackClient();
    
    const attachment: UnfurlAttachment = {
      color: '#36C5F0', // Slack blue
      text: `🕐  ${conversion}`,
    };

    await client.chat.postMessage({
      channel,
      thread_ts: timestamp,
      text: `🕐  ${conversion}`,
      attachments: [attachment],
    });
    
    console.log('Unfurl response sent successfully');
  } catch (error) {
    console.error('Error sending unfurl response:', error);
    throw error;
  }
}

export async function sendSimpleReply(
  channel: string,
  timestamp: string,
  text: string
): Promise<void> {
  try {
    const client = getSlackClient();
    
    await client.chat.postMessage({
      channel,
      thread_ts: timestamp,
      text,
    });
    
    console.log('Reply sent successfully');
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
}

export async function getBotInfo(): Promise<{ userId: string; name: string } | null> {
  try {
    const client = getSlackClient();
    const response = await client.auth.test();
    
    if (response.ok && response.user_id && response.user) {
      return {
        userId: response.user_id,
        name: response.user,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting bot info:', error);
    return null;
  }
}