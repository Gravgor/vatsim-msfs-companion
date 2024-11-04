'use server'

import { redis, REDIS_KEYS, CACHE_DURATION } from '@/lib/redis'
import { Airport } from '@/types/airport'
import { 
  WeatherData, 
  MetarData, 
  RadarData, 
  WindData, 
  WeatherFront 
} from '@/types/weather'

const CHECKWX_API = 'https://api.checkwx.com/metar'
const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json'
const OPENWEATHER_API = 'https://api.openweathermap.org/data/3.0'
const AWC_API = 'https://aviationweather.gov/api/data'

// Add your API keys to .env
const CHECKWX_KEY = process.env.CHECKWX_API_KEY
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY

const VATSIM_METAR_API = 'https://metar.vatsim.net'

interface AirportMetar {
  metar: string
  taf?: string
  timestamp: string
}

export async function getAirportMetar(icao: string): Promise<AirportMetar | null> {
  try {
    // Check Redis cache first
    const cacheKey = `${REDIS_KEYS.WEATHER_METAR}:${icao}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Fetch from VATSIM API
    const response = await fetch(`${VATSIM_METAR_API}/${icao}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch METAR for ${icao}`)
    }

    const rawMetar = await response.text()
    
    const metarData: AirportMetar = {
      metar: rawMetar,
      timestamp: new Date().toISOString()
    }

    // Cache the METAR
    await redis.setEx(
      cacheKey,
      300, // 5 minutes
      JSON.stringify(metarData)
    )

    return metarData
  } catch (error) {
    console.error(`Error fetching METAR for ${icao}:`, error)
    return null
  }
}

export async function getGlobalWeather(): Promise<WeatherData> {
  try {
    // Try to get cached data first
    const cachedData = await getCachedWeatherData()
    if (cachedData) {
      return cachedData
    }

    // Fetch all weather data in parallel
    const [metars, radar, wind, fronts] = await Promise.all([
      fetchMetars(),
      fetchRadar(),
      fetchWindData(),
      fetchWeatherFronts()
    ])

    const weatherData: WeatherData = {
      metars,
      radar,
      wind,
      fronts
    }

    // Cache the results
    await cacheWeatherData(weatherData)

    return weatherData
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}

async function fetchMetars(): Promise<MetarData[]> {
  try {
    // Check cache first
    const cachedMetars = await redis.get(REDIS_KEYS.WEATHER_METARS)
    if (cachedMetars) {
      return JSON.parse(cachedMetars)
    }

    const response = await fetch(`${CHECKWX_API}/all`, {
      headers: {
        'X-API-Key': CHECKWX_KEY!,
        'Accept': 'application/json'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error('Failed to fetch METAR data')
    }

    const data = await response.json()
    const metars: MetarData[] = data.data.map((metar: any) => ({
      station: metar.station.icao,
      latitude: parseFloat(metar.station.geometry.coordinates[1]),
      longitude: parseFloat(metar.station.geometry.coordinates[0]),
      temperature: metar.temperature?.celsius,
      dewpoint: metar.dewpoint?.celsius,
      visibility: metar.visibility?.meters,
      wind_direction: metar.wind?.degrees,
      wind_speed: metar.wind?.speed_kts,
      flight_category: metar.flight_category,
      raw_text: metar.raw_text,
      clouds: metar.clouds?.map((cloud: any) => ({
        cover: cloud.code,
        base: cloud.base_feet_agl
      })) || []
    }))

    await redis.setEx(
      REDIS_KEYS.WEATHER_METARS,
      300, // 5 minutes
      JSON.stringify(metars)
    )

    return metars
  } catch (error) {
    console.error('Error fetching METAR data:', error)
    return []
  }
}

async function fetchRadar(): Promise<RadarData> {
  try {
    // Check cache first
    const cachedRadar = await redis.get(REDIS_KEYS.WEATHER_RADAR)
    if (cachedRadar) {
      return JSON.parse(cachedRadar)
    }

    const response = await fetch(RAINVIEWER_API)
    if (!response.ok) {
      throw new Error('Failed to fetch radar data')
    }

    const data = await response.json()
    const latestTimestamp = data.radar.past[data.radar.past.length - 1]
    
    const radarData: RadarData = {
      tileUrl: `https://tilecache.rainviewer.com/v2/radar/${latestTimestamp}/256/{z}/{x}/{y}/2/1_1.png`,
      timestamp: new Date(latestTimestamp * 1000).toISOString(),
      bounds: [-180, -85, 180, 85] // World bounds
    }


    await redis.setEx(
      REDIS_KEYS.WEATHER_RADAR,
      300, // 5 minutes
      JSON.stringify(radarData)
    )

    return radarData
  } catch (error) {
    console.error('Error fetching radar data:', error)
    throw error
  }
}

async function fetchWindData(): Promise<WindData[]> {
  try {
    // Check cache first
    const cachedWind = await redis.get(REDIS_KEYS.WEATHER_WIND)
    if (cachedWind) {
      return JSON.parse(cachedWind)
    }

    // Fetch global wind data from OpenWeather API
    const response = await fetch(
      `${OPENWEATHER_API}/global/wind?appid=${OPENWEATHER_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error('Failed to fetch wind data')
    }

    const data = await response.json()
    const windData: WindData[] = []

    // Process the grid data into points
    for (let lat = -80; lat <= 80; lat += 5) {
      for (let lon = -180; lon <= 180; lon += 5) {
        const gridPoint = data.list.find((point: any) => 
          Math.abs(point.lat - lat) < 2.5 && 
          Math.abs(point.lon - lon) < 2.5
        )

        if (gridPoint) {
          windData.push({
            latitude: lat,
            longitude: lon,
            altitude: 0, // surface wind
            direction: gridPoint.wind.deg,
            speed: gridPoint.wind.speed
          })
        }
      }
    }


    await redis.setEx(
      REDIS_KEYS.WEATHER_WIND,
      3600, // 1 hour
      JSON.stringify(windData)
    )

    return windData
  } catch (error) {
    console.error('Error fetching wind data:', error)
    return []
  }
}

async function fetchWeatherFronts(): Promise<WeatherFront[]> {
  try {
    // Check cache first
    const cachedFronts = await redis.get(REDIS_KEYS.WEATHER_FRONTS)
    if (cachedFronts) {
      return JSON.parse(cachedFronts)
    }

    // Fetch fronts from Aviation Weather Center
    const response = await fetch(
      `${AWC_API}/front/all`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error('Failed to fetch weather fronts')
    }

    const data = await response.json()
    const fronts: WeatherFront[] = data.features.map((feature: any) => ({
      type: feature.properties.type.toUpperCase(),
      coordinates: feature.geometry.coordinates,
      timestamp: feature.properties.timestamp
    }))

    // Cache the results
    await redis.setEx(
      REDIS_KEYS.WEATHER_FRONTS,
      3600, // 1 hour
      JSON.stringify(fronts)
    )

    return fronts
  } catch (error) {
    console.error('Error fetching weather fronts:', error)
    return []
  }
}

async function getCachedWeatherData(): Promise<WeatherData | null> {
  const cached = await redis.get(REDIS_KEYS.WEATHER_ALL)
  return cached ? JSON.parse(cached) : null
}

async function cacheWeatherData(data: WeatherData): Promise<void> {
  await redis.setEx(
    REDIS_KEYS.WEATHER_ALL,
    300, // 5 minutes
    JSON.stringify(data)
  )
} 