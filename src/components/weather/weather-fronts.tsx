'use client'

import { WeatherFront } from '@/types/weather'
import { getFrontColor, getFrontSymbol } from '@/utils/weather'
import { memo } from 'react'
import { Source, Layer } from 'react-map-gl'

interface WeatherFrontsProps {
  data: WeatherFront[]
}

export const WeatherFronts = memo(function WeatherFronts({ 
  data 
}: WeatherFrontsProps) {
    console.log(data)
  const frontsGeoJson = {
    type: 'FeatureCollection',
    features: data.map(front => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: front.coordinates
      },
      properties: {
        type: front.type,
        color: getFrontColor(front.type),
        symbol: getFrontSymbol(front.type)
      }
    }))
  }

  return (
    <>
      {/* Front Lines */}
      <Source id="weather-fronts" type="geojson" data={frontsGeoJson}>
        <Layer
          id="front-lines"
          type="line"
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 2
          }}
        />
        
        {/* Front Symbols */}
        <Layer
          id="front-symbols"
          type="symbol"
          layout={{
            'symbol-placement': 'line',
            'text-field': ['get', 'symbol'],
            'text-size': 12,
            'text-allow-overlap': true,
            'text-keep-upright': true
          }}
          paint={{
            'text-color': ['get', 'color']
          }}
        />
      </Source>
    </>
  )
}) 