import { getTimezoneOffset } from 'date-fns-tz';
import { getCityAbbreviationsForTimezone } from '@/utils/city-abbreviations';

export const ABSOLUTE_TIMEZONE = '__absolute__';
export const WILDCARD_TIMEZONE = '__wildcard__';

export const DEFAULT_TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

export const WILDCARD_TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Moscow',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

export interface TimezoneInfo {
  name: string;
  offset: number;
  cityAbbr: string;
  cityFull: string;
  utcOffset: string;
  tzAbbr: string;
  gradientTz: string;
}

export interface ListedTimezone {
  city: string;
  offset: string;
  timezone: string;
}

const TIMEZONE_CATALOG: readonly TimezoneInfo[] = [
  {
    offset: -12,
    cityAbbr: 'BAK',
    cityFull: 'Baker Island',
    utcOffset: '-12',
    tzAbbr: 'BIT',
    name: 'Etc/GMT+12',
    gradientTz: 'Etc/GMT+12',
  },
  {
    offset: -11,
    cityAbbr: 'PAG',
    cityFull: 'Pago Pago',
    utcOffset: '-11',
    tzAbbr: 'SST',
    name: 'Pacific/Pago_Pago',
    gradientTz: 'Etc/GMT+11',
  },
  {
    offset: -10,
    cityAbbr: 'HON',
    cityFull: 'Honolulu',
    utcOffset: '-10',
    tzAbbr: 'HST',
    name: 'Pacific/Honolulu',
    gradientTz: 'Etc/GMT+10',
  },
  {
    offset: -9,
    cityAbbr: 'ANC',
    cityFull: 'Anchorage',
    utcOffset: '-9',
    tzAbbr: 'AKST',
    name: 'America/Anchorage',
    gradientTz: 'Etc/GMT+9',
  },
  {
    offset: -8,
    cityAbbr: 'LA',
    cityFull: 'Los Angeles',
    utcOffset: '-8',
    tzAbbr: 'PST',
    name: 'America/Los_Angeles',
    gradientTz: 'Etc/GMT+8',
  },
  {
    offset: -7,
    cityAbbr: 'DEN',
    cityFull: 'Denver',
    utcOffset: '-7',
    tzAbbr: 'MST',
    name: 'America/Denver',
    gradientTz: 'Etc/GMT+7',
  },
  {
    offset: -6,
    cityAbbr: 'CHI',
    cityFull: 'Chicago',
    utcOffset: '-6',
    tzAbbr: 'CST',
    name: 'America/Chicago',
    gradientTz: 'Etc/GMT+6',
  },
  {
    offset: -5,
    cityAbbr: 'NYC',
    cityFull: 'New York City',
    utcOffset: '-5',
    tzAbbr: 'EST',
    name: 'America/New_York',
    gradientTz: 'Etc/GMT+5',
  },
  {
    offset: -4,
    cityAbbr: 'HAL',
    cityFull: 'Halifax',
    utcOffset: '-4',
    tzAbbr: 'AST',
    name: 'America/Halifax',
    gradientTz: 'Etc/GMT+4',
  },
  {
    offset: -3,
    cityAbbr: 'RIO',
    cityFull: 'Rio de Janeiro',
    utcOffset: '-3',
    tzAbbr: 'BRT',
    name: 'America/Sao_Paulo',
    gradientTz: 'Etc/GMT+3',
  },
  {
    offset: -2,
    cityAbbr: 'FER',
    cityFull: 'Fernando de Noronha',
    utcOffset: '-2',
    tzAbbr: 'FNT',
    name: 'America/Noronha',
    gradientTz: 'Etc/GMT+2',
  },
  {
    offset: -1,
    cityAbbr: 'PRA',
    cityFull: 'Praia',
    utcOffset: '-1',
    tzAbbr: 'CVT',
    name: 'Atlantic/Cape_Verde',
    gradientTz: 'Etc/GMT+1',
  },
  {
    offset: 0,
    cityAbbr: 'UTC',
    cityFull: 'UTC',
    utcOffset: '+0',
    tzAbbr: 'UTC',
    name: 'UTC',
    gradientTz: 'Etc/GMT+0',
  },
  {
    offset: 0,
    cityAbbr: 'LON',
    cityFull: 'London',
    utcOffset: '+0',
    tzAbbr: 'GMT',
    name: 'Europe/London',
    gradientTz: 'Etc/GMT+0',
  },
  {
    offset: 1,
    cityAbbr: 'PAR',
    cityFull: 'Paris',
    utcOffset: '+1',
    tzAbbr: 'CET',
    name: 'Europe/Paris',
    gradientTz: 'Etc/GMT-1',
  },
  {
    offset: 2,
    cityAbbr: 'CAI',
    cityFull: 'Cairo',
    utcOffset: '+2',
    tzAbbr: 'EET',
    name: 'Africa/Cairo',
    gradientTz: 'Etc/GMT-2',
  },
  {
    offset: 3,
    cityAbbr: 'MOS',
    cityFull: 'Moscow',
    utcOffset: '+3',
    tzAbbr: 'MSK',
    name: 'Europe/Moscow',
    gradientTz: 'Etc/GMT-3',
  },
  {
    offset: 3.5,
    cityAbbr: 'THR',
    cityFull: 'Tehran',
    utcOffset: '+3:30',
    tzAbbr: 'IRST',
    name: 'Asia/Tehran',
    gradientTz: 'Etc/GMT-3',
  },
  {
    offset: 4,
    cityAbbr: 'DUB',
    cityFull: 'Dubai',
    utcOffset: '+4',
    tzAbbr: 'GST',
    name: 'Asia/Dubai',
    gradientTz: 'Etc/GMT-4',
  },
  {
    offset: 5,
    cityAbbr: 'KAR',
    cityFull: 'Karachi',
    utcOffset: '+5',
    tzAbbr: 'PKT',
    name: 'Asia/Karachi',
    gradientTz: 'Etc/GMT-5',
  },
  {
    offset: 5.5,
    cityAbbr: 'DEL',
    cityFull: 'Delhi',
    utcOffset: '+5:30',
    tzAbbr: 'IST',
    name: 'Asia/Kolkata',
    gradientTz: 'Etc/GMT-5',
  },
  {
    offset: 5.75,
    cityAbbr: 'KTM',
    cityFull: 'Kathmandu',
    utcOffset: '+5:45',
    tzAbbr: 'NPT',
    name: 'Asia/Kathmandu',
    gradientTz: 'Etc/GMT-6',
  },
  {
    offset: 6,
    cityAbbr: 'DHK',
    cityFull: 'Dhaka',
    utcOffset: '+6',
    tzAbbr: 'BST',
    name: 'Asia/Dhaka',
    gradientTz: 'Etc/GMT-6',
  },
  {
    offset: 7,
    cityAbbr: 'BKK',
    cityFull: 'Bangkok',
    utcOffset: '+7',
    tzAbbr: 'ICT',
    name: 'Asia/Bangkok',
    gradientTz: 'Etc/GMT-7',
  },
  {
    offset: 8,
    cityAbbr: 'SIN',
    cityFull: 'Singapore',
    utcOffset: '+8',
    tzAbbr: 'SGT',
    name: 'Asia/Singapore',
    gradientTz: 'Etc/GMT-8',
  },
  {
    offset: 9,
    cityAbbr: 'TOK',
    cityFull: 'Tokyo',
    utcOffset: '+9',
    tzAbbr: 'JST',
    name: 'Asia/Tokyo',
    gradientTz: 'Etc/GMT-9',
  },
  {
    offset: 9.5,
    cityAbbr: 'ADL',
    cityFull: 'Adelaide',
    utcOffset: '+9:30',
    tzAbbr: 'ACST',
    name: 'Australia/Adelaide',
    gradientTz: 'Etc/GMT-9',
  },
  {
    offset: 10,
    cityAbbr: 'SYD',
    cityFull: 'Sydney',
    utcOffset: '+10',
    tzAbbr: 'AEST',
    name: 'Australia/Sydney',
    gradientTz: 'Etc/GMT-10',
  },
  {
    offset: 11,
    cityAbbr: 'NOU',
    cityFull: 'Noumea',
    utcOffset: '+11',
    tzAbbr: 'NCT',
    name: 'Pacific/Noumea',
    gradientTz: 'Etc/GMT-11',
  },
  {
    offset: 12,
    cityAbbr: 'AKL',
    cityFull: 'Auckland',
    utcOffset: '+12',
    tzAbbr: 'NZST',
    name: 'Pacific/Auckland',
    gradientTz: 'Etc/GMT-12',
  },
];

