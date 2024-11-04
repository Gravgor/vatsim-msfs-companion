import { createClient } from 'redis'
if (!process.env.REDIS_URL) {
  throw new Error('Redis URL is not set')
}

const client = createClient({
  url: process.env.REDIS_URL
})

client.on('error', (err: any) => console.error('Redis Client Error', err))
client.on('connect', () => console.log('Redis Client Connected'))

// Connect to Redis
client.connect()

export const redis = client

export const REDIS_KEYS = {
  AIRPORT_BLACKLIST: 'airport:blacklist',
  AIRPORT_DATA: (icao: string) => `airport:data:${icao}`,
  WEATHER_ALL: 'weather:all',
  WEATHER_METARS: 'weather:metars',
  WEATHER_METAR: (icao: string) => `weather:metar:${icao}`,
  WEATHER_RADAR: 'weather:radar',
  WEATHER_WIND: 'weather:wind',
  WEATHER_FRONTS: 'weather:fronts'
}

export const CACHE_DURATION = {
  BLACKLIST: 30 * 24 * 60 * 60, // 30 days in seconds
  AIRPORT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds for cookies
} 