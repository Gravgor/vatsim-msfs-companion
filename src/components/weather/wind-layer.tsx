'use client'

import { memo } from 'react'
import { Source, Layer } from 'react-map-gl'
import { WindData } from '@/types/weather'
import { getWindBarb } from '@/utils/weather'

interface WindLayerProps {
  data: WindData[]
}

export const WindLayer = memo(function WindLayer({ 
  data 
}: WindLayerProps) {
  const windGeoJson = {
    type: 'FeatureCollection',
    features: data.map(point => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
      },
      properties: {
        rotation: point.direction,
        speed: point.speed,
        symbol: getWindBarb({ speed: point.speed })
      }
    }))
  }

  return (
    <Source id="wind-layer" type="geojson" data={windGeoJson}>
      <Layer
        id="wind-symbols"
        type="symbol"
        layout={{
          'text-field': ['get', 'symbol'],
          'text-size': 16,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-rotate': ['get', 'rotation']
        }}
        paint={{
          'text-color': '#3b82f6'
        }}
      />
    </Source>
  )
}) 