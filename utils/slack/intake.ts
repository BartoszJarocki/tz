import type { RuntimeConfigStatus } from '@/utils/env';
import { logger } from '@/utils/logger';
import {
  convertTimezoneMatch,
  detectTimezoneConversions,
  shouldProcessMessage,
} from '@/utils/message-parser';
import { getAllTimezones, searchTimezones } from '@/utils/timezone-catalog';
import {
  convertTimeToTimezones,
  convertTimezoneCommand,
  getTimezoneCommandSourceSummary,
} from '@/utils/timezone-conversion';
import {
  createErrorResponse,
  createHelpResponse,
  createListResponse,
  createSearchResponse,
  createTimezoneResponse,
} from './responses';
import type { SlackCommandPayload, SlackResponse } from './types';

export interface SlackMessageEvent {
  type: 'message';
  text?: string;
  user?: string;
  channel?: string;
  ts?: string;
  bot_id?: string;
}

export interface SlackChannelCreatedEvent {
  type: 'channel_created';
  channel?: {
    id?: string;
    name?: string;
  };
}

export type SlackEvent = SlackMessageEvent | SlackChannelCreatedEvent | { type: string };

export interface SlackEventEnvelope {
  type: string;
  challenge?: string;
  event?: SlackEvent;
}

export interface SlackEventAdapter {
  getBotInfo: () => Promise<{ userId: string; name: string } | null>;
  sendSimpleReply: (channel: string, threadTs: string, text: string) => Promise<void>;
  joinChannel: (channelId: string) => Promise<void>;
}

export interface SlackChannelSummary {
  id?: string;
  name?: string;
  isMember?: boolean;
}

export interface SlackAuthTestSummary {
  ok?: boolean;
  user?: string;
  userId?: string;
  team?: string;
  teamId?: string;
}

export interface SlackOperationsAdapter {
  getBotInfo: () => Promise<{ userId: string; name: string } | null>;
  authTest: () => Promise<SlackAuthTestSummary>;
  listVisibleChannels: (limit?: number) => Promise<SlackChannelSummary[]>;
  listPublicChannels: () => Promise<SlackChannelSummary[]>;
  joinChannel: (channelId: string) => Promise<void>;
  postMessage: (
    channel: string,
    text: string
  ) => Promise<{ ok?: boolean; ts?: string; channel?: string }>;
}

export interface SlackAutoJoinResult {
  channel?: string;
  status: 'already_member' | 'failed' | 'joined' | 'skipped';
  error?: string;
}

export interface SlackDiagnosticsResult {
  success: boolean;
  botInfo: Awaited<ReturnType<SlackOperationsAdapter['getBotInfo']>>;
  authTest: SlackAuthTestSummary;
  channels: SlackChannelSummary[];
  environment: RuntimeConfigStatus;
}

export interface SlackRouteJsonResult {
  body: unknown;
  status?: number;
}

interface SlackBlockActionPayload {
  type: 'block_actions';
  actions: Array<{ action_id: string; value?: string }>;
}

interface SlackShortcutPayload {
  type: 'shortcut';
  callback_id: string;
}

interface SlackViewSubmissionPayload {
  type: 'view_submission';
  view: { state: { values: unknown } };
}

type SlackInteractionPayload =
  | SlackBlockActionPayload
  | SlackShortcutPayload
  | SlackViewSubmissionPayload
  | { type: string };

export function parseSlackCommandPayload(body: string): SlackCommandPayload {
  const params = new URLSearchParams(body);

  return {
    token: params.get('token') || '',
    team_id: params.get('team_id') || '',
    team_domain: params.get('team_domain') || '',
    channel_id: params.get('channel_id') || '',
    channel_name: params.get('channel_name') || '',
    user_id: params.get('user_id') || '',
    user_name: params.get('user_name') || '',
    command: params.get('command') || '',
    text: params.get('text') || '',
    response_url: params.get('response_url') || '',
    trigger_id: params.get('trigger_id') || '',
  };
}

