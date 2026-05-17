import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { logger } from '@/utils/logger';
import { type ParsedTimeCommand, parseTimeCommand } from '@/utils/time-parser';
import {
  getTimezoneAbbreviation,
  getTimezoneDisplayName,
  getTimezoneInfo,
  isAbsoluteTimezone,
} from '@/utils/timezone-catalog';

export interface TimezoneConversion {
  timezone: string;
  city: string;
  time: string;
  offset: string;
  dayDiff?: string;
}

export interface TimezoneConversionDisplayRow extends TimezoneConversion {
  clipboardText: string;
}

export interface TimezoneConversionSource {
  time: string;
  timezone: string;
  label: string;
  abbreviation: string;
  isLocal: boolean;
  isNow: boolean;
}

export interface TimezoneConversionCommandResult {
  originalText: string;
  source: TimezoneConversionSource;
  targetTimezones: string[];
  conversions: TimezoneConversionDisplayRow[];
}

export interface DetectedTimezoneConversionInput {
  sourceTime: string;
  sourceTimezone: string;
  targetTimezone: string;
}

export interface DetectedTimezoneConversionResult extends TimezoneConversionCommandResult {
  conversion: TimezoneConversionDisplayRow;
  sourceDisplay: string;
  formattedResponse: string;
}

export function convertTimezoneCommand(
  text: string,
  options: { format24h?: boolean } = {}
): TimezoneConversionCommandResult | null {
  const parsedCommand = parseTimeCommand(text);
  if (!parsedCommand) {
    return null;
  }

  return convertParsedTimezoneCommand(parsedCommand, options);
}

function convertParsedTimezoneCommand(
  parsedCommand: ParsedTimeCommand,
  options: { format24h?: boolean } = {}
): TimezoneConversionCommandResult {
  const conversions = convertTimeToTimezones(
    parsedCommand.sourceTime,
    parsedCommand.sourceTimezone,
    parsedCommand.targetTimezones,
    options.format24h ?? false
  ).map(conversion => ({
    ...conversion,
    clipboardText: formatTimezoneConversionForClipboard(conversion),
  }));

  return {
    originalText: parsedCommand.originalText,
    source: createTimezoneConversionSource(parsedCommand),
    targetTimezones: parsedCommand.targetTimezones,
    conversions,
  };
}

export function convertTimeToTimezones(
  sourceTime: Date,
  sourceTimezone: string,
  targetTimezones: string[],
  format24h = false
): TimezoneConversion[] {
  if (
    !sourceTimezone ||
    (!isAbsoluteTimezone(sourceTimezone) && !isValidTimezone(sourceTimezone))
  ) {
    return [];
  }

  const conversions: TimezoneConversion[] = [];

  for (const targetTimezone of targetTimezones) {
    const timezoneInfo = getTimezoneInfo(targetTimezone);
    if (!timezoneInfo) continue;

    try {
      const timeToConvert = isAbsoluteTimezone(sourceTimezone)
        ? sourceTime
        : fromZonedTime(sourceTime, sourceTimezone);
      const timeFormat = format24h ? 'HH:mm' : 'h:mm a';
      const timeString = formatInTimeZone(timeToConvert, targetTimezone, timeFormat);
      const sourceDate = isAbsoluteTimezone(sourceTimezone)
        ? formatInTimeZone(timeToConvert, 'UTC', 'yyyy-MM-dd')
        : formatInTimeZone(timeToConvert, sourceTimezone, 'yyyy-MM-dd');
      const targetDate = formatInTimeZone(timeToConvert, targetTimezone, 'yyyy-MM-dd');
      const dayDifference = Math.round(
        (new Date(targetDate).getTime() - new Date(sourceDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      conversions.push({
        timezone: targetTimezone,
        city: timezoneInfo.cityFull,
        time: timeString,
        offset: timezoneInfo.tzAbbr,
        dayDiff: formatDayDifference(dayDifference),
      });
    } catch (error) {
      logger.warn('Timezone conversion failed', {
        sourceTimezone,
        targetTimezone,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return conversions;
}

export function convertDetectedTimezoneConversion(
  input: DetectedTimezoneConversionInput
): DetectedTimezoneConversionResult | null {
  const commandText = `${input.sourceTime} ${input.sourceTimezone} to ${input.targetTimezone}`;
  const result = convertTimezoneCommand(commandText);

  if (!result || result.conversions.length === 0) {
    return null;
  }

  const conversion = result.conversions[0];
  const sourceDisplay = formatDetectedSourceTime(result.source);
  const formattedResponse = `${conversion.time} (${sourceDisplay})`;

  return {
    ...result,
    conversion,
    sourceDisplay,
    formattedResponse,
  };
}

export function getTimezoneCommandSourceSummary(
  result: TimezoneConversionCommandResult
): { time: string; timezone: string } | null {
  if (result.source.isNow) {
    return null;
  }

  return {
    time: result.source.time,
    timezone: result.source.abbreviation,
  };
}

export function formatTimezoneConversionForClipboard(conversion: TimezoneConversion): string {
  return `${conversion.time} ${conversion.offset} (${conversion.city})${
    conversion.dayDiff ? ` ${conversion.dayDiff}` : ''
  }`;
}

function createTimezoneConversionSource(
  parsedCommand: ParsedTimeCommand
): TimezoneConversionSource {
  const isLocal = isAbsoluteTimezone(parsedCommand.sourceTimezone);
  const abbreviation = isLocal ? 'Local' : getTimezoneAbbreviation(parsedCommand.sourceTimezone);

  return {
    time: formatSourceTime(parsedCommand.sourceTime),
    timezone: parsedCommand.sourceTimezone,
    label: isLocal ? 'Local' : getTimezoneDisplayName(parsedCommand.sourceTimezone),
    abbreviation,
    isLocal,
    isNow: parsedCommand.isNow,
  };
}

function formatSourceTime(sourceTime: Date): string {
  return sourceTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDetectedSourceTime(source: TimezoneConversionSource): string {
  if (source.isLocal) {
    return source.time;
  }

  return `${source.time} ${source.abbreviation}`;
}

function formatDayDifference(dayDifference: number): string | undefined {
  if (dayDifference === 1) {
    return '+1 day';
  }

  if (dayDifference === -1) {
    return '-1 day';
  }

  if (dayDifference > 1) {
    return `+${dayDifference} days`;
  }

  if (dayDifference < -1) {
    return `${dayDifference} days`;
  }
}

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
