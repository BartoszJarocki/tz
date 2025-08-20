import { getTimezoneOffset } from 'date-fns-tz';

/**
 * Timezone information interface
 */
interface TimezoneInfo {
  /** Timezone name in IANA format */
  name: string;
  /** UTC offset in hours */
  offset: number;
  /** Three-letter city abbreviation */
  cityAbbr: string;
  /** Full city name */
  cityFull: string;
  /** UTC offset string representation */
  utcOffset: string;
  /** Timezone abbreviation (e.g., EST, PST, CET) */
  tzAbbr: string;
  /** Gradient timezone name for consistent color calculation */
  gradientTz: string;
}

/**
 * Gets a list of hourly timezones with their corresponding city information
 * @returns {TimezoneInfo[]} Array of timezone information
 */
export function getHourlyTimezones(): TimezoneInfo[] {
  const hourlyTimezones = [
    { offset: -12, cityAbbr: 'BAK', cityFull: 'Baker Island', utcOffset: '-12', tzAbbr: 'BIT', name: 'Etc/GMT+12', gradientTz: 'Etc/GMT+12' },
    { offset: -11, cityAbbr: 'PAG', cityFull: 'Pago Pago', utcOffset: '-11', tzAbbr: 'SST', name: 'Pacific/Pago_Pago', gradientTz: 'Etc/GMT+11' },
    { offset: -10, cityAbbr: 'HON', cityFull: 'Honolulu', utcOffset: '-10', tzAbbr: 'HST', name: 'Pacific/Honolulu', gradientTz: 'Etc/GMT+10' },
    { offset: -9, cityAbbr: 'ANC', cityFull: 'Anchorage', utcOffset: '-9', tzAbbr: 'AKST', name: 'America/Anchorage', gradientTz: 'Etc/GMT+9' },
    { offset: -8, cityAbbr: 'LA', cityFull: 'Los Angeles', utcOffset: '-8', tzAbbr: 'PST', name: 'America/Los_Angeles', gradientTz: 'Etc/GMT+8' },
    { offset: -7, cityAbbr: 'DEN', cityFull: 'Denver', utcOffset: '-7', tzAbbr: 'MST', name: 'America/Denver', gradientTz: 'Etc/GMT+7' },
    { offset: -6, cityAbbr: 'CHI', cityFull: 'Chicago', utcOffset: '-6', tzAbbr: 'CST', name: 'America/Chicago', gradientTz: 'Etc/GMT+6' },
    { offset: -5, cityAbbr: 'NYC', cityFull: 'New York City', utcOffset: '-5', tzAbbr: 'EST', name: 'America/New_York', gradientTz: 'Etc/GMT+5' },
    { offset: -4, cityAbbr: 'HAL', cityFull: 'Halifax', utcOffset: '-4', tzAbbr: 'AST', name: 'America/Halifax', gradientTz: 'Etc/GMT+4' },
    { offset: -3, cityAbbr: 'RIO', cityFull: 'Rio de Janeiro', utcOffset: '-3', tzAbbr: 'BRT', name: 'America/Sao_Paulo', gradientTz: 'Etc/GMT+3' },
    { offset: -2, cityAbbr: 'FER', cityFull: 'Fernando de Noronha', utcOffset: '-2', tzAbbr: 'FNT', name: 'America/Noronha', gradientTz: 'Etc/GMT+2' },
    { offset: -1, cityAbbr: 'PRA', cityFull: 'Praia', utcOffset: '-1', tzAbbr: 'CVT', name: 'Atlantic/Cape_Verde', gradientTz: 'Etc/GMT+1' },
    { offset: 0, cityAbbr: 'LON', cityFull: 'London', utcOffset: '+0', tzAbbr: 'GMT', name: 'Europe/London', gradientTz: 'Etc/GMT+0' },
    { offset: 1, cityAbbr: 'PAR', cityFull: 'Paris', utcOffset: '+1', tzAbbr: 'CET', name: 'Europe/Paris', gradientTz: 'Etc/GMT-1' },
    { offset: 2, cityAbbr: 'CAI', cityFull: 'Cairo', utcOffset: '+2', tzAbbr: 'EET', name: 'Africa/Cairo', gradientTz: 'Etc/GMT-2' },
    { offset: 3, cityAbbr: 'MOS', cityFull: 'Moscow', utcOffset: '+3', tzAbbr: 'MSK', name: 'Europe/Moscow', gradientTz: 'Etc/GMT-3' },
    { offset: 4, cityAbbr: 'DUB', cityFull: 'Dubai', utcOffset: '+4', tzAbbr: 'GST', name: 'Asia/Dubai', gradientTz: 'Etc/GMT-4' },
    { offset: 5, cityAbbr: 'KAR', cityFull: 'Karachi', utcOffset: '+5', tzAbbr: 'PKT', name: 'Asia/Karachi', gradientTz: 'Etc/GMT-5' },
    { offset: 6, cityAbbr: 'DHK', cityFull: 'Dhaka', utcOffset: '+6', tzAbbr: 'BST', name: 'Asia/Dhaka', gradientTz: 'Etc/GMT-6' },
    { offset: 7, cityAbbr: 'BKK', cityFull: 'Bangkok', utcOffset: '+7', tzAbbr: 'ICT', name: 'Asia/Bangkok', gradientTz: 'Etc/GMT-7' },
    { offset: 8, cityAbbr: 'SIN', cityFull: 'Singapore', utcOffset: '+8', tzAbbr: 'SGT', name: 'Asia/Singapore', gradientTz: 'Etc/GMT-8' },
    { offset: 9, cityAbbr: 'TOK', cityFull: 'Tokyo', utcOffset: '+9', tzAbbr: 'JST', name: 'Asia/Tokyo', gradientTz: 'Etc/GMT-9' },
    { offset: 10, cityAbbr: 'SYD', cityFull: 'Sydney', utcOffset: '+10', tzAbbr: 'AEST', name: 'Australia/Sydney', gradientTz: 'Etc/GMT-10' },
    { offset: 11, cityAbbr: 'NOU', cityFull: 'Noumea', utcOffset: '+11', tzAbbr: 'NCT', name: 'Pacific/Noumea', gradientTz: 'Etc/GMT-11' },
    { offset: 12, cityAbbr: 'AKL', cityFull: 'Auckland', utcOffset: '+12', tzAbbr: 'NZST', name: 'Pacific/Auckland', gradientTz: 'Etc/GMT-12' },
  ];

  return hourlyTimezones;
}

