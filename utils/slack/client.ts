import { WebClient } from '@slack/web-api';
import { getSlackBotToken } from '@/utils/env';
import type { SlackEventAdapter, SlackOperationsAdapter } from '@/utils/slack/intake';
import type { SlackBlock } from './types';

let slackClient: WebClient | null = null;

export function getSlackClient(): WebClient {
  if (!slackClient) {
    slackClient = new WebClient(getSlackBotToken());
  }
  return slackClient;
}

export function createSlackEventAdapter(): SlackEventAdapter {
  return {
    getBotInfo,
    sendSimpleReply,
    joinChannel: async channelId => {
      const client = getSlackClient();
      await client.conversations.join({ channel: channelId });
    },
  };
}

export function createSlackOperationsAdapter(): SlackOperationsAdapter {
  return {
    getBotInfo,
    authTest: async () => {
      const client = getSlackClient();
      const response = await client.auth.test();

      return {
        ok: response.ok,
        user: response.user,
        userId: response.user_id,
        team: response.team,
        teamId: response.team_id,
      };
    },
    listVisibleChannels: async limit => {
      const client = getSlackClient();
      const response = await client.conversations.list({
        types: 'public_channel,private_channel',
        limit,
      });

      return (
        response.channels?.map(channel => ({
          id: channel.id,
          name: channel.name,
          isMember: channel.is_member,
        })) ?? []
      );
    },
    listPublicChannels: async () => {
      const client = getSlackClient();
      const response = await client.conversations.list({
        types: 'public_channel',
        exclude_archived: true,
        limit: 100,
      });

      return (
        response.channels?.map(channel => ({
          id: channel.id,
          name: channel.name,
          isMember: channel.is_member,
        })) ?? []
      );
    },
    joinChannel: async channelId => {
      const client = getSlackClient();
      await client.conversations.join({ channel: channelId });
    },
    postMessage: async (channel, text) => {
      const client = getSlackClient();
      const response = await client.chat.postMessage({ channel, text });

      return {
        ok: response.ok,
        ts: response.ts,
        channel: response.channel,
      };
    },
  };
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
