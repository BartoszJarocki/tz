import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatInTimeZone } from 'date-fns-tz';
import { ImageResponse } from 'next/og';
import { getHourlyTimezones } from '@/utils/timezone-utils';

// Image metadata
export const alt = 'TZC - Time Zone Converter';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Hour colors for timezone bars (same as main page)
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
];

function getGradientColor(hour: number): string {
  return HOUR_COLORS[hour];
}

// Image generation
export default async function Image() {
  // Font loading, process.cwd() is Next.js project directory
  const interSemiBold = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));

  // Generate timezone bars
  const currentTime = new Date();
  const timezones = getHourlyTimezones();

  const timezoneColors = timezones.map(tz => {
    const hourString = formatInTimeZone(currentTime, tz.gradientTz, 'HH');
    const hours = parseInt(hourString, 10);
    return { tz: tz.name, color: getGradientColor(hours) };
  });

  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* Background timezone bars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {timezones.map((tz, _index) => {
          const bgColor = timezoneColors.find(tc => tc.tz === tz.name)?.color || '#000000';
          return (
            <div
              key={`gradient-${tz.name}`}
              style={{
                flex: 1,
                background: bgColor,
                width: `${100 / timezones.length}%`,
              }}
            />
          );
        })}
      </div>

      {/* Foreground text */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 128,
          color: 'white',
          fontFamily: 'Inter',
          fontWeight: 600,
          letterSpacing: '0.1em',
        }}
      >
        tzc
      </div>
    </div>,
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: interSemiBold,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
}
