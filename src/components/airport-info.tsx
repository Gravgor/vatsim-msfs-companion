'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Airport, AirportTraffic, AirportWeather } from '@/types/airport'
import { getAirportMetar } from '@/services/weather'
import { X, Plane, CloudRain } from 'lucide-react'
import { Button } from './ui/button'
import { format } from 'date-fns'

interface AirportInfoProps {
  airport: Airport
  traffic: AirportTraffic
  onClose: () => void
}

export function AirportInfo({ airport, traffic, onClose }: AirportInfoProps) {
  const [weather, setWeather] = useState<AirportWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchWeather() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAirportMetar(airport.icao)
        if (mounted) {
          setWeather(data)
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to fetch weather data')
          console.error(err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchWeather()
    
    // Refresh weather every 5 minutes
    const intervalId = setInterval(fetchWeather, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [airport.icao])

  return (
    <Card className="bg-black/80 backdrop-blur-md border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="text-lg font-bold text-white">
            {airport.name} ({airport.icao})
          </h3>
          <p className="text-sm text-slate-400">
            {airport.city}, {airport.country}
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
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="traffic">
          <TabsList className="w-full">
            <TabsTrigger value="traffic" className="flex-1">
              <Plane className="w-4 h-4 mr-2" />
              Traffic ({traffic.arrivals.length + traffic.departures.length})
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex-1">
              <CloudRain className="w-4 h-4 mr-2" />
              Weather
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traffic" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">
                Arrivals ({traffic.arrivals.length})
              </h4>
              {traffic.arrivals.length === 0 ? (
                <p className="text-sm text-slate-500">No arriving traffic</p>
              ) : (
                traffic.arrivals.map(flight => (
                  <div
                    key={flight.callsign}
                    className="flex items-center justify-between text-sm bg-black/40 p-2 rounded"
                  >
                    <div>
                      <div className="text-white font-medium">{flight.callsign}</div>
                      <div className="text-slate-400 text-xs">
                        {flight.aircraft} • {flight.altitude}ft
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400">
                        From: {flight.departure}
                      </div>
                      {flight.eta && (
                        <div className="text-xs text-blue-400">
                          ETA: {flight.eta}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">
                Departures ({traffic.departures.length})
              </h4>
              {traffic.departures.length === 0 ? (
                <p className="text-sm text-slate-500">No departing traffic</p>
              ) : (
                traffic.departures.map(flight => (
                  <div
                    key={flight.callsign}
                    className="flex items-center justify-between text-sm bg-black/40 p-2 rounded"
                  >
                    <div>
                      <div className="text-white font-medium">{flight.callsign}</div>
                      <div className="text-slate-400 text-xs">
                        {flight.aircraft} • {flight.altitude}ft
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400">
                        To: {flight.arrival}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="weather" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLoading(true)
                    setError(null)
                    getAirportMetar(airport.icao)
                      .then(data => setWeather(data))
                      .catch(err => setError('Failed to fetch weather data'))
                      .finally(() => setLoading(false))
                  }}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : weather ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-400">METAR</h4>
                    <span className="text-xs text-slate-500">
                      Updated: {format(new Date(weather.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded">
                    <p className="text-sm text-white font-mono break-words">
                      {weather.metar}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 text-center">
                  Weather data provided by VATSIM
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 