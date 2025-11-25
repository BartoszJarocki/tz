import type {
  SlackBlock,
  SlackResponse,
  TimezoneConversion,
} from './types';

export function createTimezoneResponse(
  conversions: TimezoneConversion[],
  originalTime?: string,
  originalTimezone?: string
): SlackResponse {
  const headerText =
    originalTime && originalTimezone
      ? `${originalTime} ${originalTimezone}`
      : 'Time Conversion';

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🕐 ${headerText}`, emoji: true },
    },
    { type: 'divider' },
  ];

  // Create fields in pairs (2 per row)
  const fields: Array<{ type: 'mrkdwn'; text: string }> = [];
  for (const conv of conversions) {
    const dayIndicator = conv.dayDiff ? `  _(${conv.dayDiff})_` : '';
    fields.push({
      type: 'mrkdwn',
      text: `*${conv.city}*\n${conv.time} ${conv.offset}${dayIndicator}`,
    });
  }

  // Add fields in chunks of 10 (Slack limit per section)
  for (let i = 0; i < fields.length; i += 10) {
    blocks.push({
      type: 'section',
      fields: fields.slice(i, i + 10),
    });
  }

  return {
    response_type: 'ephemeral',
    text: formatPlainTextResponse(conversions, originalTime, originalTimezone),
    blocks,
  };
}

export function createErrorResponse(error: string, suggestion?: string): SlackResponse {
  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `⚠️ ${error}` },
    },
  ];

  if (suggestion) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: suggestion }],
    });
  }

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: 'Type `/tz help` for usage examples' }],
  });

  return {
    response_type: 'ephemeral',
    text: `❌ ${error}`,
    blocks,
  };
}

export function createHelpResponse(): SlackResponse {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🕐 Timezone Converter', emoji: true },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Quick Examples:*\n`/tz 3pm EST to PST` — Simple conversion\n`/tz now in London, Tokyo` — Current time in cities\n`/tz meeting at 10am PST` — Show in multiple zones',
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: '*Times*\n3pm, 15:00, 3:30pm, now' },
        { type: 'mrkdwn', text: '*Zones*\nEST, PST, CET, UTC, GMT, IST' },
        { type: 'mrkdwn', text: '*Cities*\nLondon, Tokyo, NYC, LA, Delhi' },
        { type: 'mrkdwn', text: '*Options*\n`--24h` for 24-hour format' },
      ],
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Other Commands:*\n`/tz list` — Show all timezones\n`/tz search india` — Search timezones',
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '💡 Auto-detect: Type `3PM EST -> PST` in any channel',
        },
      ],
    },
  ];

  return {
    response_type: 'ephemeral',
    text: 'Timezone Converter Help - Use /tz to convert times between timezones',
    blocks,
  };
}

export function createListResponse(
  timezones: Array<{ city: string; offset: string; timezone: string }>
): SlackResponse {
  // Group by region based on offset
  const groups: Record<string, typeof timezones> = {
    Americas: [],
    Europe: [],
    'Asia & Pacific': [],
  };

  for (const tz of timezones) {
    if (tz.timezone.startsWith('America/')) {
      groups.Americas.push(tz);
    } else if (tz.timezone.startsWith('Europe/') || tz.timezone.startsWith('Africa/')) {
      groups.Europe.push(tz);
    } else {
      groups['Asia & Pacific'].push(tz);
    }
  }

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🌍 Available Timezones', emoji: true },
    },
  ];

  for (const [region, tzList] of Object.entries(groups)) {
    if (tzList.length === 0) continue;

    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${region}*\n${tzList.map((tz) => `• ${tz.city} (${tz.offset})`).join('\n')}`,
      },
    });
  }

  return {
    response_type: 'ephemeral',
    text: 'Available timezones',
    blocks,
  };
}

export function createSearchResponse(
  query: string,
  results: Array<{ city: string; offset: string; timezone: string }>
): SlackResponse {
  if (results.length === 0) {
    return createErrorResponse(
      `No timezones found for "${query}"`,
      'Try searching by city name, country, or timezone abbreviation'
    );
  }

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🔍 Results for "${query}"`, emoji: true },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: results.map((r) => `• *${r.city}* — ${r.offset}`).join('\n'),
      },
    },
  ];

  return {
    response_type: 'ephemeral',
    text: `Search results for "${query}"`,
    blocks,
  };
}

// Fallback plain text for clients that don't support blocks
function formatPlainTextResponse(
  conversions: TimezoneConversion[],
  originalTime?: string,
  originalTimezone?: string
): string {
  const title =
    originalTime && originalTimezone
      ? `🕐 ${originalTime} ${originalTimezone} converts to:`
      : '🕐 Time Conversion:';

  let text = `${title}\n`;
  for (const conv of conversions) {
    const dayIndicator = conv.dayDiff ? ` ${conv.dayDiff}` : '';
    text += `• ${conv.time} ${conv.offset} (${conv.city})${dayIndicator}\n`;
  }

  return text;
}
