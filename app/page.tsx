'use client'

import { useState, useEffect, MouseEvent, TouchEvent, useRef } from 'react'
import { getTimezoneOffset, formatInTimeZone } from 'date-fns-tz'
import { getHourlyTimezones, findClosestTimezone } from '../utils/timezoneUtils'

const HOUR_COLORS = [
'#1A1A1A', '#262626', '#333333', '#404040', '#4D4D4D', '#595959', '#666666', '#808080',
'#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6', '#FFFFFF', '#E6E6E6', '#CCCCCC', '#B3B3B3',
'#999999', '#808080', '#666666', '#595959', '#4D4D4D', '#404040', '#333333', '#262626'
]

function getGradientColor(hour: number): string {
  return HOUR_COLORS[hour]
}

export default function HorizontalWorldTimezones() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userTimezone, setUserTimezone] = useState('')
  const timezones = getHourlyTimezones()
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [timeOffset, setTimeOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastOffsetRef = useRef(0)

  useEffect(() => {
    const now = new Date()
    setCurrentTime(now)
    
    const userOffset = -now.getTimezoneOffset() / 60
    const closestTz = findClosestTimezone(timezones, userOffset)
    setUserTimezone(closestTz)

    const timer = setInterval(() => {
      if (!isDragging) {
        setCurrentTime(new Date())
        setTimeOffset(0)
        lastOffsetRef.current = 0
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isDragging])

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setStartY(e.clientY)
    lastOffsetRef.current = timeOffset
  }

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setStartY(e.touches[0].clientY)
    lastOffsetRef.current = timeOffset
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    updateTimeBasedOnDrag(deltaX, deltaY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - startX
    const deltaY = e.touches[0].clientY - startY
    updateTimeBasedOnDrag(deltaX, deltaY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    resetToLiveTime()
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    resetToLiveTime()
  }

  const updateTimeBasedOnDrag = (deltaX: number, deltaY: number) => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight
    const isMobile = window.innerWidth < 768

    let timezoneSize: number
    let delta: number

    if (isMobile) {
      timezoneSize = containerHeight / timezones.length
      delta = deltaY
    } else {
      timezoneSize = containerWidth / timezones.length
      delta = deltaX
    }

    const hourChange = Math.round(delta / timezoneSize)
    const newOffset = lastOffsetRef.current - hourChange
    setTimeOffset(newOffset)
  }

  const resetToLiveTime = () => {
    setCurrentTime(new Date())
    setTimeOffset(0)
    lastOffsetRef.current = 0
  }

  const getTimezoneColors = () => {
    return timezones.map(tz => {
      const localTime = new Date(currentTime.getTime() + getTimezoneOffset(tz.name) + timeOffset * 3600000)
      const hours = localTime.getHours()
      return { tz: tz.name, color: getGradientColor(hours) }
    })
  }

  const getTextColor = (timezone: string) => {
    const localTime = new Date(currentTime.getTime() + getTimezoneOffset(timezone) + timeOffset * 3600000)
    const hours = localTime.getHours()
    return (hours >= 18 || hours < 6) ? 'text-white' : 'text-black'
  }

  const timezoneColors = getTimezoneColors()

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
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full">
        {timezones.map((tz) => {
          const bgColor = timezoneColors.find(tc => tc.tz === tz.name)?.color || '#000000'
          return (
            <div
              key={`gradient-${tz.name}`}
              className="flex-1"
              style={{
                background: bgColor,
                flexBasis: `${100 / 24}%`,
              }}
            />
          )
        })}
      </div>
      <div className="absolute inset-0 flex items-stretch md:items-center justify-center pointer-events-none">
        <div className="flex flex-col md:flex-row w-full h-full md:h-auto">
          {timezones.map((tz) => {
            const textColor = getTextColor(tz.name)
            return (
              <div
                key={tz.name}
                className="flex-1 flex md:flex-col items-center justify-between px-6 md:px-0.5 py-1 md:py-1 md:justify-center relative pointer-events-auto"
                style={{
                  flexBasis: `${100 / 24}%`,
                  minHeight: 'auto',
                  minWidth: 'auto',
                }}
              >
                <div className="relative z-10 w-full h-full flex items-center md:flex-col md:items-center justify-between md:justify-center">
                  <div className="flex items-center md:flex-col md:items-center relative">
                    {tz.name === userTimezone && (
                      <div 
                        className="absolute w-1 h-1 bg-orange-500 rounded-full md:left-1/2 md:-translate-x-1/2 md:-top-1.5 -left-2 top-1/2 -translate-y-1/2" 
                        aria-hidden="true"
                      />
                    )}
                    <div className="md:hidden flex items-center space-x-2">
                      <p className={`${textColor} text-[11px] font-mono`}>
                        {formatInTimeZone(new Date(currentTime.getTime() + timeOffset * 3600000), tz.name, 'HH:mm')}
                      </p>
                      <div className="group relative cursor-help">
                        <p className={`${textColor} text-[11px] font-bold`}>
                          {tz.cityAbbr}
                        </p>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-10">
                          <div className="bg-[#1A1A1A] text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                            {tz.cityFull}
                          </div>
                          <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-[#1A1A1A] w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex md:flex-col md:items-center">
                      <p className={`${textColor} text-[8px] font-mono mb-0.5`}>
                        {formatInTimeZone(new Date(currentTime.getTime() + timeOffset * 3600000), tz.name, 'HH:mm')}
                      </p>
                      <div className="group relative cursor-help">
                        <p className={`${textColor} text-[10px] font-bold`}>
                          {tz.cityAbbr}
                        </p>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-10">
                          <div className="bg-[#1A1A1A] text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                            {tz.cityFull}
                          </div>
                          <div className="border-t-4 border-l-4 border-r-4 border-transparent border-t-[#1A1A1A] w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex md:flex-col md:items-center md:mt-0.5">
                      <p className={`${textColor} text-[8px] font-mono`}>
                        {formatInTimeZone(new Date(currentTime.getTime() + timeOffset * 3600000), tz.name, 'EEE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center md:hidden">
                    <div className="flex items-center space-x-1">
                      <p className={`${textColor} text-[8px] opacity-75`}>
                        {tz.utcOffset}
                      </p>
                      <p className={`${textColor} text-[8px] font-mono`}>
                        {formatInTimeZone(new Date(currentTime.getTime() + timeOffset * 3600000), tz.name, 'EEE')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 hidden md:flex justify-center pb-2">
        {timezones.map((tz) => (
          <div key={`utc-${tz.name}`} className="flex-1 text-center" style={{ flexBasis: `${100 / 24}%` }}>
            <p className={`${getTextColor(tz.name)} text-[8px] opacity-75`}>
              {tz.utcOffset}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
