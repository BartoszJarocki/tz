'use client';

import {
  useState,
  useEffect,
  type MouseEvent,
  type TouchEvent,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimezoneOffset, formatInTimeZone } from 'date-fns-tz';
import {
  getHourlyTimezones,
  findClosestTimezone,
} from '../utils/timezone-utils';
import { getCityAbbreviationsForTimezone } from '../utils/city-abbreviations';

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

export default function HorizontalWorldTimezones() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState('');
  const timezones = getHourlyTimezones();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [timeOffset, setTimeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastOffsetRef = useRef(0);
  const [hoveredTimezone, setHoveredTimezone] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);

    const userOffset = -now.getTimezoneOffset() / 60;
    const closestTz = findClosestTimezone(timezones, userOffset);
    setUserTimezone(closestTz);

    const timer = setInterval(() => {
      if (!isDragging) {
        setCurrentTime(new Date());
        setTimeOffset(0);
        lastOffsetRef.current = 0;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isDragging]);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    lastOffsetRef.current = timeOffset;
  };

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    lastOffsetRef.current = timeOffset;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    updateTimeBasedOnDrag(deltaX, deltaY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    updateTimeBasedOnDrag(deltaX, deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    resetToLiveTime();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    resetToLiveTime();
  };

  const updateTimeBasedOnDrag = (deltaX: number, deltaY: number) => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const isMobile = window.innerWidth < 768;

    let timezoneSize: number;
    let delta: number;

    if (isMobile) {
      timezoneSize = containerHeight / timezones.length;
      delta = deltaY;
    } else {
      timezoneSize = containerWidth / timezones.length;
      delta = deltaX;
    }

    const hourChange = Math.round(delta / timezoneSize);
    const newOffset = lastOffsetRef.current - hourChange;
    setTimeOffset(newOffset);
  };

  const resetToLiveTime = () => {
    setCurrentTime(new Date());
    setTimeOffset(0);
    lastOffsetRef.current = 0;
  };

  const getTimezoneColors = () => {
    return timezones.map((tz) => {
      const adjustedTime = new Date(currentTime.getTime() + timeOffset * 3600000);
      const hourString = formatInTimeZone(adjustedTime, tz.gradientTz, 'HH');
      const hours = parseInt(hourString, 10);
      return { tz: tz.name, color: getGradientColor(hours) };
    });
  };

  const getTextColor = (timezone: string) => {
    const adjustedTime = new Date(currentTime.getTime() + timeOffset * 3600000);
    const tz = timezones.find(t => t.name === timezone);
    const gradientTz = tz?.gradientTz || timezone;
    const hourString = formatInTimeZone(adjustedTime, gradientTz, 'HH');
    const hours = parseInt(hourString, 10);
    return hours >= 18 || hours < 6 ? 'text-white' : 'text-black';
  };

  const timezoneColors = getTimezoneColors();

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-screen overflow-hidden bg-black relative select-none cursor-grab active:cursor-grabbing touch-none pb-safe"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="World time zones visualization"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full">
        {timezones.map((tz) => {
          const bgColor =
            timezoneColors.find((tc) => tc.tz === tz.name)?.color || '#000000';
          return (
            <div
              key={`gradient-${tz.name}`}
              className="flex-1"
              style={{
                background: bgColor,
                flexBasis: `${100 / timezones.length}%`,
              }}
            />
          );
        })}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-stretch md:items-center justify-center pointer-events-none">
        <div className="flex flex-col md:flex-row w-full h-full">
          {timezones.map((tz) => {
            const textColor = getTextColor(tz.name);
            const isHovered = hoveredTimezone === tz.name;
            const cityAbbreviations = getCityAbbreviationsForTimezone(
              tz.offset
            );

            return (
              <div
                key={tz.name}
                className="flex-1 flex flex-col items-center justify-center relative pointer-events-auto gap-2"
                onMouseEnter={() => setHoveredTimezone(tz.name)}
                onMouseLeave={() => setHoveredTimezone(null)}
              >
                <div className="flex-1" />

                {/* Main content - always centered and stationary */}
                <div className="flex items-center md:flex-col md:items-center justify-center relative z-10">
                  {/* User timezone indicator */}
                  {tz.name === userTimezone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute w-1 h-1 bg-orange-500 rounded-full md:left-1/2 md:-translate-x-1/2 md:-top-4 -left-5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                  )}

                  {/* Mobile layout */}
                  <div className="md:hidden flex items-center justify-between w-full px-6">
                    <div className="flex items-center space-x-2">
                      <p className={`${textColor} text-[11px] font-mono`}>
                        {formatInTimeZone(
                          new Date(
                            currentTime.getTime() + timeOffset * 3600000
                          ),
                          tz.name,
                          'HH:mm'
                        )}
                      </p>
                      <div className="group relative cursor-help">
                        <p className={`${textColor} text-[11px] font-bold`}>
                          {tz.cityAbbr}
                        </p>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                          <div className="bg-[#1A1A1A] text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                            {tz.cityFull}
                          </div>
                          <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-[#1A1A1A] w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className={`${textColor} text-[8px] opacity-75`}>
                        {tz.utcOffset}
                      </p>
                      <p className={`${textColor} text-[8px] font-bold opacity-75`}>
                        {tz.tzAbbr}
                      </p>
                      <p className={`${textColor} text-[8px] font-mono`}>
                        {formatInTimeZone(
                          new Date(
                            currentTime.getTime() + timeOffset * 3600000
                          ),
                          tz.name,
                          'EEE'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:flex md:flex-col md:items-center md:justify-center shrink-0">
                    <p className={`${textColor} text-[8px] font-mono mb-0.5`}>
                      {formatInTimeZone(
                        new Date(currentTime.getTime() + timeOffset * 3600000),
                        tz.name,
                        'HH:mm'
                      )}
                    </p>
                    <div className="group relative cursor-help">
                      <p className={`${textColor} text-[10px] font-bold`}>
                        {tz.cityAbbr}
                      </p>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                        <div className="bg-[#1A1A1A] text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                          {tz.cityFull}
                        </div>
                        <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-[#1A1A1A] w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                      </div>
                    </div>
                    <p className={`${textColor} text-[8px] font-mono mt-0.5`}>
                      {formatInTimeZone(
                        new Date(currentTime.getTime() + timeOffset * 3600000),
                        tz.name,
                        'EEE'
                      )}
                    </p>
                    <p className={`${textColor} text-[7px] font-bold mt-0.5 opacity-75`}>
                      {tz.tzAbbr}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  {/* City abbreviations overlay - positioned above main content */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{
                          duration: 0.3,
                          ease: 'easeOut',
                          staggerChildren: 0.05,
                        }}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {cityAbbreviations.map((city, index) => (
                            <motion.div
                              key={city}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 0.8, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.2,
                                ease: 'easeOut',
                              }}
                              className={`${textColor} font-medium leading-tight ${
                                window.innerWidth >= 768
                                  ? 'text-[6px]'
                                  : 'text-[7px]'
                              }`}
                            >
                              {city}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UTC offset labels at bottom */}
      <div className="absolute bottom-0 left-0 right-0 hidden md:flex justify-center pb-2">
        {timezones.map((tz) => (
          <div
            key={`utc-${tz.name}`}
            className="flex-1 text-center"
            style={{ flexBasis: `${100 / timezones.length}%` }}
          >
            <p className={`${getTextColor(tz.name)} text-[8px] opacity-75`}>
              {tz.utcOffset}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
