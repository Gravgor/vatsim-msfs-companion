import { useState, useEffect } from 'react'
import { Feature, LineString, FeatureCollection } from 'geojson'
import { fetchAirportData } from '@/services/airport'
import { VatsimData } from '@/types/vatsim'

export function useFlightPath(
  pilot: VatsimData['pilots'][0],
  isVisible: boolean,
  options = {
    includeMidPoints: true,
    smoothPath: true,
    pastPathOpacity: 0.4,
    futurePathOpacity: 0.8
  }
) {
  const [flightPaths, setFlightPaths] = useState<FeatureCollection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!pilot || !isVisible || !pilot.flight_plan) {
      setFlightPaths(null)
      return
    }

    async function createFlightPaths() {
      try {
        setLoading(true)
        setError(null)

        const { departure, arrival } = pilot.flight_plan
        const currentPosition: [number, number] = [pilot.longitude, pilot.latitude]

        // Fetch airport coordinates
        const [depAirport, arrAirport] = await Promise.all([
          fetchAirportData(departure),
          fetchAirportData(arrival)
        ])

        if (!depAirport || !arrAirport) {
          throw new Error('Could not fetch airport data')
        }

        // Create past path (from departure to current position)
        const pastPath: Feature<LineString> = {
          type: 'Feature',
          properties: { 
            type: 'past',
            opacity: options.pastPathOpacity 
          },
          geometry: {
            type: 'LineString',
            coordinates: createPathCoordinates(
              [depAirport.longitude, depAirport.latitude],
              currentPosition,
              options
            )
          }
        }

        // Create future path (from current position to arrival)
        const futurePath: Feature<LineString> = {
          type: 'Feature',
          properties: { 
            type: 'future',
            opacity: options.futurePathOpacity 
          },
          geometry: {
            type: 'LineString',
            coordinates: createPathCoordinates(
              currentPosition,
              [arrAirport.longitude, arrAirport.latitude],
              options
            )
          }
        }

        // Combine into a FeatureCollection
        const featureCollection: FeatureCollection = {
          type: 'FeatureCollection',
          features: [pastPath, futurePath]
        }

        setFlightPaths(featureCollection)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create flight path'))
        console.error('Flight path error:', err)
      } finally {
        setLoading(false)
      }
    }

    createFlightPaths()
  }, [pilot, isVisible, options])

  return { flightPaths, loading, error, isVisible }
}

function createPathCoordinates(
  start: [number, number],
  end: [number, number],
  options: {
    includeMidPoints?: boolean
    smoothPath?: boolean
  }
): [number, number][] {
  let coordinates: [number, number][] = [start, end]

  if (options?.includeMidPoints) {
    coordinates = addIntermediatePoints(coordinates)
  }

  if (options?.smoothPath) {
    coordinates = smoothCoordinates(coordinates)
  }

  return coordinates
}

function addIntermediatePoints(
  coordinates: [number, number][]
): [number, number][] {
  const [start, end] = coordinates
  
  // Calculate great circle distance
  const distance = getGreatCircleDistance(start, end)
  
  // Calculate number of points based on distance
  const numPoints = Math.max(3, Math.floor(distance / 500)) // One point every 500km
  const points: [number, number][] = []

  for (let i = 0; i < numPoints; i++) {
    const fraction = i / (numPoints - 1)
    const point = interpolateGreatCircle(start, end, fraction)
    points.push(point)
  }

  return points
}

function smoothCoordinates(
  coordinates: [number, number][]
): [number, number][] {
  const smoothed: [number, number][] = []
  const resolution = Math.max(20, coordinates.length * 2) // Increase resolution for smoother curves

  for (let i = 0; i < resolution; i++) {
    const t = i / (resolution - 1)
    const point = bezierPoint(coordinates, t)
    smoothed.push(point)
  }

  return smoothed
}

function getGreatCircleDistance(
  start: [number, number], 
  end: [number, number]
): number {
  const R = 6371 // Earth's radius in kilometers
  const [lon1, lat1] = start.map(deg => deg * Math.PI / 180)
  const [lon2, lat2] = end.map(deg => deg * Math.PI / 180)
  
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}

function interpolateGreatCircle(
  start: [number, number], 
  end: [number, number], 
  fraction: number
): [number, number] {
  const [lon1, lat1] = start.map(deg => deg * Math.PI / 180)
  const [lon2, lat2] = end.map(deg => deg * Math.PI / 180)
  
  const d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
  ))
  
  if (d === 0) return start
  
  const A = Math.sin((1 - fraction) * d) / Math.sin(d)
  const B = Math.sin(fraction * d) / Math.sin(d)
  
  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2)
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2)
  const z = A * Math.sin(lat1) + B * Math.sin(lat2)
  
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y))
  const lon = Math.atan2(y, x)
  
  return [
    lon * 180 / Math.PI,
    lat * 180 / Math.PI
  ]
}

function bezierPoint(
  points: [number, number][], 
  t: number
): [number, number] {
  const n = points.length - 1
  let x = 0
  let y = 0

  for (let i = 0; i <= n; i++) {
    const b = bernstein(n, i, t)
    x += points[i][0] * b
    y += points[i][1] * b
  }

  return [x, y]
}

function bernstein(n: number, i: number, t: number): number {
  return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i)
}

function binomial(n: number, i: number): number {
  if (i === 0 || i === n) return 1
  if (i > n) return 0
  
  let result = 1
  for (let j = 0; j < i; j++) {
    result *= (n - j) / (j + 1)
  }
  return Math.round(result)
}