export function createSlackCommandResponse(payload: SlackCommandPayload): SlackResponse {
  const text = payload.text.trim().toLowerCase();

  if (!text || text === 'help' || text === '?') {
    return createHelpResponse();
  }

  if (text === 'list') {
    return createListResponse(getAllTimezones());
  }

  if (text.startsWith('search ')) {
    const query = payload.text.trim().slice(7).trim();
    return createSearchResponse(query, searchTimezones(query));
  }

  const conversionResult = convertTimezoneCommand(payload.text);
  if (!conversionResult) {
    return createErrorResponse(
      'Could not understand the time conversion request. Type `/tz help` for usage examples.'
    );
  }

  const { conversions } = conversionResult;
  if (conversions.length === 0) {
    return createErrorResponse(
      'No valid timezones found for conversion. Please check your timezone names.'
    );
  }

  const sourceSummary = getTimezoneCommandSourceSummary(conversionResult);
  return createTimezoneResponse(conversions, sourceSummary?.time, sourceSummary?.timezone);
}

export async function handleSlackEventEnvelope(
  payload: SlackEventEnvelope,
  adapter: SlackEventAdapter
): Promise<SlackRouteJsonResult> {
  if (payload.type === 'url_verification') {
    return { body: { challenge: payload.challenge } };
  }

  if (payload.type === 'event_callback' && payload.event) {
    logger.info('Slack event callback received', { eventType: payload.event.type });
    await handleSlackEvent(payload.event, adapter);
    return { body: { status: 'ok' } };
  }

  logger.info('Unhandled Slack event envelope', { payloadType: payload.type });
  return { body: { status: 'ok' } };
}

export function parseSlackInteractionPayload(body: string): SlackInteractionPayload | null {
  const params = new URLSearchParams(body);
  const payload = params.get('payload');

  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as SlackInteractionPayload;
}

export function createSlackInteractionResponse(payload: SlackInteractionPayload): SlackResponse {
  if (isSlackBlockActionPayload(payload)) {
    return createSlackBlockActionResponse(payload);
  }

  if (isSlackShortcutPayload(payload)) {
    return createSlackShortcutResponse(payload);
  }

  if (isSlackViewSubmissionPayload(payload)) {
    return createSlackViewSubmissionResponse(payload);
  }

  logger.info('Unhandled Slack interaction type', { interactionType: payload.type });
  return {
    response_type: 'ephemeral',
    text: 'Interaction type not supported',
  };
}

