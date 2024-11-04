'use client'

import { useState, useEffect, useCallback } from 'react'
import Map from 'react-map-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { PlaneMarker } from './plane-marker'
import { FlightInfo } from './flight-info'
import { SettingsButton } from './settings-panel'
import { MapControls } from './map-controls'
import { useSettingsStore } from '@/store/settings'
import { useVatsimData } from '@/hooks/useVatsimData'
import { format } from 'date-fns'
import { VatsimData } from '@/types/vatsim'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { AirportMarker } from './airport-marker'
import { AirportInfo } from './airport-info'
import { getActiveAirports, getAirportTraffic } from '@/services/airport'
import { Airport, AirportTraffic } from '@/types/airport'
import { WeatherOverlay } from './weather/weather-overlay'
import { WeatherControls } from './weather/weather-controls'

const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

export default function MapView() {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  })

  const [selectedPilot, setSelectedPilot] = useState<VatsimData['pilots'][0] | null>(null)
  const { mapSettings, userCallsign } = useSettingsStore()

  const [timeUntilRefresh, setTimeUntilRefresh] = useState(15)

  const [airports, setAirports] = useState<Airport[]>([])
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [airportTraffic, setAirportTraffic] = useState<AirportTraffic | null>(null)

  const { 
    data: vatsimData, 
    loading, 
    error, 
    refresh,
    lastRefresh,
    canRefresh 
  } = useVatsimData({
    autoRefresh: true,
    refreshInterval: 15000,
    onRefresh: async () => {
      if (vatsimData) {
        // Update airports when data refreshes
        const activeAirports = await getActiveAirports(vatsimData)
        setAirports(activeAirports)
        
        // Update traffic for selected airport if any
        if (selectedAirport) {
          const traffic = await getAirportTraffic(vatsimData, selectedAirport.icao)
          setAirportTraffic(traffic)
        }
      }
    }
  })

  // Load initial airports
  useEffect(() => {
    if (vatsimData) {
      getActiveAirports(vatsimData).then(setAirports)
    }
  }, [vatsimData])

  const userAircraft = userCallsign && vatsimData?.pilots
    ? vatsimData.pilots.find(pilot => pilot.callsign === userCallsign)
    : null

  const flyTo = useCallback((longitude: number, latitude: number, zoom: number = 8) => {
    // @ts-ignore - Mapbox GL internal API
    const map = document.querySelector('.mapboxgl-map')?.__mbgl
    if (map) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        duration: 2000,
        essential: true
      })
    }
  }, [])

  // Track user's aircraft if enabled
  useEffect(() => {
    if (mapSettings.followUserAircraft && userAircraft) {
      flyTo(userAircraft.longitude, userAircraft.latitude)
      setSelectedPilot(userAircraft)
    }
  }, [
    mapSettings.followUserAircraft,
    userAircraft?.longitude,
    userAircraft?.latitude,
    userCallsign,
    flyTo
  ])

  // Handle pilot selection
  const handlePilotClick = useCallback((pilot: VatsimData['pilots'][0]) => {
    setSelectedPilot(current => current?.callsign === pilot.callsign ? null : pilot)
    flyTo(pilot.longitude, pilot.latitude)
  }, [flyTo])

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      if (!lastRefresh) {
        setTimeUntilRefresh(15)
        return
      }

      const elapsed = Date.now() - lastRefresh.getTime()
      const remaining = Math.max(0, Math.ceil((15000 - elapsed) / 1000))
      setTimeUntilRefresh(remaining)
    }

    // Update immediately
    updateTimer()

    // Then update every second
    const timerId = setInterval(updateTimer, 1000)

    return () => clearInterval(timerId)
  }, [lastRefresh])

  // Handle airport selection
  const handleAirportClick = useCallback(async (airport: Airport) => {
    if (selectedAirport?.icao === airport.icao) {
      setSelectedAirport(null)
      setAirportTraffic(null)
      return
    }

    setSelectedAirport(airport)
    if (vatsimData) {
      const traffic = await getAirportTraffic(vatsimData, airport.icao)
      setAirportTraffic(traffic)
    }

    // Fly to airport
    flyTo(airport.longitude, airport.latitude, 10)
  }, [selectedAirport, vatsimData])

  // Calculate traffic counts for each airport
  const getAirportTrafficCounts = useCallback((airport: Airport) => {
    if (!vatsimData) return { arrivals: 0, departures: 0 }

    const arrivals = vatsimData.pilots.filter(
      pilot => pilot.flight_plan?.arrival === airport.icao
    ).length

    const departures = vatsimData.pilots.filter(
      pilot => pilot.flight_plan?.departure === airport.icao
    ).length

    return { arrivals, departures }
  }, [vatsimData])

  // Filter out aircraft on the ground (low groundspeed or very low altitude)
  const airborneAircraft = vatsimData?.pilots.filter(pilot => 
    // Aircraft is considered airborne if:
    // 1. Groundspeed is above 50 knots AND
    // 2. Altitude is above 100 feet
    pilot.groundspeed > 50 && pilot.altitude > 100
  ) || []

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={MAP_STYLES[mapSettings.mapStyle]}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100vh' }}
        maxZoom={16}
        minZoom={1}
        reuseMaps
      >
        {/* Data Refresh Controls */}
        <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-slate-800 rounded-lg p-2">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refresh()}
              disabled={loading || !canRefresh}
              className="text-blue-400 hover:text-blue-300 disabled:text-slate-500"
            >
              <RefreshCw 
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
              />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <div className="text-xs text-slate-400 space-x-2">
              <span>
                Last update: {lastRefresh ? format(lastRefresh, 'HH:mm:ss') : 'Never'}
              </span>
              <span>|</span>
              <span>
                Next refresh in: {timeUntilRefresh}s
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-500/80 backdrop-blur-md border border-red-600 rounded-lg p-3">
            <span className="text-sm text-white">
              Error loading data: {error.message}
            </span>
          </div>
        )}

        {/* Airport Markers */}
        {mapSettings.showAirports && airports.map(airport => (
          <AirportMarker
            key={airport.icao}
            airport={airport}
            traffic={getAirportTrafficCounts(airport)}
            onClick={() => handleAirportClick(airport)}
            isSelected={selectedAirport?.icao === airport.icao}
          />
        ))}

        {/* Aircraft Markers - Only show airborne aircraft */}
        {airborneAircraft.map((pilot) => (
          <PlaneMarker
            key={pilot.callsign}
            pilot={pilot}
            isSelected={selectedPilot?.callsign === pilot.callsign}
            onClick={() => handlePilotClick(pilot)}
          />
        ))}

     

        {/* Map Controls */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            <MapControls />
          </div>
        </div>
      </Map>

      {/* Flight Info Panel */}
      {selectedPilot && (
        <div className="absolute top-4 right-4 w-96 animate-in slide-in-from-right duration-300">
          <FlightInfo 
            pilot={selectedPilot} 
            onClose={() => setSelectedPilot(null)}
          />
        </div>
      )}

      {/* Airport Info Panel */}
      {selectedAirport && airportTraffic && (
        <div className="absolute top-4 right-4 w-96 animate-in slide-in-from-right duration-300">
          <AirportInfo
            airport={selectedAirport}
            traffic={airportTraffic}
            onClose={() => {
              setSelectedAirport(null)
              setAirportTraffic(null)
            }}
          />
        </div>
      )}

      {/* Settings Button */}
      <SettingsButton />

      {/* Stats Overlay */}
      <div className="absolute bottom-20 left-4 z-10 bg-black/80 backdrop-blur-md border border-slate-800 rounded-lg p-2">
        <div className="text-xs text-slate-400 space-y-1">
          <div>Total Aircraft: {vatsimData?.pilots.length || 0}</div>
          <div>
            Zoom: {viewState.zoom.toFixed(1)} | 
            Lat: {viewState.latitude.toFixed(2)} | 
            Lon: {viewState.longitude.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
} 