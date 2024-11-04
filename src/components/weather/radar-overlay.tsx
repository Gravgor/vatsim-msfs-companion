'use client'

import { RadarData } from '@/types/weather'
import { memo } from 'react'
import { Source, Layer } from 'react-map-gl'

interface RadarOverlayProps {
  data: RadarData
}

export const RadarOverlay = memo(function RadarOverlay({ 
  data 
}: RadarOverlayProps) {
  return (
    <Source
      id="weather-radar"
      type="raster"
      tiles={[data.tileUrl]}
      tileSize={256}
    >
      <Layer
        id="weather-radar-layer"
        type="raster"
        paint={{
          'raster-opacity': 0.7,
          'raster-fade-duration': 0
        }}
      />
    </Source>
  )
}) 