'use client';

import { motion } from 'framer-motion';
import { Command, UserIcon } from 'lucide-react';
import { type MouseEvent, type TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { TimezoneCommand } from '@/components/timezone-command';
import {
  calculateDragTimeOffset,
  createWorldTimeVisualizationModel,
  detectUserTimezone,
  getWorldTimezones,
} from '@/utils/world-time-visualization';

export default function HorizontalWorldTimezones() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState('');
  const timezones = useMemo(() => getWorldTimezones(), []);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [timeOffset, setTimeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastOffsetRef = useRef(0);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);

    setUserTimezone(detectUserTimezone(timezones, now));

    const timer = setInterval(() => {
      if (!isDragging) {
        setCurrentTime(new Date());
        setTimeOffset(0);
        lastOffsetRef.current = 0;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isDragging, timezones]);

  // Keyboard shortcut handler for command palette
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

    setTimeOffset(
      calculateDragTimeOffset({
        deltaX,
        deltaY,
        containerWidth,
        containerHeight,
        timezoneCount: timezones.length,
        orientation: isMobile ? 'vertical' : 'horizontal',
        previousOffset: lastOffsetRef.current,
      })
    );
  };

  const resetToLiveTime = () => {
    setCurrentTime(new Date());
    setTimeOffset(0);
    lastOffsetRef.current = 0;
  };

  const timezoneDisplays = createWorldTimeVisualizationModel({
    currentTime,
    timeOffset,
    userTimezone,
    timezones,
  });

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
      role="application"
      aria-label="World time zones visualization"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full">
        {timezoneDisplays.map(display => (
          <div
            key={`gradient-${display.timezone.name}`}
            className="flex-1"
            style={{
              background: display.backgroundColor,
              flexBasis: display.flexBasis,
            }}
          />
        ))}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-stretch md:items-center justify-center pointer-events-none">
        <div className="flex flex-col md:flex-row w-full h-full">
          {timezoneDisplays.map(display => (
            <div
              key={display.timezone.name}
              className="group flex-1 flex flex-col items-center justify-center relative pointer-events-auto gap-2"
            >
              <div className="flex-1" />

              {/* Main content - always centered and stationary */}
              <div className="flex items-center md:flex-col md:items-center justify-center relative z-10">
                {/* User timezone indicator */}
                {display.isUserTimezone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute md:top-[-16px] md:left-1/2 md:-ml-1.5 top-1/2 left-1/2 -ml-1.5 -mt-1.5"
                    aria-hidden="true"
                  >
                    <UserIcon className={`w-3 h-3 ${display.textColorClass}`} />
                  </motion.div>
                )}

                {/* Mobile layout */}
                <div className="md:hidden flex items-center justify-between w-full px-6">
                  <div className="flex items-center space-x-2">
                    <p className={`${display.textColorClass} text-[11px] font-mono`}>
                      {display.timeLabel}
                    </p>
                    <div className="group relative cursor-help">
                      <p className={`${display.textColorClass} text-[11px] font-bold`}>
                        {display.timezone.cityAbbr}
                      </p>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                        <div className="bg-[#1A1A1A] text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                          {display.timezone.cityFull}
                        </div>
                        <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-[#1A1A1A] w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <p className={`${display.textColorClass} text-[8px] opacity-75`}>
                      {display.timezone.utcOffset}
                    </p>
                    <p className={`${display.textColorClass} text-[8px] font-bold opacity-75`}>
                      {display.timezone.tzAbbr}
                    </p>
                    <p className={`${display.textColorClass} text-[8px] font-mono`}>
                      {display.dayLabel}
                    </p>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:flex md:flex-col md:items-center md:justify-center shrink-0">
                  <p className={`${display.textColorClass} text-[8px] font-mono mb-0.5`}>
                    {display.timeLabel}
                  </p>
                  <div className="group relative cursor-help">
                    <p className={`${display.textColorClass} text-[10px] font-bold`}>
                      {display.timezone.cityAbbr}
                    </p>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                      <div className="bg-[#1A1A1A] text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                        {display.timezone.cityFull}
                      </div>
                      <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-[#1A1A1A] w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                    </div>
                  </div>
                  <p className={`${display.textColorClass} text-[8px] font-mono mt-0.5`}>
                    {display.dayLabel}
                  </p>
                  <p className={`${display.textColorClass} text-[7px] font-bold mt-0.5 opacity-75`}>
                    {display.timezone.tzAbbr}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                {/* City abbreviations overlay - positioned above main content - desktop only */}
                <div className="hidden md:block opacity-0 translate-y-2 scale-95 transition duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
                  <div className="flex flex-col items-center space-y-1">
                    {display.cityAbbreviations.map(city => (
                      <div
                        key={city}
                        className={`${display.textColorClass} font-medium leading-tight text-[6px] opacity-80`}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UTC offset labels at bottom */}
      <div className="absolute bottom-0 left-0 right-0 hidden md:flex justify-center pb-2">
        {timezoneDisplays.map(display => (
          <div
            key={`utc-${display.timezone.name}`}
            className="flex-1 text-center"
            style={{ flexBasis: display.flexBasis }}
          >
            <p className={`${display.textColorClass} text-[8px] opacity-75`}>
              {display.timezone.utcOffset}
            </p>
          </div>
        ))}
      </div>

      {/* Command palette trigger button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setCommandOpen(true)}
        className="fixed top-4 right-4 z-10 pointer-events-auto bg-white/10 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/20 transition-all duration-200 shadow-lg border border-white/20"
        title="Open timezone converter (⌘K)"
        aria-label="Open timezone converter"
      >
        <Command className="w-5 h-5" />
      </motion.button>

      {/* Timezone Command Palette */}
      <TimezoneCommand open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
