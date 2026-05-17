import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import {
  createWorldTimeVisualizationModel,
  getWorldTimezones,
} from '@/utils/world-time-visualization';

// Image metadata
export const alt = 'TZC - Time Zone Converter';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  // Font loading, process.cwd() is Next.js project directory
  const interSemiBold = await readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'));

  const currentTime = new Date();
  const timezoneDisplays = createWorldTimeVisualizationModel({
    currentTime,
    timeOffset: 0,
    userTimezone: '',
    timezones: getWorldTimezones(),
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
        {timezoneDisplays.map(display => (
          <div
            key={`gradient-${display.timezone.name}`}
            style={{
              flex: 1,
              background: display.backgroundColor,
              width: display.flexBasis,
            }}
          />
        ))}
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
