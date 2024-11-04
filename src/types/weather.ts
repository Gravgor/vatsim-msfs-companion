export interface WeatherData {
  metars: MetarData[]
  radar: RadarData
  wind: WindData[]
  fronts: WeatherFront[]
}

export interface MetarData {
  station: string
  latitude: number
  longitude: number
  temperature: number
  dewpoint: number
  visibility: number
  wind_direction: number
  wind_speed: number
  flight_category: 'VFR' | 'MVFR' | 'IFR' | 'LIFR'
  raw_text: string
  clouds: Array<{
    cover: string
    base: number
  }>
}

export interface RadarData {
  tileUrl: string
  timestamp: string
  bounds: [number, number, number, number]
}

export interface WindData {
  latitude: number
  longitude: number
  altitude: number
  direction: number
  speed: number
}

export interface WeatherFront {
  type: 'COLD' | 'WARM' | 'STATIONARY' | 'OCCLUDED'
  coordinates: [number, number][]
  timestamp: string
} 