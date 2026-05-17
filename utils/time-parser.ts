import * as chrono from 'chrono-node';
import {
  ABSOLUTE_TIMEZONE,
  getDefaultTimezones,
  resolveTimezone,
  resolveTimezoneTargets,
} from '@/utils/timezone-catalog';

export interface ParsedTimeCommand {
  sourceTime: Date;
  sourceTimezone: string;
  targetTimezones: string[];
  originalText: string;
  isNow: boolean;
}

export interface TimezoneMatch {
  timezone: string;
  confidence: number;
}

export function parseTimeCommand(text: string): ParsedTimeCommand | null {
  const cleanText = text.trim().toLowerCase();

  if (!cleanText) return null;

  // Check for help command
  if (cleanText === 'help' || cleanText === '?') {
    return null; // Let the main handler show help
  }

  // Parse different command patterns
  const patterns = [
    // "3pm EST to PST" or "3 pm EST to PST"
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?) (\w+) to (.+)/i,
    // "14:00 Paris to Tokyo"
    /(\d{1,2}:\d{2}) (\w+) to (.+)/i,
    // "now in London" or "now in London, Paris, Tokyo"
    /(now) in (.+)/i,
    // "meeting at 10am PST" or "at 10 am PST"
    /(?:meeting\s+)?at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?) (\w+)/i,
    // Just timezone conversion "3pm EST" or "3 pm EST"
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?) (\w+)$/i,
  ];

  let matches: RegExpMatchArray | null = null;
  let patternType = 0;

  for (let i = 0; i < patterns.length; i++) {
    matches = cleanText.match(patterns[i]);
    if (matches) {
      patternType = i;
      break;
    }
  }

  if (!matches) {
    // Try to parse as natural language
    const parsed = chrono.parseDate(cleanText);
    if (parsed) {
      return {
        sourceTime: parsed,
        sourceTimezone: ABSOLUTE_TIMEZONE, // Natural language parsing gives absolute time
        targetTimezones: getDefaultTimezones(),
        originalText: text,
        isNow: false,
      };
    }
    return null;
  }

  let sourceTime: Date;
  let sourceTimezone: string;
  let targetTimezones: string[];
  const isNow = matches[1]?.toLowerCase() === 'now';

  switch (patternType) {
    case 0: // "3pm EST to PST" or "3pm EST to PST, CET, JST"
    case 1: {
      // "14:00 Paris to Tokyo"
      sourceTime = parseTimeString(matches[1]);
      const resolvedSourceTimezone = resolveTimezone(matches[2]);
      if (!resolvedSourceTimezone) {
        return null;
      }
      sourceTimezone = resolvedSourceTimezone;
      // Handle multiple target timezones separated by commas
      const targets = matches[3].split(/[,\s]+/).filter(tz => tz.length > 0);
      targetTimezones = resolveTimezoneTargets(targets);
      break;
    }

    case 2: {
      // "now in London" or "now in London, Paris, Tokyo" or "now in *"
      sourceTime = new Date();
      sourceTimezone = ABSOLUTE_TIMEZONE; // Special token for absolute time
      const cities = matches[2].split(/[,\s]+/).filter(city => city.length > 0);
      targetTimezones = resolveTimezoneTargets(cities);
      break;
    }

    case 3: // "meeting at 10am PST"
    case 4: // "3pm EST"
      sourceTime = parseTimeString(matches[1]);
      {
        const resolvedSourceTimezone = resolveTimezone(matches[2]);
        if (!resolvedSourceTimezone) {
          return null;
        }
        sourceTimezone = resolvedSourceTimezone;
      }
      targetTimezones = getDefaultTimezones().filter(tz => tz !== sourceTimezone);
      break;

    default:
      return null;
  }

  if (targetTimezones.length === 0) {
    targetTimezones = getDefaultTimezones();
  }

  return {
    sourceTime,
    sourceTimezone,
    targetTimezones,
    originalText: text,
    isNow,
  };
}

function parseTimeString(timeStr: string): Date {
  const now = new Date();

  // Handle "now"
  if (timeStr.toLowerCase() === 'now') {
    return now;
  }

  // Try chrono-node first
  const chronoParsed = chrono.parseDate(timeStr);
  if (chronoParsed) {
    return chronoParsed;
  }

  // Manual parsing for common formats, handle spaces before am/pm
  const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(?:(am|pm))?/i);
  if (timeMatch) {
    const hours = Number.parseInt(timeMatch[1], 10);
    const minutes = Number.parseInt(timeMatch[2] || '0', 10);
    const period = timeMatch[3]?.toLowerCase();

    let hour24 = hours;
    if (period === 'pm' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'am' && hours === 12) {
      hour24 = 0;
    }

    const date = new Date(now);
    date.setHours(hour24, minutes, 0, 0);
    return date;
  }

  return now;
}

export function extractTimezonesFromText(text: string): string[] {
  if (!text || text.trim() === '') {
    return [];
  }

  const words = text.split(/\s+/).filter(word => word.length > 0);
  const timezones: string[] = [];

  for (const word of words) {
    const timezone = resolveTimezone(word);
    if (timezone) {
      timezones.push(timezone);
    }
  }

  return timezones;
}
