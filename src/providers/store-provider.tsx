'use client'

import { useRef } from 'react'
import { useSettingsStore } from '@/store/settings'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)
  if (!initialized.current) {
    initialized.current = true
    useSettingsStore.getState()
  }

  return <>{children}</>
} 