const TIMEZONE_ALIASES: Record<string, string> = {
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
  IST: 'Asia/Kolkata',
  NPT: 'Asia/Kathmandu',
  IRST: 'Asia/Tehran',
  ACST: 'Australia/Adelaide',
  AEST: 'Australia/Sydney',
  AEDT: 'Australia/Sydney',
};

const CITY_ALIASES: Record<string, string> = {
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
  DEL: 'Asia/Kolkata',
  BOM: 'Asia/Kolkata',
  KTM: 'Asia/Kathmandu',
  THR: 'Asia/Tehran',
  ADL: 'Australia/Adelaide',
};

const TIMEZONE_BY_NAME = new Map(TIMEZONE_CATALOG.map(timezone => [timezone.name, timezone]));

export function getHourlyTimezones(): TimezoneInfo[] {
  return TIMEZONE_CATALOG.filter(timezone => Number.isInteger(timezone.offset));
}

export function getAllTimezoneData(): TimezoneInfo[] {
  return [...TIMEZONE_CATALOG];
}

export function getTimezoneInfo(timezone: string): TimezoneInfo | null {
  return TIMEZONE_BY_NAME.get(timezone) ?? null;
}

export function getDefaultTimezones(): string[] {
  return [...DEFAULT_TIMEZONES];
}

export function getWildcardTimezones(): string[] {
  return [...WILDCARD_TIMEZONES];
}

export function isAbsoluteTimezone(timezone: string): boolean {
  return timezone === ABSOLUTE_TIMEZONE;
}

export function isWildcardTimezone(timezone: string): boolean {
  return timezone === WILDCARD_TIMEZONE;
}

