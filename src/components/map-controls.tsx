'use client'

import { Layers, Cloud, Plane, Navigation, Map as MapIcon, Route } from 'lucide-react'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { MapSettings, useSettingsStore } from '@/store/settings'
import { cn } from '@/lib/utils/cn'

export function MapControls() {
  const { mapSettings, updateMapSettings } = useSettingsStore()

  const controls = [
    {
      icon: <Layers className="h-4 w-4" />,
      label: 'Airports',
      setting: 'showAirports',
    },
    {
      icon: <Cloud className="h-4 w-4" />,
      label: 'Weather',
      setting: 'showWeather',
    },
    {
      icon: <Navigation className="h-4 w-4" />,
      label: 'FIR Boundaries',
      setting: 'showFIRBoundaries',
    },
    {
      icon: <Plane className="h-4 w-4" />,
      label: 'Airspace',
      setting: 'showAirspace',
    },
    {
      icon: <Plane className="h-4 w-4" />,
      label: 'Labels',
      setting: 'showLabels',
    },
    {
      icon: <Route className="h-4 w-4" />,
      label: 'Flight Path',
      setting: 'showFlightPath',
    },
  ]

  return (
    <div className="absolute left-4 top-4 flex flex-col gap-2">
      <div className="bg-black/80 backdrop-blur-md border border-slate-800 rounded-lg p-2">
        <TooltipProvider>
          <div className="flex flex-col gap-2">
            {controls.map(({ icon, label, setting }) => (
              <Tooltip key={setting}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-md',
                      !mapSettings[setting as keyof MapSettings] && 'opacity-50 text-slate-500',
                      mapSettings[setting as keyof MapSettings] && 'bg-blue-500/20 text-blue-400'
                    )}
                    onClick={() =>
                      updateMapSettings({ [setting]: !mapSettings[setting] })
                    }
                  >
                    {icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      <div className="bg-black/80 backdrop-blur-md border border-slate-800 rounded-lg p-2">
        <TooltipProvider>
          <div className="flex flex-col gap-2">
            {['dark', 'satellite', 'light'].map((style) => (
              <Tooltip key={style}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-md',
                      mapSettings.mapStyle !== style && 'opacity-50 text-slate-500',
                      mapSettings.mapStyle === style && 'bg-blue-500/20 text-blue-400'
                    )}
                    onClick={() =>
                      updateMapSettings({ mapStyle: style as MapSettings['mapStyle'] })
                    }
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="capitalize">{style} Map</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
} 