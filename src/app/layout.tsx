import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/providers/store-provider'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
