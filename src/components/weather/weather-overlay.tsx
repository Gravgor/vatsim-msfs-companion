'use client'

import { memo } from 'react'
import { useSettingsStore } from '@/store/settings'
import { RadarOverlay } from './radar-overlay'
import { WindLayer } from './wind-layer'
import { WeatherFronts } from './weather-fronts'
import { useWeatherData } from '@/hooks/useWeatherData'

interface WeatherOverlayProps {
  visible?: boolean
}

export const WeatherOverlay = memo(function WeatherOverlay({ 
  visible = true 
}: WeatherOverlayProps) {
  const { mapSettings } = useSettingsStore()
  const weatherSettings = mapSettings?.weather || {
    showRadar: true,
    showWind: true,
    showFronts: true
  }

  // Check if any weather layer is enabled
  const isVisible = visible && Object.values(weatherSettings).some(Boolean)
  const { data, loading } = useWeatherData(isVisible)

  if (!isVisible || !data) return null

  return (
    <>
      
        <RadarOverlay data={data.radar} />
      
      {weatherSettings.showWind && (
        <WindLayer data={data.wind} />
      )}
      
        <WeatherFronts data={data.fronts} />
    </>
  )
}) 