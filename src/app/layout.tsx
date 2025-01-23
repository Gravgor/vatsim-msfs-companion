import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/providers/store-provider'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VATSIM Flight Tracker - Real-Time Aviation Monitoring</title>
        <meta name="description" content="Track flights worldwide with real-time VATSIM data, weather integration, and 3D visualization. The most advanced flight tracking platform for aviation enthusiasts." />
        <meta name="keywords" content="VATSIM, flight tracker, aviation, real-time, weather, 3D maps" />
        <meta property="og:title" content="VATSIM Flight Tracker" />
        <meta property="og:description" content="Real-time flight tracking with weather integration" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VATSIM Flight Tracker" />
        <meta name="twitter:description" content="Real-time flight tracking with weather integration" />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'VATSIM Flight Tracker - Real-Time Aviation Monitoring',
  description: 'Track flights worldwide with real-time VATSIM data, weather integration, and 3D visualization. The most advanced flight tracking platform for aviation enthusiasts.',
  keywords: ['VATSIM', 'flight tracker', 'aviation', 'real-time', 'weather', '3D maps'],
  openGraph: {
    title: 'VATSIM Flight Tracker',
    description: 'Real-time flight tracking with weather integration',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VATSIM Flight Tracker',
    description: 'Real-time flight tracking with weather integration',
    images: ['/og-image.png'],
  },
}
