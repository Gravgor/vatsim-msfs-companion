'use client'

import { memo } from 'react'
import { Marker } from 'react-map-gl'
import { Plane } from 'lucide-react'
import { VatsimData } from '@/types/vatsim'
import { useSettingsStore } from '@/store/settings'
import { Source, Layer } from 'react-map-gl'
import { useFlightPath } from '@/hooks/useFlightPath'
import { cn } from '@/lib/utils/cn'

interface PlaneMarkerProps {
  pilot: VatsimData['pilots'][0]
  isSelected: boolean
  onClick: () => void
}

export const PlaneMarker = memo(function PlaneMarker({ 
  pilot, 
  isSelected, 
  onClick 
}: PlaneMarkerProps) {
  const { userCallsign, userCid } = useSettingsStore()
  const isUserPlane = pilot.callsign === userCallsign || pilot.cid.toString() === userCid.toString()
  const { flightPaths, isVisible } = useFlightPath(
    //@ts-ignore
    pilot.flight_plan?.departure,
    pilot.flight_plan?.arrival,
    isSelected
  )
  const flightPath = flightPaths ? flightPaths.features : null

  if (!pilot.latitude || !pilot.longitude || 
      isNaN(pilot.latitude) || isNaN(pilot.longitude)) {
    return null
  }

  return (
    <>
      <Marker
        longitude={pilot.longitude}
        latitude={pilot.latitude}
        anchor="center"
        onClick={onClick}
      >
        <div
          style={{
            transform: `rotate(${pilot.heading}deg)`,
            transition: 'all 0.3s ease',
          }}
          className={`
            cursor-pointer
            ${isSelected ? 'scale-150' : 'hover:scale-125'}
            ${isUserPlane 
              ? 'text-yellow-400 hover:text-yellow-300 z-50' 
              : 'text-blue-500 hover:text-blue-400'}
            ${isUserPlane ? 'scale-150' : ''}
          `}
        >
          <Plane 
            size={isUserPlane ? 24 : 20} 
            className="transform -rotate-45"
          />
        </div>
      </Marker>

      {isSelected && isVisible && flightPath && (
        <Source
          id={`route-${pilot.callsign}`}
          type="geojson"
          data={flightPath}
        >
          <Layer
            id={`route-line-${pilot.callsign}`}
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 2,
              'line-dasharray': [2, 1],
              'line-opacity': 0.8
            }}
          />
          <Layer
            id={`route-symbols-${pilot.callsign}`}
            type="symbol"
            layout={{
              'symbol-placement': 'line',
              'symbol-spacing': 200,
              'text-field': '▶',
              'text-size': 12,
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            }}
            paint={{
              'text-color': '#3b82f6',
              'text-opacity': 0.8
            }}
          />
        </Source>
      )}
    </>
  )
}) 