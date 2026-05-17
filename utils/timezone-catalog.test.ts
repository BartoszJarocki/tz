import { describe, expect, test } from 'vitest';
import {
  getTimezoneInfo,
  getWildcardTimezones,
  resolveTimezone,
  resolveTimezoneTargets,
  searchTimezones,
  WILDCARD_TIMEZONE,
} from '@/utils/timezone-catalog';

describe('timezone-catalog', () => {
  test('resolves timezone abbreviations and city aliases through one interface', () => {
    expect(resolveTimezone('EST')).toBe('America/New_York');
    expect(resolveTimezone('nyc')).toBe('America/New_York');
    expect(resolveTimezone('London')).toBe('Europe/London');
  });

  test('resolves UTC as a supported catalog timezone', () => {
    expect(resolveTimezone('UTC')).toBe('UTC');
    expect(getTimezoneInfo('UTC')).toMatchObject({
      cityFull: 'UTC',
      tzAbbr: 'UTC',
      offset: 0,
    });
  });

  test('expands wildcard targets at the catalog seam', () => {
    expect(resolveTimezone('*')).toBe(WILDCARD_TIMEZONE);
    expect(resolveTimezoneTargets(['London', '*'])).toEqual(getWildcardTimezones());
  });

  test('searches by city, abbreviation, timezone name, and offset', () => {
    expect(searchTimezones('PST')[0]).toMatchObject({ city: 'Los Angeles' });
    expect(searchTimezones('Europe/Paris')[0]).toMatchObject({ city: 'Paris' });
    expect(searchTimezones('+5:30')[0]).toMatchObject({ city: 'Delhi' });
  });
});
