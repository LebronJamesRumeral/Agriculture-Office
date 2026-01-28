"use client"

import { Bell, Moon, Sun, LogOut, User, Cloud, CloudRain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function TopNav() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date>(new Date())
  const [weather, setWeather] = useState<{ temp?: number; code?: number; desc?: string } | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Live date/time
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch simple weather (Open-Meteo, no API key)
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
        const data = await res.json()
        const cw = data?.current_weather
        if (cw) {
          const desc = mapWeatherCode(cw.weathercode)
          setWeather({ temp: cw.temperature, code: cw.weathercode, desc })
        }
      } catch (e) {
        // Fallback: Olongapo approx coords
        setWeather({ temp: 30, code: 1, desc: 'Cloudy' })
      }
    }

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(14.8386, 120.2828)
      )
    } else {
      fetchWeather(14.8386, 120.2828)
    }
  }, [])

  const mapWeatherCode = (code: number): string => {
    if ([0].includes(code)) return 'Clear'
    if ([1, 2, 3].includes(code)) return 'Cloudy'
    if ([45, 48].includes(code)) return 'Fog'
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
    if ([95, 96, 99].includes(code)) return 'Storm'
    return 'Weather'
  }

  const formatNow = (): string => {
    try {
      return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(now)
    } catch {
      return now.toLocaleString()
    }
  }

  const WeatherIcon = () => {
    const code = weather?.code ?? 1
    if (code === 0) return <Sun className="h-4 w-4" />
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className="h-4 w-4" />
    return <Cloud className="h-4 w-4" />
  }

  const handleLogout = () => {
    router.push('/')
  }

  const getPageTitle = () => {
    const segment = pathname.split('/')[1]
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      registration: 'New Registration',
      records: 'Records Management',
      events: 'Events & Attendance',
      settings: 'Settings',
    }
    return titles[segment] || 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <div className="flex items-center gap-6">
        {/* Page title kept for SR only */}
        <h2 className="sr-only">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Date/Time and Weather (placed before notifications) */}
        <div className="flex items-center gap-4 text-sm text-foreground">
          <span>{formatNow()}</span>
          <span className="flex items-center gap-1">
            <WeatherIcon />
            {weather?.temp !== undefined ? (
              <>
                <span>{Math.round(weather.temp)}°C</span>
                <span className="text-muted-foreground">{weather?.desc}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Fetching weather…</span>
            )}
          </span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Dark Mode Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
