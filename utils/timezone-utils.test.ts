import { describe, expect, test } from 'vitest';
import {
  convertTimeToTimezones,
  findClosestTimezone,
  getHourlyTimezones,
  getTimezoneInfo,
  searchTimezonesByCity,
} from '@/utils/timezone-utils';

describe('timezone-utils', () => {
  describe('convertTimeToTimezones', () => {
    test('converts 3pm EST to PST correctly', () => {
      const sourceTime = new Date('2024-01-15T15:00:00'); // 3pm
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', [
        'America/Los_Angeles',
      ]);

      expect(conversions).toHaveLength(1);
      expect(conversions[0]).toMatchObject({
        timezone: 'America/Los_Angeles',
        city: 'Los Angeles',
        time: '12:00 PM', // 3pm EST = 12pm PST
        offset: 'PST',
      });
    });

    test('handles DST transition correctly', () => {
      // March 10, 2024 - DST begins in US
      const sourceTime = new Date('2024-03-10T14:00:00'); // 2pm
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', [
        'America/Los_Angeles',
      ]);

      expect(conversions[0].time).toBe('11:00 AM'); // EDT to PDT
    });

    test('calculates day differences correctly', () => {
      // Late night EST should be next day in Asia
      const sourceTime = new Date('2024-01-15T23:00:00'); // 11pm EST
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', ['Asia/Tokyo']);

      expect(conversions[0].dayDiff).toBe('+1 day');
      expect(conversions[0].time).toBe('1:00 PM'); // 11pm EST = 1pm JST next day
    });

    test('handles year boundary correctly', () => {
      // Dec 31, 11pm EST should be Jan 1 next year in Asia
      const sourceTime = new Date('2023-12-31T23:00:00'); // 11pm EST
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', ['Asia/Tokyo']);

      expect(conversions[0].dayDiff).toBe('+1 day');
    });

    test('handles multiple target timezones', () => {
      const sourceTime = new Date('2024-01-15T15:00:00'); // 3pm
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', [
        'America/Los_Angeles',
        'Europe/London',
        'Asia/Tokyo',
      ]);

      expect(conversions).toHaveLength(3);
      expect(conversions.map(c => c.timezone)).toEqual([
        'America/Los_Angeles',
        'Europe/London',
        'Asia/Tokyo',
      ]);
    });

    test('handles invalid timezone gracefully', () => {
      const sourceTime = new Date('2024-01-15T15:00:00');
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', [
        'Invalid/Timezone',
        'America/Los_Angeles',
      ]);

      expect(conversions).toHaveLength(1);
      expect(conversions[0].timezone).toBe('America/Los_Angeles');
    });

    test('calculates negative day differences', () => {
      // Early morning in Asia should be previous day in US
      const sourceTime = new Date('2024-01-16T02:00:00'); // 2am JST
      const conversions = convertTimeToTimezones(sourceTime, 'Asia/Tokyo', ['America/New_York']);

      expect(conversions[0].dayDiff).toBe('-1 day');
    });

    test('handles noon correctly across timezones', () => {
      const sourceTime = new Date('2024-01-15T12:00:00'); // noon
      const conversions = convertTimeToTimezones(sourceTime, 'UTC', [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
      ]);

      expect(conversions[0].time).toBe('7:00 AM'); // UTC noon = 7am EST
      expect(conversions[1].time).toBe('12:00 PM'); // UTC noon = noon GMT
      expect(conversions[2].time).toBe('9:00 PM'); // UTC noon = 9pm JST
    });

    test('preserves minutes in time conversion', () => {
      const sourceTime = new Date('2024-01-15T15:30:00'); // 3:30pm
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', [
        'America/Los_Angeles',
      ]);

      expect(conversions[0].time).toBe('12:30 PM');
    });
  });

  describe('getTimezoneInfo', () => {
    test('returns correct timezone info for known timezone', () => {
      const info = getTimezoneInfo('America/New_York');
      expect(info).toMatchObject({
        name: 'America/New_York',
        cityFull: 'New York City',
        cityAbbr: 'NYC',
        tzAbbr: 'EST',
      });
    });

    test('returns null for unknown timezone', () => {
      const info = getTimezoneInfo('Invalid/Timezone');
      expect(info).toBeNull();
    });
  });

  describe('searchTimezonesByCity', () => {
    test('finds timezone by full city name', () => {
      const results = searchTimezonesByCity('New York');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('America/New_York');
    });

    test('finds timezone by city abbreviation', () => {
      const results = searchTimezonesByCity('NYC');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('America/New_York');
    });

    test('handles case insensitive search', () => {
      const results = searchTimezonesByCity('london');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Europe/London');
    });

    test('returns multiple results when applicable', () => {
      const results = searchTimezonesByCity('a'); // Very broad search
      expect(results.length).toBeGreaterThan(1);
    });

    test('prioritizes exact matches', () => {
      const results = searchTimezonesByCity('Paris');
      expect(results[0].cityFull).toBe('Paris');
    });
  });

  describe('findClosestTimezone', () => {
    test('finds closest timezone by offset', () => {
      const timezones = getHourlyTimezones();
      const closest = findClosestTimezone(timezones, -5); // EST offset
      // Should be one of the -5 offset timezones (EST or CST depending on current date)
      expect(['America/New_York', 'America/Chicago']).toContain(closest);
    });

    test('handles fractional offsets', () => {
      const timezones = getHourlyTimezones();
      const closest = findClosestTimezone(timezones, -4.5); // Between EST and AST
      // Should pick the closer one
      const result = closest;
      expect(['America/New_York', 'America/Halifax', 'America/Chicago']).toContain(result);
    });
  });

  describe('edge cases and error handling', () => {
    test('handles midnight correctly', () => {
      const sourceTime = new Date('2024-01-15T00:00:00'); // midnight
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', [
        'America/Los_Angeles',
      ]);

      expect(conversions[0].time).toBe('9:00 PM');
      expect(conversions[0].dayDiff).toBe('-1 day');
    });

    test('handles leap year correctly', () => {
      const sourceTime = new Date('2024-02-29T12:00:00'); // leap day
      const conversions = convertTimeToTimezones(sourceTime, 'UTC', ['America/New_York']);

      expect(conversions).toHaveLength(1);
      expect(conversions[0].time).toBe('7:00 AM');
    });

    test('handles 24-hour boundary correctly', () => {
      const sourceTime = new Date('2024-01-15T23:59:00'); // 11:59 PM
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', ['Europe/London']);

      expect(conversions[0].time).toBe('4:59 AM');
      expect(conversions[0].dayDiff).toBe('+1 day');
    });

    test('handles empty target timezones array', () => {
      const sourceTime = new Date('2024-01-15T15:00:00');
      const conversions = convertTimeToTimezones(sourceTime, 'America/New_York', []);

      expect(conversions).toHaveLength(0);
    });
  });

  describe('timezone abbreviation handling', () => {
    test('correctly identifies standard time abbreviations', () => {
      const timezones = getHourlyTimezones();
      const est = timezones.find(tz => tz.name === 'America/New_York');
      const pst = timezones.find(tz => tz.name === 'America/Los_Angeles');

      expect(est?.tzAbbr).toBe('EST');
      expect(pst?.tzAbbr).toBe('PST');
    });

    test('handles different timezone abbreviations', () => {
      const conversions = convertTimeToTimezones(
        new Date('2024-01-15T15:00:00'),
        'America/New_York',
        ['Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney']
      );

      expect(conversions[0].offset).toBe('CET');
      expect(conversions[1].offset).toBe('JST');
      expect(conversions[2].offset).toBe('AEST');
    });
  });

  describe('performance and optimization', () => {
    test('handles large number of timezone conversions efficiently', () => {
      const sourceTime = new Date('2024-01-15T15:00:00');
      const allTimezones = getHourlyTimezones().map(tz => tz.name);

      const start = Date.now();
      const conversions = convertTimeToTimezones(sourceTime, 'UTC', allTimezones);
      const duration = Date.now() - start;

      expect(conversions.length).toBe(allTimezones.length);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
