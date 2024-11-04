export interface Airport {
  icao: string
  iata?: string
  name: string
  latitude: number
  longitude: number
  elevation?: number
  country: string
  city?: string
  type: string
}

export interface AirportTraffic {
  airport: Airport
  arrivals: VatsimFlight[]
  departures: VatsimFlight[]
}

export interface AirportWeather {
  airport?: Airport
  metar: string
  taf?: string
  timestamp: string
}

export interface VatsimFlight {
  callsign: string
  aircraft: string
  departure: string
  arrival: string
  eta?: string
  groundspeed: number
  altitude: number
  heading: number
} 