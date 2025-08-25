import { parseTimeCommand } from './time-parser';
import { convertTimeToTimezones } from './timezone-utils';

export interface TimezoneConversionMatch {
  originalText: string;
  sourceTime: string;
  sourceTimezone: string;
  targetTimezone: string;
  convertedTime?: string;
  formattedResponse?: string;
}

export function detectTimezoneConversions(text: string): TimezoneConversionMatch[] {
  const matches: TimezoneConversionMatch[] = [];

  // Pattern to match: "time TZ -> TZ" or "time TZ to TZ"
  const pattern = /(\d{1,2}(?::\d{2})?(?:am|pm)?)\s*([A-Z]{2,4})\s*(?:->|to)\s*([A-Z]{2,4})/gi;

  for (const match of text.matchAll(pattern)) {
    const fullMatch = match[0];
    const sourceTime = match[1];
    const sourceTimezone = match[2];
    const targetTimezone = match[3];

    matches.push({
      originalText: fullMatch,
      sourceTime,
      sourceTimezone,
      targetTimezone,
    });
  }

  return matches;
}

export function convertTimezoneMatch(match: TimezoneConversionMatch): TimezoneConversionMatch {
  try {
    // Use existing parser to handle the conversion
    const commandText = `${match.sourceTime} ${match.sourceTimezone} to ${match.targetTimezone}`;
    const parsed = parseTimeCommand(commandText);

    if (!parsed) {
      return { ...match, formattedResponse: 'Could not parse time conversion' };
    }

    const conversions = convertTimeToTimezones(
      parsed.sourceTime,
      parsed.sourceTimezone,
      parsed.targetTimezones
    );

    if (conversions.length === 0) {
      return { ...match, formattedResponse: 'Could not convert timezone' };
    }

    const conversion = conversions[0];

    // Format: "3:00PM EST (21:00 CEST)"
    const sourceFormatted = formatTimeForDisplay(parsed.sourceTime, parsed.sourceTimezone);
    const targetFormatted = formatTimeForDisplay(parsed.sourceTime, conversion.timezone);

    const formattedResponse = `${targetFormatted} (${sourceFormatted})`;

    return {
      ...match,
      convertedTime: conversion.time,
      formattedResponse,
    };
  } catch (error) {
    console.error('Error converting timezone match:', error);
    return { ...match, formattedResponse: 'Error converting timezone' };
  }
}

function formatTimeForDisplay(date: Date, timezone: string): string {
  try {
    // Format time in 12-hour format with timezone abbreviation
    const timeStr = date.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Get timezone abbreviation
    const tzAbbr = getTimezoneAbbreviation(timezone);

    return `${timeStr} ${tzAbbr}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
}

function getTimezoneAbbreviation(timezone: string): string {
  // Common timezone abbreviations
  const abbreviations: { [key: string]: string } = {
    'America/New_York': 'EST',
    'America/Los_Angeles': 'PST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEST',
    UTC: 'UTC',
  };

  return abbreviations[timezone] || timezone.split('/').pop() || 'TZ';
}

export function shouldProcessMessage(text: string, userId: string, botUserId?: string): boolean {
  // Don't process messages from the bot itself
  if (botUserId && userId === botUserId) {
    return false;
  }

  // Check if message contains timezone conversion pattern
  const matches = detectTimezoneConversions(text);
  return matches.length > 0;
}
