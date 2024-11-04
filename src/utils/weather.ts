import { MetarData, WeatherFront } from "@/types/weather"

export function getWeatherColor(metar: MetarData): string {
  switch (metar.flight_category) {
    case 'VFR': return '#00ff00'
    case 'MVFR': return '#0000ff'
    case 'IFR': return '#ff0000'
    case 'LIFR': return '#ff00ff'
    default: return '#ffffff'
  }
}


export function getFrontColor(type: WeatherFront['type']): string {
  switch (type) {
    case 'COLD': return '#0000ff'
    case 'WARM': return '#ff0000'
    case 'STATIONARY': return '#800080'
    case 'OCCLUDED': return '#008000'
    default: return '#ffffff'
  }
}

export function getFrontSymbol(type: WeatherFront['type']): string {
  switch (type) {
    case 'COLD': return '▼'
    case 'WARM': return '▲'
    case 'STATIONARY': return '▼▲'
    case 'OCCLUDED': return '●'
    default: return ''
  }
}

interface WindBarbOptions {
  speed: number          // Speed in knots
  size?: number         // Size multiplier (default: 1)
  fillColor?: string    // Color of the barb (default: currentColor)
}

interface WeatherSymbolOptions {
  code: string          // METAR weather code
  intensity?: '+' | '-' // Intensity prefix
  color?: string       // Symbol color (default: currentColor)
}

/**
 * Generates SVG path for wind barb based on wind speed
 * Speed ranges:
 * - Calm (< 2 knots): Circle
 * - Light (2-7 knots): Single shaft
 * - 5 knots: Short barb
 * - 10 knots: Long barb
 * - 50 knots: Triangle
 */
export function getWindBarb({ 
  speed, 
  size = 1, 
  fillColor = 'currentColor' 
}: WindBarbOptions): string {
  // Base size for scaling
  const length = 20 * size
  const width = 2 * size

  // Return circle for calm winds
  if (speed < 2) {
    return `
      <svg viewBox="0 0 24 24" width="${width * 2}" height="${width * 2}">
        <circle cx="12" cy="12" r="${width}" fill="none" stroke="${fillColor}"/>
      </svg>
    `
  }

  // Calculate number of barbs
  const fifties = Math.floor(speed / 50)
  const tens = Math.floor((speed % 50) / 10)
  const fives = Math.floor((speed % 10) / 5)

  let path = `M 0,0 L 0,${-length} ` // Main shaft

  let position = -length
  
  // Add 50 knot triangles
  for (let i = 0; i < fifties; i++) {
    path += `M 0,${position} L -7,${position + 7} L 0,${position + 14} Z `
    position += 14
  }

  // Add 10 knot barbs
  for (let i = 0; i < tens; i++) {
    path += `M 0,${position} L -7,${position + 7} `
    position += 7
  }

  // Add 5 knot barbs
  for (let i = 0; i < fives; i++) {
    path += `M 0,${position} L -4,${position + 4} `
    position += 4
  }

  return `
    <svg viewBox="-10 -${length} 20 ${length}" width="${width * 10}" height="${length}">
      <path d="${path}" stroke="${fillColor}" fill="${fillColor}"/>
    </svg>
  `
}

/**
 * Returns Unicode weather symbols based on METAR codes
 * Reference: WMO-No. 306 Manual on Codes
 */
export function getWeatherSymbol({ 
  code, 
  intensity, 
  color = 'currentColor' 
}: WeatherSymbolOptions): string {
  const symbols: Record<string, string> = {
    // Precipitation
    'RA': '🌧️',  // Rain
    'SN': '🌨️',  // Snow
    'SG': '🌨️',  // Snow grains
    'IC': '🌨️',  // Ice crystals
    'PL': '🌨️',  // Ice pellets
    'GR': '🌧️',  // Hail
    'GS': '🌧️',  // Small hail
    'DZ': '🌧️',  // Drizzle
    
    // Obscuration
    'BR': '🌫️',  // Mist
    'FG': '🌫️',  // Fog
    'FU': '🌫️',  // Smoke
    'VA': '🌫️',  // Volcanic ash
    'DU': '🌫️',  // Dust
    'SA': '🌫️',  // Sand
    'HZ': '🌫️',  // Haze
    'PY': '🌫️',  // Spray
    
    // Other
    'PO': '🌪️',  // Dust/sand whirls
    'SQ': '🌪️',  // Squalls
    'FC': '🌪️',  // Funnel cloud
    'SS': '🌪️',  // Sandstorm
    'DS': '🌪️',  // Duststorm
    
    // Thunderstorm
    'TS': '⛈️',  // Thunderstorm
    'TSRA': '⛈️', // Thunderstorm with rain
    'TSGR': '⛈️', // Thunderstorm with hail
    
    // Special
    'NSW': '✨',  // No significant weather
    'CLR': '☀️',  // Clear
    'SKC': '☀️',  // Sky clear
    'CAVOK': '☀️' // Ceiling and visibility OK
  }

  // Get base symbol
  let symbol = symbols[code] || '❓'

  // Add intensity indicator
  if (intensity === '+') {
    symbol = `<strong style="color: ${color}">${symbol}</strong>`
  } else if (intensity === '-') {
    symbol = `<span style="opacity: 0.5; color: ${color}">${symbol}</span>`
  }

  return symbol
}

/**
 * Get flight category color
 */
export function getFlightCategoryColor(category: string): string {
  switch (category.toUpperCase()) {
    case 'VFR':
      return '#00ff00' // Green
    case 'MVFR':
      return '#0000ff' // Blue
    case 'IFR':
      return '#ff0000' // Red
    case 'LIFR':
      return '#ff00ff' // Magenta
    default:
      return '#ffffff' // White
  }
}

/**
 * Format wind direction for display
 */
export function formatWindDirection(degrees: number | 'VRB'): string {
  if (degrees === 'VRB') return 'VRB'
  return degrees.toString().padStart(3, '0') + '°'
}

/**
 * Format visibility for display
 */
export function formatVisibility(meters: number): string {
  if (meters >= 9999) return 'CAVOK'
  if (meters >= 5000) return `${(meters / 1000).toFixed(1)}km`
  return `${meters}m`
}

/**
 * Get cloud coverage description
 */
export function getCloudCoverage(code: string): string {
  const coverage: Record<string, string> = {
    'SKC': 'Sky Clear',
    'CLR': 'Clear',
    'FEW': 'Few',
    'SCT': 'Scattered',
    'BKN': 'Broken',
    'OVC': 'Overcast'
  }
  return coverage[code] || code
} 