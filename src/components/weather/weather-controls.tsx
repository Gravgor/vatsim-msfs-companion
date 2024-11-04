'use client'

import { Cloud, CloudRain, Wind, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settings'
import { cn } from '@/lib/utils/cn'

export function WeatherControls() {
  const { mapSettings, updateWeatherSettings } = useSettingsStore()
  
  // Ensure we have weather settings with defaults
  const weatherSettings = mapSettings?.weather || {
    showMetars: false,
    showRadar: true,
    showWind: true,
    showFronts: true
  }

  const controls = [
    {
      key: 'showMetars',
      icon: Cloud,
      label: 'METARs',
      title: 'Toggle METAR stations'
    },
    {
      key: 'showRadar',
      icon: CloudRain,
      label: 'Radar',
      title: 'Toggle weather radar'
    },
    {
      key: 'showWind',
      icon: Wind,
      label: 'Winds',
      title: 'Toggle wind layers'
    },
    {
      key: 'showFronts',
      icon: Waves,
      label: 'Fronts',
      title: 'Toggle weather fronts'
    }
  ] as const

  return (
    <div className="absolute bottom-5 left-5 flex flex-col gap-2 bg-slate-900/90 p-2 rounded-lg">
      <div className="text-xs text-slate-400 px-2">Weather Layers</div>
      <div className="flex flex-col gap-1">
        {controls.map(({ key, icon: Icon, label, title }) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            title={title}
            onClick={() => 
              updateWeatherSettings({ 
                [key]: !weatherSettings[key] 
              })
            }
            className={cn(
              "justify-start gap-2",
              weatherSettings[key] 
                ? "bg-slate-700/50 text-white" 
                : "text-slate-400"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
} 