export function resolveTimezone(input: string): string | null {
  const trimmed = input.trim().replace(/^[,.;:!?]+|[,.;:!?]+$/g, '');
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.toUpperCase();
  if (normalized === '*') {
    return WILDCARD_TIMEZONE;
  }

  const alias = TIMEZONE_ALIASES[normalized] ?? CITY_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  const directMatch = TIMEZONE_CATALOG.find(
    timezone => timezone.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (directMatch) {
    return directMatch.name;
  }

  const cityMatch = TIMEZONE_CATALOG.find(
    timezone =>
      timezone.cityFull.toLowerCase().includes(trimmed.toLowerCase()) ||
      timezone.cityAbbr.toLowerCase() === normalized.toLowerCase()
  );
  if (cityMatch) {
    return cityMatch.name;
  }

  const offsetCityMatch = TIMEZONE_CATALOG.find(timezone =>
    getCityAbbreviationsForTimezone(timezone.offset).includes(normalized)
  );

  return offsetCityMatch?.name ?? null;
}

export function resolveTimezoneTargets(inputs: string[]): string[] {
  const resolved = inputs
    .map(input => resolveTimezone(input))
    .filter((timezone): timezone is string => timezone !== null);

  if (resolved.some(isWildcardTimezone)) {
    return getWildcardTimezones();
  }

  return resolved;
}

export function findClosestTimezone(timezones: TimezoneInfo[], userOffset: number): string {
  const now = new Date();
  return timezones.reduce((closest, timezone) => {
    const currentOffsetMs = getTimezoneOffset(timezone.name, now);
    const closestOffsetMs = getTimezoneOffset(closest.name, now);

    const currentOffset = currentOffsetMs / (1000 * 60 * 60);
    const closestOffset = closestOffsetMs / (1000 * 60 * 60);

    return Math.abs(currentOffset - userOffset) < Math.abs(closestOffset - userOffset)
      ? timezone
      : closest;
  }).name;
}

export function getTimezoneDisplayName(timezone: string): string {
  if (isAbsoluteTimezone(timezone)) {
    return 'Local';
  }

  const timezoneInfo = getTimezoneInfo(timezone);
  if (timezoneInfo) {
    return timezoneInfo.cityFull;
  }

  return timezone.split('/').pop()?.replace('_', ' ') || timezone;
}

export function getTimezoneAbbreviation(timezone: string): string {
  if (isAbsoluteTimezone(timezone)) {
    return 'Local';
  }

  const timezoneInfo = getTimezoneInfo(timezone);
  if (timezoneInfo) {
    return timezoneInfo.tzAbbr;
  }

  return timezone.split('/').pop()?.replace('_', ' ') || 'TZ';
}

export function searchTimezonesByCity(cityQuery: string): TimezoneInfo[] {
  const query = cityQuery.toLowerCase().trim();

  return TIMEZONE_CATALOG.filter(
    timezone =>
      timezone.cityFull.toLowerCase().includes(query) ||
      timezone.cityAbbr.toLowerCase().includes(query) ||
      timezone.name.toLowerCase().includes(query)
  ).sort((a, b) => {
    const aExact = a.cityFull.toLowerCase() === query || a.cityAbbr.toLowerCase() === query;
    const bExact = b.cityFull.toLowerCase() === query || b.cityAbbr.toLowerCase() === query;

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    return a.cityFull.localeCompare(b.cityFull);
  });
}

export function getAllTimezones(): ListedTimezone[] {
  return [...TIMEZONE_CATALOG]
    .sort((a, b) => a.offset - b.offset || a.cityFull.localeCompare(b.cityFull))
    .map(formatListedTimezone);
}

export function searchTimezones(query: string): ListedTimezone[] {
  const normalizedQuery = query.toLowerCase().trim();

  return TIMEZONE_CATALOG.filter(
    timezone =>
      timezone.cityFull.toLowerCase().includes(normalizedQuery) ||
      timezone.cityAbbr.toLowerCase().includes(normalizedQuery) ||
      timezone.name.toLowerCase().includes(normalizedQuery) ||
      timezone.tzAbbr.toLowerCase().includes(normalizedQuery) ||
      timezone.utcOffset.includes(normalizedQuery)
  )
    .sort((a, b) => {
      const aExact =
        a.cityFull.toLowerCase() === normalizedQuery ||
        a.cityAbbr.toLowerCase() === normalizedQuery ||
        a.tzAbbr.toLowerCase() === normalizedQuery;
      const bExact =
        b.cityFull.toLowerCase() === normalizedQuery ||
        b.cityAbbr.toLowerCase() === normalizedQuery ||
        b.tzAbbr.toLowerCase() === normalizedQuery;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.offset - b.offset || a.cityFull.localeCompare(b.cityFull);
    })
    .map(formatListedTimezone);
}

function formatListedTimezone(timezone: TimezoneInfo): ListedTimezone {
  return {
    city: timezone.cityFull,
    offset: `UTC${timezone.utcOffset.startsWith('-') ? '' : '+'}${timezone.utcOffset}`,
    timezone: timezone.name,
  };
}
