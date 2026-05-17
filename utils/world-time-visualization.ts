import { formatInTimeZone } from 'date-fns-tz';
import { getCityAbbreviationsForTimezone } from '@/utils/city-abbreviations';
import {
  findClosestTimezone,
  getHourlyTimezones,
  type TimezoneInfo,
} from '@/utils/timezone-catalog';

export type WorldTimeOrientation = 'horizontal' | 'vertical';

export interface DragOffsetInput {
  deltaX: number;
  deltaY: number;
  containerWidth: number;
  containerHeight: number;
  timezoneCount: number;
  orientation: WorldTimeOrientation;
  previousOffset: number;
}

export interface WorldTimeVisualizationInput {
  currentTime: Date;
  timeOffset: number;
  userTimezone: string;
  timezones?: TimezoneInfo[];
}

export interface WorldTimeZoneDisplay {
  timezone: TimezoneInfo;
  backgroundColor: string;
  textColorClass: 'text-black' | 'text-white';
  timeLabel: string;
  dayLabel: string;
  cityAbbreviations: string[];
  flexBasis: string;
  isUserTimezone: boolean;
}

const HOUR_COLORS = [
  '#1A1A1A',
  '#262626',
  '#333333',
  '#404040',
  '#4D4D4D',
  '#595959',
  '#666666',
  '#808080',
  '#999999',
  '#B3B3B3',
  '#CCCCCC',
  '#E6E6E6',
  '#FFFFFF',
  '#E6E6E6',
  '#CCCCCC',
  '#B3B3B3',
  '#999999',
  '#808080',
  '#666666',
  '#595959',
  '#4D4D4D',
  '#404040',
  '#333333',
  '#262626',
] as const;

export function getWorldTimezones(): TimezoneInfo[] {
  return getHourlyTimezones();
}

export function detectUserTimezone(timezones: TimezoneInfo[], date = new Date()): string {
  const userOffset = -date.getTimezoneOffset() / 60;
  return findClosestTimezone(timezones, userOffset);
}

export function calculateDragTimeOffset(input: DragOffsetInput): number {
  if (input.timezoneCount === 0) {
    return input.previousOffset;
  }

  const timezoneSize =
    input.orientation === 'vertical'
      ? input.containerHeight / input.timezoneCount
      : input.containerWidth / input.timezoneCount;

  if (!Number.isFinite(timezoneSize) || timezoneSize <= 0) {
    return input.previousOffset;
  }

  const delta = input.orientation === 'vertical' ? input.deltaY : input.deltaX;
  const hourChange = Math.round(delta / timezoneSize);
  return input.previousOffset - hourChange;
}

export function createWorldTimeVisualizationModel(
  input: WorldTimeVisualizationInput
): WorldTimeZoneDisplay[] {
  const timezones = input.timezones ?? getWorldTimezones();
  const adjustedTime = getAdjustedWorldTime(input.currentTime, input.timeOffset);
  const flexBasis = `${100 / timezones.length}%`;

  return timezones.map(timezone => {
    const hour = getTimezoneHour(adjustedTime, timezone.gradientTz);

    return {
      timezone,
      backgroundColor: getGradientColor(hour),
      textColorClass: getTextColorClass(hour),
      timeLabel: formatInTimeZone(adjustedTime, timezone.name, 'HH:mm'),
      dayLabel: formatInTimeZone(adjustedTime, timezone.name, 'EEE'),
      cityAbbreviations: getCityAbbreviationsForTimezone(timezone.offset),
      flexBasis,
      isUserTimezone: timezone.name === input.userTimezone,
    };
  });
}

export function getAdjustedWorldTime(currentTime: Date, timeOffset: number): Date {
  return new Date(currentTime.getTime() + timeOffset * 3600000);
}

export function getGradientColor(hour: number): string {
  return HOUR_COLORS[hour] ?? HOUR_COLORS[0];
}

function getTextColorClass(hour: number): 'text-black' | 'text-white' {
  return hour >= 18 || hour < 6 ? 'text-white' : 'text-black';
}

function getTimezoneHour(date: Date, timezone: string): number {
  const hourString = formatInTimeZone(date, timezone, 'HH');
  return Number.parseInt(hourString, 10);
}
