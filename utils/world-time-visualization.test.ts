import { describe, expect, test } from 'vitest';
import {
  calculateDragTimeOffset,
  createWorldTimeVisualizationModel,
} from '@/utils/world-time-visualization';

describe('world-time-visualization', () => {
  test('calculates horizontal and vertical drag offsets from container geometry', () => {
    expect(
      calculateDragTimeOffset({
        deltaX: 100,
        deltaY: 0,
        containerWidth: 400,
        containerHeight: 800,
        timezoneCount: 4,
        orientation: 'horizontal',
        previousOffset: 0,
      })
    ).toBe(-1);

    expect(
      calculateDragTimeOffset({
        deltaX: 0,
        deltaY: -200,
        containerWidth: 400,
        containerHeight: 800,
        timezoneCount: 4,
        orientation: 'vertical',
        previousOffset: 2,
      })
    ).toBe(3);
  });

  test('creates a display model with color, time, day, city aliases, and user timezone state', () => {
    const model = createWorldTimeVisualizationModel({
      currentTime: new Date('2024-01-15T12:00:00Z'),
      timeOffset: 0,
      userTimezone: 'Europe/London',
      timezones: [
        {
          offset: 0,
          cityAbbr: 'LON',
          cityFull: 'London',
          utcOffset: '+0',
          tzAbbr: 'GMT',
          name: 'Europe/London',
          gradientTz: 'Etc/GMT+0',
        },
      ],
    });

    expect(model).toHaveLength(1);
    expect(model[0]).toMatchObject({
      backgroundColor: '#FFFFFF',
      textColorClass: 'text-black',
      timeLabel: '12:00',
      dayLabel: 'Mon',
      flexBasis: '100%',
      isUserTimezone: true,
    });
    expect(model[0].cityAbbreviations).toContain('LON');
  });
});
