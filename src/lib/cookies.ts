import { cookies } from 'next/headers'

export const COOKIE_CONFIG = {
  blacklist: {
    name: 'airportBlacklist',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  cache: {
    name: 'airportCache',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  defaults: {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  }
}

export async function getCookie(name: string) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)
  return cookie ? JSON.parse(cookie.value) : null
}

export async function setCookie(name: string, value: any, maxAge: number) {
  const cookieStore = await cookies()
  cookieStore.set(name, JSON.stringify(value), {
    ...COOKIE_CONFIG.defaults,
    maxAge,
  })
}

export async function deleteCookie(name: string) {
  const cookieStore = await cookies()
  cookieStore.delete(name)
} 