import { APIEmbed, InteractionResponseType } from 'discord.js';
import { verifyKey } from 'discord-interactions';
import type { TimezoneConversion } from './timezone-utils';

export interface DiscordInteractionPayload {
  id: string;
  type: number;
  token: string;
  version: number;
  application_id: string;
  data?: {
    id: string;
    name: string;
    type: number;
    options?: Array<{
      name: string;
      type: number;
      value: string;
    }>;
  };
  guild_id?: string;
  channel_id: string;
  member?: {
    user: {
      id: string;
      username: string;
      discriminator: string;
    };
  };
  user?: {
    id: string;
    username: string;
    discriminator: string;
  };
  message?: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      bot?: boolean;
    };
  };
}

export function verifyDiscordSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    console.error('DISCORD_PUBLIC_KEY environment variable is required');
    return false;
  }

  try {
    return verifyKey(body, signature, timestamp, publicKey);
  } catch (error) {
    console.error('Error verifying Discord signature:', error);
    return false;
  }
}

export function createDiscordResponse(content: string, ephemeral = false) {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content,
      flags: ephemeral ? 64 : 0, // 64 = EPHEMERAL flag
    },
  };
}

export function createDiscordEmbedResponse(
  conversions: TimezoneConversion[],
  sourceTimeString?: string,
  sourceTimezone?: string,
  ephemeral = false
) {
  const embed: APIEmbed = {
    color: 0x5865F2, // Discord blurple
    title: '🌍 Timezone Conversion',
    fields: [],
    timestamp: new Date().toISOString(),
  };

  if (sourceTimeString && sourceTimezone) {
    embed.description = `**Source:** ${sourceTimeString} (${sourceTimezone})`;
  } else {
    embed.description = '**Current time conversions:**';
  }

  conversions.forEach((conversion) => {
    const timeStr = conversion.time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: conversion.timezone,
    });

    const dateStr = conversion.time.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: conversion.timezone,
    });

    embed.fields?.push({
      name: `${conversion.abbreviation || conversion.timezone}`,
      value: `${timeStr}\n${dateStr}`,
      inline: true,
    });
  });

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [embed],
      flags: ephemeral ? 64 : 0,
    },
  };
}

export function createDiscordErrorResponse(message: string, ephemeral = true) {
  const embed: APIEmbed = {
    color: 0xFF0000, // Red color for errors
    title: '❌ Error',
    description: message,
    timestamp: new Date().toISOString(),
  };

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [embed],
      flags: ephemeral ? 64 : 0,
    },
  };
}

export function createDiscordHelpResponse(ephemeral = true) {
  const embed: APIEmbed = {
    color: 0x00FF00, // Green color for help
    title: '🕐 Timezone Converter Help',
    description: 'Convert times between different timezones',
    fields: [
      {
        name: 'Basic Usage',
        value: '`/tz 3pm EST to PST`\n`/tz 15:30 UTC to EST, PST`\n`/tz now PST to EST, JST`',
        inline: false,
      },
      {
        name: 'Supported Formats',
        value: '• 12-hour: `3pm`, `3:30pm`\n• 24-hour: `15:00`, `15:30`\n• Current time: `now`',
        inline: false,
      },
      {
        name: 'Common Timezones',
        value: '`EST`, `PST`, `UTC`, `GMT`, `CET`, `JST`\nAnd many more IANA timezone names!',
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [embed],
      flags: ephemeral ? 64 : 0,
    },
  };
}

export function shouldProcessDiscordMessage(
  content: string,
  authorId: string,
  botUserId?: string
): boolean {
  // Don't process messages from the bot itself
  if (botUserId && authorId === botUserId) {
    return false;
  }

  // Don't process empty messages
  if (!content || content.trim() === '') {
    return false;
  }

  // Use existing message parser to detect timezone conversions
  const { detectTimezoneConversions } = require('./message-parser');
  const matches = detectTimezoneConversions(content);
  return matches.length > 0;
}