import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface WeatherSettings {
  showMetars: boolean
  showRadar: boolean
  showWind: boolean
  showFronts: boolean
}

interface MapSettings {
  mapStyle: 'dark' | 'satellite' | 'light'
  showWeather: boolean
  showAirports: boolean
  showFIRBoundaries: boolean
  showAirspace: boolean
  showLabels: boolean
  followUserAircraft: boolean
  showFlightPath: boolean
  showMetar: boolean
  showRadar: boolean
  showWind: boolean
  showFronts: boolean
  weather: WeatherSettings
}

interface SettingsStore {
  mapSettings: MapSettings
  userCallsign: string
  userCid: string
  setUserCallsign: (callsign: string) => void
  setUserCid: (cid: string) => void
  updateMapSettings: (settings: Partial<MapSettings>) => void
  updateWeatherSettings: (settings: Partial<WeatherSettings>) => void
}

const DEFAULT_WEATHER_SETTINGS: WeatherSettings = {
  showMetars: false,
  showRadar: false,
  showWind: false,
  showFronts: false
}

const DEFAULT_MAP_SETTINGS: MapSettings = {
  mapStyle: 'dark',
  showWeather: false,
  showAirports: true,
  showFIRBoundaries: false,
  showAirspace: false,
  showLabels: true,
  followUserAircraft: false,
  showFlightPath: true,
  showMetar: true,
  showRadar: true,
  showWind: true,
  showFronts: true,
  weather: DEFAULT_WEATHER_SETTINGS
}


export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      userCallsign: '',
      userCid: '',
      mapSettings: DEFAULT_MAP_SETTINGS,
      setUserCallsign: (callsign) => set({ userCallsign: callsign }),
      setUserCid: (cid) => set({ userCid: cid }),
      updateMapSettings: (settings) =>
        set((state) => ({
          mapSettings: { ...state.mapSettings, ...settings }
        })),
      updateWeatherSettings: (settings) =>
        set((state) => ({
          mapSettings: {
            ...state.mapSettings,
            weather: { ...state.mapSettings.weather, ...settings }
          }
        }))
    }),
    {
      name: 'vatsim-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userCallsign: state.userCallsign,
        userCid: state.userCid,
        mapSettings: state.mapSettings,
        weather: state.mapSettings.weather
      }),
    }
  )
)