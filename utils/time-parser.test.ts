import { describe, expect, test } from 'vitest';
import { extractTimezonesFromText, parseTimeCommand } from '@/utils/time-parser';

describe('time-parser', () => {
  describe('parseTimeCommand', () => {
    test('parses "3pm EST to PST" command', () => {
      const result = parseTimeCommand('3pm EST to PST');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
      expect(result?.targetTimezones).toContain('America/Los_Angeles');
      expect(result?.isNow).toBe(false);
    });

    test('parses "14:00 Paris to Tokyo" command', () => {
      const result = parseTimeCommand('14:00 Paris to Tokyo');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('Europe/Paris');
      expect(result?.targetTimezones).toContain('Asia/Tokyo');
    });

    test('parses "now in London" command', () => {
      const result = parseTimeCommand('now in London');
      expect(result).not.toBeNull();
      expect(result?.isNow).toBe(true);
      expect(result?.sourceTimezone).toBe('__absolute__');
      expect(result?.targetTimezones).toContain('Europe/London');
    });

    test('parses "now in London, Paris, Tokyo" command', () => {
      const result = parseTimeCommand('now in London, Paris, Tokyo');
      expect(result).not.toBeNull();
      expect(result?.isNow).toBe(true);
      expect(result?.sourceTimezone).toBe('__absolute__');
      expect(result?.targetTimezones).toEqual(['Europe/London', 'Europe/Paris', 'Asia/Tokyo']);
    });

    test('parses "meeting at 10am PST" command', () => {
      const result = parseTimeCommand('meeting at 10am PST');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/Los_Angeles');
      expect(result?.targetTimezones.length).toBeGreaterThan(0);
    });

    test('parses "3pm EST" without explicit target', () => {
      const result = parseTimeCommand('3pm EST');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
      expect(result?.targetTimezones.length).toBeGreaterThan(0);
    });

    test('parses time with spaces "3 pm EST"', () => {
      const result = parseTimeCommand('3 pm EST');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
    });

    test('parses multiple target timezones "3pm EST to PST, CET, JST"', () => {
      const result = parseTimeCommand('3pm EST to PST, CET, JST');
      expect(result).not.toBeNull();
      expect(result?.targetTimezones).toEqual([
        'America/Los_Angeles',
        'Europe/Paris',
        'Asia/Tokyo',
      ]);
    });

    test('handles city abbreviations', () => {
      const result = parseTimeCommand('3pm NYC to LA');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
      expect(result?.targetTimezones).toContain('America/Los_Angeles');
    });

    test('handles GMT and UTC', () => {
      const result = parseTimeCommand('12:00 GMT to UTC');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('Europe/London');
      expect(result?.targetTimezones).toContain('UTC');
    });

    test('returns null for invalid input', () => {
      const result = parseTimeCommand('invalid command');
      expect(result).toBeNull();
    });

    test('returns null for empty input', () => {
      const result = parseTimeCommand('');
      expect(result).toBeNull();
    });

    test('returns null for help command', () => {
      const result = parseTimeCommand('help');
      expect(result).toBeNull();
    });

    test('filters out unknown timezones', () => {
      const result = parseTimeCommand('3pm EST to INVALID, PST');
      expect(result).not.toBeNull();
      expect(result?.targetTimezones).toEqual(['America/Los_Angeles']);
    });

    test('falls back to default timezones when all targets are invalid', () => {
      const result = parseTimeCommand('3pm EST to INVALID1, INVALID2');
      expect(result).not.toBeNull();
      expect(result?.targetTimezones.length).toBeGreaterThan(0);
    });

    test('handles 24-hour time format', () => {
      const result = parseTimeCommand('23:30 EST to PST');
      expect(result).not.toBeNull();
      expect(result?.sourceTime.getHours()).toBe(23);
      expect(result?.sourceTime.getMinutes()).toBe(30);
    });

    test('handles noon correctly', () => {
      const result = parseTimeCommand('12pm EST to PST');
      expect(result).not.toBeNull();
      expect(result?.sourceTime.getHours()).toBe(12);
    });

    test('handles midnight correctly', () => {
      const result = parseTimeCommand('12am EST to PST');
      expect(result).not.toBeNull();
      expect(result?.sourceTime.getHours()).toBe(0);
    });

    test('uses chrono-node fallback for natural language', () => {
      const result = parseTimeCommand('tomorrow at 3pm EST');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
    });
  });

  describe('extractTimezonesFromText', () => {
    test('extracts timezones from text', () => {
      const timezones = extractTimezonesFromText('Meeting at 3pm EST with Tokyo office');
      expect(timezones).toContain('America/New_York');
      expect(timezones).toContain('Asia/Tokyo');
    });

    test('extracts timezone abbreviations', () => {
      const timezones = extractTimezonesFromText('PST and CET meeting');
      expect(timezones).toContain('America/Los_Angeles');
      expect(timezones).toContain('Europe/Paris');
    });

    test('extracts city names', () => {
      const timezones = extractTimezonesFromText('London Paris Tokyo');
      expect(timezones).toContain('Europe/London');
      expect(timezones).toContain('Europe/Paris');
      expect(timezones).toContain('Asia/Tokyo');
    });

    test('ignores unknown words', () => {
      const timezones = extractTimezonesFromText('random words EST more words');
      expect(timezones).toEqual(['America/New_York']);
    });

    test('handles empty input', () => {
      const timezones = extractTimezonesFromText('');
      expect(timezones.length).toBe(0);
    });

    test('handles duplicate timezones', () => {
      const timezones = extractTimezonesFromText('EST EST PST');
      expect(timezones).toEqual(['America/New_York', 'America/New_York', 'America/Los_Angeles']);
    });
  });

  describe('timezone resolution', () => {
    test('resolves standard timezone abbreviations', () => {
      const result = parseTimeCommand('3pm EST to PST, CST, MST');
      expect(result).not.toBeNull();
      expect(result?.targetTimezones).toEqual([
        'America/Los_Angeles',
        'America/Chicago',
        'America/Denver',
      ]);
    });

    test('resolves daylight saving time abbreviations', () => {
      const result = parseTimeCommand('3pm EDT to PDT');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
      expect(result?.targetTimezones).toContain('America/Los_Angeles');
    });

    test('resolves international timezone abbreviations', () => {
      const result = parseTimeCommand('3pm CET to JST, SGT');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('Europe/Paris');
      expect(result?.targetTimezones).toEqual(['Asia/Tokyo', 'Asia/Singapore']);
    });

    test('resolves city abbreviations', () => {
      const result = parseTimeCommand('3pm NYC to LA, CHI');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
      expect(result?.targetTimezones).toEqual(['America/Los_Angeles', 'America/Chicago']);
    });

    test('handles case insensitive input', () => {
      const result = parseTimeCommand('3pm est to pst');
      expect(result).not.toBeNull();
      expect(result?.sourceTimezone).toBe('America/New_York');
      expect(result?.targetTimezones).toContain('America/Los_Angeles');
    });
  });
});
