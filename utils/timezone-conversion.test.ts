import { describe, expect, test } from 'vitest';
import { convertTimeToTimezones, convertTimezoneCommand } from '@/utils/timezone-conversion';

describe('timezone-conversion', () => {
  test('returns a display-ready command result', () => {
    const result = convertTimezoneCommand('3pm EST to PST');

    expect(result).not.toBeNull();
    expect(result?.source).toMatchObject({
      time: '3:00 PM',
      timezone: 'America/New_York',
      abbreviation: 'EST',
      label: 'New York City',
      isLocal: false,
    });
    expect(result?.conversions[0]).toMatchObject({
      timezone: 'America/Los_Angeles',
      city: 'Los Angeles',
      clipboardText: expect.stringContaining('Los Angeles'),
    });
  });

  test('returns null when the source timezone cannot resolve', () => {
    expect(convertTimezoneCommand('3pm UNKNOWN to PST')).toBeNull();
  });

  test('converts to UTC now that UTC is part of the catalog', () => {
    const conversions = convertTimeToTimezones(new Date('2024-01-15T15:00:00'), 'Europe/London', [
      'UTC',
    ]);

    expect(conversions).toHaveLength(1);
    expect(conversions[0]).toMatchObject({
      timezone: 'UTC',
      city: 'UTC',
      offset: 'UTC',
    });
  });
});
