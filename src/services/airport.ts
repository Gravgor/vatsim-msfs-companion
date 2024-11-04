'use server'

import { redis, REDIS_KEYS, CACHE_DURATION } from '@/lib/redis'
import { cookies } from 'next/headers'
import { Airport, AirportTraffic, AirportWeather } from '@/types/airport'
import { VatsimData } from '@/types/vatsim'
import { cache } from 'react'

const AIRPORT_API = 'https://airportdb.io/api/v1/airport'
const API_TOKEN = process.env.AIRPORT_DB_TOKEN

interface AirportDBResponse {
  ident: string
  icao_code: string
  iata_code: string
  name: string
  latitude_deg: number
  longitude_deg: number
  elevation_ft: string
  iso_country: string
  municipality: string
  type: string
  runways: Array<{
    length_ft: string
    width_ft: string
    surface: string
    le_ident: string
    he_ident: string
  }>
  freqs: Array<{
    type: string
    description: string
    frequency_mhz: string
  }>
  country: {
    name: string
  }
}

// Helper function to get blacklist from Redis
async function getBlacklist(): Promise<Set<string>> {
  const blacklist = await redis.sMembers(REDIS_KEYS.AIRPORT_BLACKLIST)
  return new Set<string>(blacklist)
}

// Helper function to update blacklist in Redis
async function updateBlacklist(icao: string) {
  await redis.sAdd(REDIS_KEYS.AIRPORT_BLACKLIST, icao)
  await redis.expire(REDIS_KEYS.AIRPORT_BLACKLIST, CACHE_DURATION.BLACKLIST)
}

// Add cache helper functions
async function getCachedAirport(icao: string): Promise<Airport | null> {
  const data = await redis.get(REDIS_KEYS.AIRPORT_DATA(icao))
  return data ? JSON.parse(data) : null
}

async function cacheAirport(icao: string, data: Airport) {
  await redis.set(
    REDIS_KEYS.AIRPORT_DATA(icao), 
    JSON.stringify(data)
  )
  await redis.expire(
    REDIS_KEYS.AIRPORT_DATA(icao), 
    Math.floor(CACHE_DURATION.AIRPORT / 1000)
  )
}

// Cached fetch function for airport data
export const fetchAirportData = cache(async (icao: string): Promise<Airport | null> => {
  // Check blacklist first
  const blacklist = await getBlacklist()
  if (blacklist.has(icao)) {
    return null
  }

  // Check Redis cache first
  const cachedData = await getCachedAirport(icao)
  if (cachedData) {
    return cachedData
  }

  try {
    console.log(`Fetching data for ${icao}`)
    const response = await fetch(
      `${AIRPORT_API}/${icao}?apiToken=${API_TOKEN}`,
      { 
        next: { revalidate: CACHE_DURATION.AIRPORT / 1000 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'force-cache'
      }
    )

    if (!response.ok) {
      if (response.status === 413 || response.status === 431) {
        console.error(`Headers too large for ${icao}`)
        await updateBlacklist(icao)
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: AirportDBResponse = await response.json()

    const airport: Airport = {
      icao: data.icao_code,
      //@ts-ignore
      iata: data.iata_code || null,
      name: data.name,
      latitude: data.latitude_deg,
      longitude: data.longitude_deg,
      elevation: data.elevation_ft ? parseInt(data.elevation_ft, 10) : undefined,
      country: data.country.name,
      //@ts-ignore
      city: data.municipality || null,
      type: data.type,
    }

    // Cache in Redis
    await cacheAirport(icao, airport)
    return airport
  } catch (error) {
    console.error(`Error fetching airport ${icao}:`, error)
    await updateBlacklist(icao)
    return null
  }
})

// Get all active airports from VATSIM data
export async function getActiveAirports(vatsimData: VatsimData): Promise<Airport[]> {
  const airportCodes = new Set<string>()
  
  vatsimData.pilots.forEach(pilot => {
    if (pilot.flight_plan?.departure) {
      airportCodes.add(pilot.flight_plan.departure)
    }
    if (pilot.flight_plan?.arrival) {
      airportCodes.add(pilot.flight_plan.arrival)
    }
  })

  // Filter out blacklisted airports
  const blacklist = await getBlacklist()
  const validAirportCodes = Array.from(airportCodes)
    .filter(icao => !blacklist.has(icao))

  // Fetch all airport data in parallel
  const airports = await Promise.allSettled(
    validAirportCodes.map(icao => fetchAirportData(icao))
  )

  // Filter out failed requests and nulls
  return airports
    .filter((result): result is PromiseFulfilledResult<Airport> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value)
}

// Get traffic for a specific airport
export async function getAirportTraffic(
  vatsimData: VatsimData, 
  icao: string
): Promise<AirportTraffic | null> {
  const airport = await fetchAirportData(icao)
  if (!airport) return null
  
  const traffic = vatsimData.pilots.filter(pilot => 
    (pilot.flight_plan?.departure === icao || 
     pilot.flight_plan?.arrival === icao) &&
    pilot.groundspeed > 50 && 
    pilot.altitude > 100
  )

  return {
    airport,
    arrivals: traffic
      .filter(pilot => pilot.flight_plan?.arrival === icao)
      .map(pilot => ({
        callsign: pilot.callsign,
        aircraft: pilot.flight_plan?.aircraft || 'Unknown',
        departure: pilot.flight_plan?.departure || 'Unknown',
        arrival: pilot.flight_plan?.arrival || 'Unknown',
        groundspeed: pilot.groundspeed,
        altitude: pilot.altitude,
        heading: pilot.heading,
        eta: "ETA"
      })),
    departures: traffic
      .filter(pilot => pilot.flight_plan?.departure === icao)
      .map(pilot => ({
        callsign: pilot.callsign,
        aircraft: pilot.flight_plan?.aircraft || 'Unknown',
        departure: pilot.flight_plan?.departure || 'Unknown',
        arrival: pilot.flight_plan?.arrival || 'Unknown',
        groundspeed: pilot.groundspeed,
        altitude: pilot.altitude,
        heading: pilot.heading
      }))
  }
}

// Get weather data for an airport
export async function getAirportWeather(icao: string): Promise<AirportWeather> {
  const airport = await fetchAirportData(icao)
  
  // You can add METAR/TAF API integration here
  // For now, returning placeholder data
  return {
    metar: 'METAR data not available',
    taf: 'TAF data not available',
    timestamp: new Date().toISOString(),
    // @ts-ignore
    airport
  }
} 