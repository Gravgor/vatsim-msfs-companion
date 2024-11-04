'use client'

import { memo } from 'react'
import { Marker, useMap } from 'react-map-gl'
import { Building2, Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react'
import { Airport } from '@/types/airport'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils/cn'

interface AirportMarkerProps {
  airport: Airport
  traffic: {
    arrivals: number
    departures: number
  }
  onClick: () => void
  isSelected: boolean
}

export const AirportMarker = memo(function AirportMarker({
  airport,
  traffic,
  onClick,
  isSelected
}: AirportMarkerProps) {
  const { current: map } = useMap()
  const zoom = map?.getZoom() || 1
  const totalTraffic = traffic.arrivals + traffic.departures
  
  // Scale based on zoom level
  const baseScale = 0.5 // Even smaller base size
  const zoomScale = Math.min(1, zoom / 8)
  const scale = baseScale + (zoomScale * 0.4)

  return (
    <Marker
      longitude={airport.longitude}
      latitude={airport.latitude}
      anchor="center"
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              onClick={onClick}
              className={cn(
                "relative cursor-pointer transition-all duration-200",
                isSelected ? "scale-150 z-50" : "hover:scale-125"
              )}
              style={{
                transform: `scale(${isSelected ? scale * 1.5 : scale})`
              }}
            >
              <Building2 
                className={cn(
                  "w-4 h-4 transition-colors",
                  isSelected 
                    ? "text-yellow-400" 
                    : totalTraffic > 0 
                      ? "text-slate-300/80" 
                      : "text-slate-400/50"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-black/90 border-slate-800 backdrop-blur-md"
          >
            <div className="space-y-2 min-w-[200px]">
              {/* Airport Header */}
              <div className="border-b border-slate-800 pb-2">
                <div className="font-bold text-white">{airport.name}</div>
                <div className="text-sm text-slate-400">
                  {airport.icao} {airport.iata && `/ ${airport.iata}`}
                </div>
                {airport.city && (
                  <div className="text-xs text-slate-500">
                    {airport.city}, {airport.country}
                  </div>
                )}
              </div>

              {/* Traffic Info */}
              <div className="space-y-1.5">
                {/* Arrivals */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <PlaneLanding className="w-4 h-4" />
                    <span>Arrivals</span>
                  </div>
                  <span className={cn(
                    "font-medium",
                    traffic.arrivals > 0 ? "text-blue-400" : "text-slate-500"
                  )}>
                    {traffic.arrivals}
                  </span>
                </div>

                {/* Departures */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <PlaneTakeoff className="w-4 h-4" />
                    <span>Departures</span>
                  </div>
                  <span className={cn(
                    "font-medium",
                    traffic.departures > 0 ? "text-blue-400" : "text-slate-500"
                  )}>
                    {traffic.departures}
                  </span>
                </div>

                {/* Total */}
                {totalTraffic > 0 && (
                  <div className="flex items-center justify-between text-sm pt-1.5 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Plane className="w-4 h-4" />
                      <span>Total Traffic</span>
                    </div>
                    <span className="font-medium text-white">
                      {totalTraffic}
                    </span>
                  </div>
                )}
              </div>

              {/* Airport Info */}
              {airport.elevation && (
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                  Elevation: {airport.elevation.toLocaleString()}ft
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Marker>
  )
}) 