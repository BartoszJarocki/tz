import * as chrono from 'chrono-node';
import { getCityAbbreviationsForTimezone } from '@/utils/city-abbreviations';
import { getHourlyTimezones } from '@/utils/timezone-utils';

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

const TIMEZONE_ALIASES = {
  EST: 'America/New_York',
  EDT: 'America/New_York',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  GMT: 'Europe/London',
  UTC: 'UTC',
  CET: 'Europe/Paris',
  CEST: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  SGT: 'Asia/Singapore',
  AEST: 'Australia/Sydney',
  AEDT: 'Australia/Sydney',
};

const CITY_ALIASES = {
  NYC: 'America/New_York',
  LA: 'America/Los_Angeles',
  CHI: 'America/Chicago',
  LON: 'Europe/London',
  PAR: 'Europe/Paris',
  TOK: 'Asia/Tokyo',
  SYD: 'Australia/Sydney',
  SIN: 'Asia/Singapore',
  HKG: 'Asia/Hong_Kong',
  BKK: 'Asia/Bangkok',
  DUB: 'Asia/Dubai',
  MOS: 'Europe/Moscow',
  CAI: 'Africa/Cairo',
};

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
        sourceTimezone: '__absolute__', // Natural language parsing gives absolute time
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
      sourceTimezone = resolveTimezone(matches[2]);
      // Handle multiple target timezones separated by commas
      const targets = matches[3].split(/[,\s]+/).filter(tz => tz.length > 0);
      targetTimezones = targets.map(tz => resolveTimezone(tz));
      break;
    }

    case 2: {
      // "now in London" or "now in London, Paris, Tokyo"
      sourceTime = new Date();
      sourceTimezone = '__absolute__'; // Special token for absolute time
      const cities = matches[2].split(/[,\s]+/).filter(city => city.length > 0);
      targetTimezones = cities.map(city => resolveTimezone(city));
      break;
    }

    case 3: // "meeting at 10am PST"
    case 4: // "3pm EST"
      sourceTime = parseTimeString(matches[1]);
      sourceTimezone = resolveTimezone(matches[2]);
      targetTimezones = getDefaultTimezones().filter(tz => tz !== sourceTimezone);
      break;

    default:
      return null;
  }

  // Filter out invalid timezones
  targetTimezones = targetTimezones.filter(tz => tz !== 'Unknown');

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
    const hours = Number.parseInt(timeMatch[1]);
    const minutes = Number.parseInt(timeMatch[2] || '0');
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

function resolveTimezone(input: string): string {
  const normalized = input.trim().toUpperCase();

  // Check direct aliases
  if (TIMEZONE_ALIASES[normalized]) {
    return TIMEZONE_ALIASES[normalized];
  }

  if (CITY_ALIASES[normalized]) {
    return CITY_ALIASES[normalized];
  }

  // Check if it's a full timezone name
  const timezones = getHourlyTimezones();
  const directMatch = timezones.find(tz => tz.name.toLowerCase() === input.toLowerCase());
  if (directMatch) {
    return directMatch.name;
  }

  // Fuzzy matching for cities
  const cityMatch = timezones.find(
    tz =>
      tz.cityFull.toLowerCase().includes(input.toLowerCase()) ||
      tz.cityAbbr.toLowerCase() === normalized.toLowerCase()
  );
  if (cityMatch) {
    return cityMatch.name;
  }

  // Check city abbreviations utility - need to find timezone by city abbrev
  const timezonesByAbbrev = timezones.filter(tz => {
    const abbrevs = getCityAbbreviationsForTimezone(tz.offset);
    return abbrevs.includes(normalized);
  });
  if (timezonesByAbbrev.length > 0) {
    return timezonesByAbbrev[0].name;
  }

  return 'Unknown';
}

function getDefaultTimezones(): string[] {
  return [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];
}

export function extractTimezonesFromText(text: string): string[] {
  if (!text || text.trim() === '') {
    return [];
  }

  const words = text.split(/\s+/).filter(word => word.length > 0);
  const timezones: string[] = [];

  for (const word of words) {
    const timezone = resolveTimezone(word);
    if (timezone !== 'Unknown') {
      timezones.push(timezone);
    }
  }

  return timezones;
}
