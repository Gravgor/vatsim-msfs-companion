'use client'

import { VatsimData } from '@/types/vatsim'
import { Card, CardContent, CardHeader } from './ui/card'
import { X, Plane, Navigation, Gauge, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils/cn'

interface FlightInfoProps {
  pilot: VatsimData['pilots'][0]
  onClose: () => void
}

export function FlightInfo({ pilot, onClose }: FlightInfoProps) {
  return (
    <Card className="bg-black/80 backdrop-blur-md border-slate-800 shadow-xl">
      {/* Header */}
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{pilot.callsign}</h3>
            <p className="text-sm text-blue-400">
              {pilot.flight_plan?.aircraft || 'Unknown Aircraft'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-800"
          >
            <X size={16} className="text-slate-400" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Flight Data */}
        <div className="grid grid-cols-3 gap-4">
          <FlightDataItem
            icon={<Plane className="rotate-0" />}
            label="Altitude"
            value={`${pilot.altitude.toLocaleString()}`}
            unit="ft"
          />
          <FlightDataItem
            icon={<Gauge />}
            label="Speed"
            value={`${pilot.groundspeed}`}
            unit="kts"
          />
          <FlightDataItem
            icon={<Navigation />}
            label="Heading"
            value={`${pilot.heading}`}
            unit="°"
          />
        </div>

        {/* Flight Plan */}
        {pilot.flight_plan && (
          <div className="space-y-3">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            
            <div className="flex items-center justify-between space-x-4">
              <RoutePoint
                code={pilot.flight_plan.departure}
                label="Departure"
              />
              <div className="flex-1 flex items-center justify-center">
                <ArrowRight className="text-blue-500" size={20} />
              </div>
              <RoutePoint
                code={pilot.flight_plan.arrival}
                label="Arrival"
              />
            </div>

            {/* Route */}
            <div className="mt-4">
              <p className="text-xs text-slate-400 mb-1">Route</p>
              <p className="text-sm text-slate-300 font-mono leading-relaxed break-all">
                {pilot.flight_plan.route || 'No route filed'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FlightDataItem({ 
  icon, 
  label, 
  value, 
  unit 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-1">
      <div className="text-blue-500">
        {icon}
      </div>
      <p className="text-lg font-medium text-white">
        {value}<span className="text-sm text-slate-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function RoutePoint({ 
  code, 
  label 
}: { 
  code: string
  label: string
}) {
  return (
    <div className={cn(
      "flex flex-col items-center",
      "px-3 py-2 rounded-lg",
      "bg-slate-900/50 border border-slate-800"
    )}>
      <p className="text-sm font-medium text-white">{code}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
} 