/**
 * Gets the current timezone offset in hours for a given timezone
 */
function getCurrentTimezoneOffset(timezoneName: string, date: Date = new Date()): number {
  const offsetMs = getTimezoneOffset(timezoneName, date);
  return offsetMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

export function findClosestTimezone(timezones: TimezoneInfo[], userOffset: number): string {
  const now = new Date();
  return timezones.reduce((closest, tz) => {
    const currentOffset = getCurrentTimezoneOffset(tz.name, now);
    const closestOffset = getCurrentTimezoneOffset(closest.name, now);
    return Math.abs(currentOffset - userOffset) < Math.abs(closestOffset - userOffset) ? tz : closest;
  }).name;
}

export interface TimezoneConversion {
  timezone: string;
  city: string;
  time: string;
  offset: string;
  dayDiff?: string;
}

export function convertTimeToTimezones(
  sourceTime: Date,
  sourceTimezone: string,
  targetTimezones: string[]
): TimezoneConversion[] {
  const timezones = getHourlyTimezones();
  const conversions: TimezoneConversion[] = [];

  for (const targetTimezone of targetTimezones) {
    const timezoneInfo = timezones.find(tz => tz.name === targetTimezone);
    if (!timezoneInfo) continue;

    try {
      const convertedTime = new Date(sourceTime.toLocaleString("en-US", { timeZone: targetTimezone }));
      const timeString = formatInTimeZone(convertedTime, targetTimezone, 'h:mm a');
      
      const sourceDayStart = new Date(sourceTime);
      sourceDayStart.setHours(0, 0, 0, 0);
      
      const targetDayStart = new Date(convertedTime);
      targetDayStart.setHours(0, 0, 0, 0);
      
      const dayDifference = Math.round((targetDayStart.getTime() - sourceDayStart.getTime()) / (1000 * 60 * 60 * 24));
      
      let dayDiff: string | undefined;
      if (dayDifference === 1) {
        dayDiff = '+1 day';
      } else if (dayDifference === -1) {
        dayDiff = '-1 day';
      } else if (dayDifference > 1) {
        dayDiff = `+${dayDifference} days`;
      } else if (dayDifference < -1) {
        dayDiff = `${dayDifference} days`;
      }

      conversions.push({
        timezone: targetTimezone,
        city: timezoneInfo.cityFull,
        time: timeString,
        offset: timezoneInfo.tzAbbr,
        dayDiff,
      });
    } catch (error) {
      console.error(`Error converting time to ${targetTimezone}:`, error);
    }
  }

  return conversions;
}

export function getTimezoneInfo(timezone: string): TimezoneInfo | null {
  const timezones = getHourlyTimezones();
  return timezones.find(tz => tz.name === timezone) || null;
}

export function searchTimezonesByCity(cityQuery: string): TimezoneInfo[] {
  const timezones = getHourlyTimezones();
  const query = cityQuery.toLowerCase().trim();
  
  return timezones.filter(tz => 
    tz.cityFull.toLowerCase().includes(query) ||
    tz.cityAbbr.toLowerCase().includes(query) ||
    tz.name.toLowerCase().includes(query)
  ).sort((a, b) => {
    const aExact = a.cityFull.toLowerCase() === query || a.cityAbbr.toLowerCase() === query;
    const bExact = b.cityFull.toLowerCase() === query || b.cityAbbr.toLowerCase() === query;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.cityFull.localeCompare(b.cityFull);
  });
}
