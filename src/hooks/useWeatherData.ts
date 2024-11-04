import { useState, useEffect } from 'react'
import { WeatherData } from '@/types/weather'
import { getGlobalWeather } from '@/services/weather'

export function useWeatherData(enabled: boolean) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    async function fetchData() {
      try {
        setLoading(true)
        const weatherData = await getGlobalWeather()
        setData(weatherData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch weather data'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [enabled])

  return { data, loading, error }
} 