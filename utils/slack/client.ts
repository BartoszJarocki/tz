import { WebClient } from '@slack/web-api';
import type { SlackBlock } from './types';

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

export async function sendBlockReply(
  channel: string,
  threadTs: string,
  text: string,
  blocks: SlackBlock[]
): Promise<void> {
  const client = getSlackClient();
  await client.chat.postMessage({
    channel,
    thread_ts: threadTs,
    text,
    blocks,
  });
}

export async function sendSimpleReply(
  channel: string,
  threadTs: string,
  text: string
): Promise<void> {
  const client = getSlackClient();
  await client.chat.postMessage({
    channel,
    thread_ts: threadTs,
    text,
  });
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
  } catch {
    return null;
  }
}
