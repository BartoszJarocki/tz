import { describe, expect, test } from 'vitest';
import {
  createSlackCommandResponse,
  createSlackInteractionResponse,
  handleSlackAutoJoin,
  handleSlackEventEnvelope,
  parseSlackCommandPayload,
  parseSlackInteractionPayload,
  runSlackDiagnostics,
  type SlackOperationsAdapter,
  testSlackPatternDetection,
} from '@/utils/slack/intake';

describe('slack-intake', () => {
  test('parses slash command payloads and creates conversion responses', () => {
    const payload = parseSlackCommandPayload('command=%2Ftz&text=3pm+EST+to+PST&user_name=ada');
    const response = createSlackCommandResponse(payload);

    expect(response.response_type).toBe('ephemeral');
    expect(response.text).toContain('3:00 PM EST');
    expect(response.text).toContain('Los Angeles');
  });

  test('handles Slack event envelopes with an adapter seam', async () => {
    const replies: string[] = [];
    const response = await handleSlackEventEnvelope(
      {
        type: 'event_callback',
        event: {
          type: 'message',
          text: '3PM CET -> EST',
          user: 'U1',
          channel: 'C1',
          ts: '123.456',
        },
      },
      {
        getBotInfo: async () => ({ userId: 'BOT', name: 'tz' }),
        sendSimpleReply: async (_channel, _threadTs, text) => {
          replies.push(text);
        },
        joinChannel: async () => {},
      }
    );

    expect(response.body).toEqual({ status: 'ok' });
    expect(replies[0]).toContain('3:00 PM CET');
  });

  test('parses and handles interaction payloads inside Slack Intake', () => {
    const payload = parseSlackInteractionPayload(
      `payload=${encodeURIComponent(
        JSON.stringify({
          type: 'shortcut',
          callback_id: 'timezone_converter',
        })
      )}`
    );

    expect(payload).not.toBeNull();
    expect(createSlackInteractionResponse(payload ?? { type: 'unknown' }).text).toContain('/tz');
  });

  test('runs auto-join and diagnostics through Slack App Operations adapter', async () => {
    const joined: string[] = [];
    const adapter: SlackOperationsAdapter = {
      getBotInfo: async () => ({ userId: 'BOT', name: 'tz' }),
      authTest: async () => ({ ok: true, user: 'tz', userId: 'BOT' }),
      listVisibleChannels: async () => [{ id: 'C1', name: 'general', isMember: true }],
      listPublicChannels: async () => [
        { id: 'C1', name: 'general', isMember: true },
        { id: 'C2', name: 'random', isMember: false },
      ],
      joinChannel: async channelId => {
        joined.push(channelId);
      },
      postMessage: async () => ({ ok: true }),
    };

    const autoJoin = await handleSlackAutoJoin(adapter);
    const diagnostics = await runSlackDiagnostics(adapter, {
      hasSlackBotToken: true,
      hasSlackSigningSecret: true,
      nodeEnv: 'test',
    });

    expect(joined).toEqual(['C2']);
    expect(autoJoin.results.map(result => result.status)).toEqual(['already_member', 'joined']);
    expect(diagnostics).toMatchObject({
      success: true,
      botInfo: { userId: 'BOT' },
      channels: [{ name: 'general' }],
    });
  });

  test('keeps pattern diagnostics out of the route adapter', () => {
    const result = testSlackPatternDetection('3PM CET -> EST');

    expect(result.success).toBe(true);
    expect(result.converted[0].formattedResponse).toContain('3:00 PM CET');
  });
});
