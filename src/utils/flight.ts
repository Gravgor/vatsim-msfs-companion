import { VatsimData } from '@/types/vatsim'

export function calculateETA(pilot: VatsimData['pilots'][0]): string | undefined {
  if (!pilot.flight_plan?.arrival || pilot.groundspeed < 50) {
    return undefined
  }

  // This is a very basic calculation - you might want to make it more sophisticated
  const distanceToDestination = calculateDistance(
    pilot.latitude,
    pilot.longitude,
    pilot.flight_plan.arrival_lat,
    pilot.flight_plan.arrival_lon
  )

  const timeInHours = distanceToDestination / pilot.groundspeed
  const now = new Date()
  const eta = new Date(now.getTime() + timeInHours * 60 * 60 * 1000)

  return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in km
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180
} 