export async function handleSlackAutoJoin(
  adapter: SlackOperationsAdapter
): Promise<{ message: string; results: SlackAutoJoinResult[] }> {
  const channels = await adapter.listPublicChannels();

  if (channels.length === 0) {
    return {
      message: 'Auto-join completed',
      results: [],
    };
  }

  const results: SlackAutoJoinResult[] = [];

  for (const channel of channels) {
    if (!channel.id) {
      results.push({ channel: channel.name, status: 'skipped', error: 'Missing channel id' });
      continue;
    }

    if (channel.isMember) {
      results.push({ channel: channel.name, status: 'already_member' });
      continue;
    }

    try {
      await adapter.joinChannel(channel.id);
      results.push({ channel: channel.name, status: 'joined' });
    } catch (error) {
      results.push({
        channel: channel.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    message: 'Auto-join completed',
    results,
  };
}

export async function runSlackDiagnostics(
  adapter: SlackOperationsAdapter,
  environment: RuntimeConfigStatus
): Promise<SlackDiagnosticsResult> {
  const botInfo = await adapter.getBotInfo();
  const authTest = await adapter.authTest();
  let channels: SlackChannelSummary[] = [];

  try {
    channels = await adapter.listVisibleChannels(10);
  } catch (error) {
    logger.warn('Slack diagnostics could not list channels', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return {
    success: true,
    botInfo,
    authTest,
    channels,
    environment,
  };
}

export async function sendSlackTestMessage(
  adapter: SlackOperationsAdapter,
  input: { channel?: string; message?: string }
): Promise<SlackRouteJsonResult> {
  if (!input.channel || !input.message) {
    return {
      body: { error: 'Missing channel or message' },
      status: 400,
    };
  }

  const result = await adapter.postMessage(input.channel, `🧪 Test message: ${input.message}`);

  return {
    body: {
      success: true,
      result,
    },
  };
}

export function testSlackPatternDetection(text: string) {
  const matches = detectTimezoneConversions(text);
  const converted = matches.map(match => convertTimezoneMatch(match));

  return {
    input: text,
    matches,
    converted,
    success: converted.length > 0,
  };
}

export async function handleSlackEvent(
  event: SlackEvent,
  adapter: SlackEventAdapter
): Promise<void> {
  if (isSlackMessageEvent(event)) {
    await handleSlackMessageEvent(event, adapter);
    return;
  }

  if (isSlackChannelCreatedEvent(event)) {
    await handleSlackChannelCreatedEvent(event, adapter);
  }
}

async function handleSlackMessageEvent(
  event: Required<Pick<SlackMessageEvent, 'text' | 'user' | 'channel' | 'ts'>> & SlackMessageEvent,
  adapter: SlackEventAdapter
): Promise<void> {
  const botInfo = await adapter.getBotInfo();
  if (!shouldProcessMessage(event.text, event.user, botInfo?.userId)) {
    return;
  }

  const matches = detectTimezoneConversions(event.text);
  for (const match of matches) {
    const converted = convertTimezoneMatch(match);
    if (converted.formattedResponse) {
      await adapter.sendSimpleReply(event.channel, event.ts, converted.formattedResponse);
    }
  }
}

async function handleSlackChannelCreatedEvent(
  event: Required<Pick<SlackChannelCreatedEvent, 'channel'>> & SlackChannelCreatedEvent,
  adapter: SlackEventAdapter
): Promise<void> {
  if (event.channel.id) {
    await adapter.joinChannel(event.channel.id);
  }
}

function createSlackBlockActionResponse(payload: SlackBlockActionPayload): SlackResponse {
  const action = payload.actions[0];

  if (action?.action_id !== 'convert_timezone' || !action.value) {
    return {
      response_type: 'ephemeral',
      text: 'Action not recognized',
    };
  }

  const [sourceTimeValue, sourceTimezone, targetTimezone] = action.value.split('|');
  const sourceTime = new Date(sourceTimeValue);

  if (Number.isNaN(sourceTime.getTime()) || !sourceTimezone || !targetTimezone) {
    return createErrorResponse('Error converting timezone');
  }

  const conversions = convertTimeToTimezones(sourceTime, sourceTimezone, [targetTimezone]);
  if (conversions.length === 0) {
    return createErrorResponse('Error converting timezone');
  }

  const conversion = conversions[0];
  const originalTime = sourceTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    response_type: 'ephemeral',
    text: `🕐 ${originalTime} ${sourceTimezone} = ${conversion.time} ${conversion.offset} (${conversion.city})${conversion.dayDiff ? ` ${conversion.dayDiff}` : ''}`,
  };
}

function createSlackShortcutResponse(payload: SlackShortcutPayload): SlackResponse {
  if (payload.callback_id === 'timezone_converter') {
    return {
      response_type: 'ephemeral',
      text: 'Use `/tz` command for timezone conversions. Example: `/tz 3pm EST to PST`',
    };
  }

  return {
    response_type: 'ephemeral',
    text: 'Shortcut not recognized',
  };
}

function createSlackViewSubmissionResponse(
  _payload: SlackViewSubmissionPayload
): SlackResponse & { response_action: 'clear' } {
  return {
    response_action: 'clear',
  };
}

function isSlackBlockActionPayload(
  payload: SlackInteractionPayload
): payload is SlackBlockActionPayload {
  return payload.type === 'block_actions' && 'actions' in payload && Array.isArray(payload.actions);
}

function isSlackShortcutPayload(payload: SlackInteractionPayload): payload is SlackShortcutPayload {
  return payload.type === 'shortcut' && 'callback_id' in payload;
}

function isSlackViewSubmissionPayload(
  payload: SlackInteractionPayload
): payload is SlackViewSubmissionPayload {
  return payload.type === 'view_submission' && 'view' in payload;
}

function isSlackMessageEvent(
  event: SlackEvent
): event is Required<Pick<SlackMessageEvent, 'text' | 'user' | 'channel' | 'ts'>> &
  SlackMessageEvent {
  return (
    event.type === 'message' &&
    'text' in event &&
    typeof event.text === 'string' &&
    typeof event.user === 'string' &&
    typeof event.channel === 'string' &&
    typeof event.ts === 'string' &&
    !event.bot_id
  );
}

function isSlackChannelCreatedEvent(
  event: SlackEvent
): event is Required<Pick<SlackChannelCreatedEvent, 'channel'>> & SlackChannelCreatedEvent {
  return (
    event.type === 'channel_created' &&
    'channel' in event &&
    typeof event.channel === 'object' &&
    event.channel !== null
  );
}
