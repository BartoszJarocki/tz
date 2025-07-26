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
}

/**
 * Gets a list of hourly timezones with their corresponding city information
 * @returns {TimezoneInfo[]} Array of timezone information
 */
export function getHourlyTimezones(): TimezoneInfo[] {
  const hourlyTimezones = [
    { offset: -12, cityAbbr: 'BAK', cityFull: 'Baker Island', utcOffset: '-12' },
    { offset: -11, cityAbbr: 'PAG', cityFull: 'Pago Pago', utcOffset: '-11' },
    { offset: -10, cityAbbr: 'HON', cityFull: 'Honolulu', utcOffset: '-10' },
    { offset: -9, cityAbbr: 'ANC', cityFull: 'Anchorage', utcOffset: '-9' },
    { offset: -8, cityAbbr: 'LA', cityFull: 'Los Angeles', utcOffset: '-8' },
    { offset: -7, cityAbbr: 'DEN', cityFull: 'Denver', utcOffset: '-7' },
    { offset: -6, cityAbbr: 'CHI', cityFull: 'Chicago', utcOffset: '-6' },
    { offset: -5, cityAbbr: 'NYC', cityFull: 'New York City', utcOffset: '-5' },
    { offset: -4, cityAbbr: 'HAL', cityFull: 'Halifax', utcOffset: '-4' },
    { offset: -3, cityAbbr: 'RIO', cityFull: 'Rio de Janeiro', utcOffset: '-3' },
    { offset: -2, cityAbbr: 'FER', cityFull: 'Fernando de Noronha', utcOffset: '-2' },
    { offset: -1, cityAbbr: 'PRA', cityFull: 'Praia', utcOffset: '-1' },
    { offset: 0, cityAbbr: 'LON', cityFull: 'London', utcOffset: '+0' },
    { offset: 1, cityAbbr: 'PAR', cityFull: 'Paris', utcOffset: '+1' },
    { offset: 2, cityAbbr: 'CAI', cityFull: 'Cairo', utcOffset: '+2' },
    { offset: 3, cityAbbr: 'MOS', cityFull: 'Moscow', utcOffset: '+3' },
    { offset: 4, cityAbbr: 'DUB', cityFull: 'Dubai', utcOffset: '+4' },
    { offset: 5, cityAbbr: 'KAR', cityFull: 'Karachi', utcOffset: '+5' },
    { offset: 6, cityAbbr: 'DHK', cityFull: 'Dhaka', utcOffset: '+6' },
    { offset: 7, cityAbbr: 'BKK', cityFull: 'Bangkok', utcOffset: '+7' },
    { offset: 8, cityAbbr: 'SIN', cityFull: 'Singapore', utcOffset: '+8' },
    { offset: 9, cityAbbr: 'TOK', cityFull: 'Tokyo', utcOffset: '+9' },
    { offset: 10, cityAbbr: 'SYD', cityFull: 'Sydney', utcOffset: '+10' },
    { offset: 11, cityAbbr: 'NOU', cityFull: 'Noumea', utcOffset: '+11' },
  ];

  return hourlyTimezones.map(tz => ({
    ...tz,
    name: `Etc/GMT${tz.offset <= 0 ? '+' : '-'}${Math.abs(tz.offset)}`, // Note: Etc/GMT uses opposite sign
  }));
}

export function findClosestTimezone(timezones: TimezoneInfo[], userOffset: number): string {
  return timezones.reduce((closest, tz) => {
    return Math.abs(tz.offset - userOffset) < Math.abs(closest.offset - userOffset) ? tz : closest;
  }).name;
}
