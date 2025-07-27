"use client"

import { useState, useEffect } from "react"
import { formatInTimeZone } from "date-fns-tz"
import { getCitiesForTimezone, type CityInfo } from "../utils/cityData"
import { Crown, Users, MapPin } from "lucide-react"

interface CityPanelProps {
  isVisible: boolean
  timezoneOffset: number
  timezoneName: string
  currentTime: Date
  timeOffset: number
}

export function CityPanel({ isVisible, timezoneOffset, timezoneName, currentTime, timeOffset }: CityPanelProps) {
  const [cities, setCities] = useState<CityInfo[]>([])

  useEffect(() => {
    if (isVisible) {
      const cityData = getCitiesForTimezone(timezoneOffset)
      setCities(cityData)
    }
  }, [isVisible, timezoneOffset])

  const formatPopulation = (population?: number) => {
    if (!population) return null
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`
    }
    return population.toString()
  }

  const getLocalTime = () => {
    return formatInTimeZone(new Date(currentTime.getTime() + timeOffset * 3600000), timezoneName, "HH:mm:ss")
  }

  const getLocalDate = () => {
    return formatInTimeZone(new Date(currentTime.getTime() + timeOffset * 3600000), timezoneName, "EEEE, MMMM d, yyyy")
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg transform transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ maxHeight: "60vh" }}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              UTC{timezoneOffset >= 0 ? "+" : ""}
              {timezoneOffset}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Major cities in this timezone</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-gray-900">{getLocalTime()}</div>
            <div className="text-sm text-gray-600">{getLocalDate()}</div>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
          {cities.map((city, index) => (
            <div
              key={`${city.name}-${city.country}`}
              className="bg-white/80 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isVisible ? "slideInUp 0.4s ease-out forwards" : "none",
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{city.name}</h3>
                  {city.isCapital && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" title="Capital city" />}
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-2">{city.country}</p>

              {city.population && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{formatPopulation(city.population)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {cities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No major cities data available for this timezone</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
