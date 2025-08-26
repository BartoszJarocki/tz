import crypto from 'node:crypto';
import { formatInTimeZone } from 'date-fns-tz';

export interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export interface SlackResponse {
  response_type?: 'ephemeral' | 'in_channel';
  text?: string;
  blocks?: unknown[];
  attachments?: unknown[];
}

export function verifySlackSignature(signature: string, timestamp: string, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    throw new Error('SLACK_SIGNING_SECRET is not set');
  }

  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - Number.parseInt(timestamp, 10)) > 300) {
    return false;
  }

  const baseString = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${crypto.createHmac('sha256', signingSecret).update(baseString, 'utf8').digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(mySignature, 'utf8'), Buffer.from(signature, 'utf8'));
}

export function createTimezoneResponse(
  conversions: Array<{
    timezone: string;
    city: string;
    time: string;
    offset: string;
    dayDiff?: string;
  }>,
  originalTime?: string,
  originalTimezone?: string
): SlackResponse {
  const title =
    originalTime && originalTimezone
      ? `🕐  ${originalTime} ${originalTimezone} converts to:`
      : '🕐  Time Conversion:';

  let text = `${title}\n`;

  for (const conv of conversions) {
    const dayIndicator = conv.dayDiff ? ` ${conv.dayDiff}` : '';
    text += `• ${conv.time} ${conv.offset} (${conv.city})${dayIndicator}\n`;
  }

  return {
    response_type: 'ephemeral',
    text,
  };
}

export function createErrorResponse(error: string): SlackResponse {
  return {
    response_type: 'ephemeral',
    text: `❌  ${error}`,
  };
}

export function createHelpResponse(): SlackResponse {
  const helpText = `🕐  **Timezone Converter Help**

**Usage examples:**
• \`/tz 3pm EST to PST\` - Convert 3pm EST to PST
• \`/tz 14:00 Paris to Tokyo\` - Convert 2pm Paris time to Tokyo
• \`/tz now in London\` - Show current time in London
• \`/tz now in London, Paris, Tokyo\` - Show current time in multiple cities
• \`/tz meeting at 10am PST\` - Show 10am PST in multiple timezones

**Supported formats:**
• Times: 3pm, 15:00, 3:30pm, now
• Timezones: EST, PST, CET, UTC, GMT
• Cities: New York, London, Tokyo, Paris, etc.
• Abbreviations: NYC, LON, TOK, PAR, etc.`;

  return {
    response_type: 'ephemeral',
    text: helpText,
  };
}

export function formatTimeWithDay(
  date: Date,
  timezone: string
): {
  time: string;
  dayDiff: string | undefined;
} {
  const now = new Date();
  const targetTime = new Date(date.getTime());

  const nowDay = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const targetDay = Math.floor(targetTime.getTime() / (1000 * 60 * 60 * 24));

  let dayDiff: string | undefined;
  const dayDifference = targetDay - nowDay;

  if (dayDifference === 1) {
    dayDiff = '+1 day';
  } else if (dayDifference === -1) {
    dayDiff = '-1 day';
  } else if (dayDifference > 1) {
    dayDiff = `+${dayDifference} days`;
  } else if (dayDifference < -1) {
    dayDiff = `${dayDifference} days`;
  }

  const time = formatInTimeZone(targetTime, timezone, 'h:mm a');

  return { time, dayDiff };
}
