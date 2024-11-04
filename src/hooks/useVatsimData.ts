'use client'

import { useState, useEffect, useCallback } from 'react'
import { VatsimData } from '@/types/vatsim'
import { fetchVatsimData } from '@/actions/vatsim'

interface UseVatsimDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  onRefresh?: () => void
}

export function useVatsimData(options: UseVatsimDataOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 15000,
    onRefresh
  } = options

  const [data, setData] = useState<VatsimData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    if (loading) return

    if (lastRefresh && Date.now() - lastRefresh.getTime() < refreshInterval) {
      return
    }

    try {
      setLoading(true)
      const vatsimData = await fetchVatsimData()
      setData(vatsimData)
      setError(null)
      setLastRefresh(new Date())
      onRefresh?.()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [loading, lastRefresh, refreshInterval, onRefresh])

  useEffect(() => {
    refresh()

    let intervalId: NodeJS.Timeout | undefined
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        refresh()
      }, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh, refresh, refreshInterval])

  const canRefresh = !loading && (!lastRefresh || 
    Date.now() - lastRefresh.getTime() >= refreshInterval)

  return {
    data,
    loading,
    error,
    refresh,
    lastRefresh,
    canRefresh
  }
} 