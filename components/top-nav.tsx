"use client"

import { Moon, Sun, Cloud, CloudRain, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function TopNav({
  isSidebarCollapsed,
  onToggleSidebar,
}: {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  const { theme, setTheme } = useTheme()
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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:inline-flex"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* Page title kept for SR only */}
        <h2 className="sr-only">{getPageTitle()}</h2>
      </div>

      {/* Allow content to wrap on smaller viewports */}
      <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-muted-foreground sm:text-sm">
        {/* Keep date compact on small screens */}
        <span className="whitespace-nowrap text-foreground">{formatNow()}</span>
        {/* Hide weather on very small screens to reduce clutter */}
        <span className="hidden items-center gap-1 sm:inline-flex">
          <WeatherIcon />
          {weather?.temp !== undefined ? (
            <>
              <span className="text-foreground">{Math.round(weather.temp)}°C</span>
              <span className="text-muted-foreground">{weather?.desc}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Fetching weather...</span>
          )}
        </span>

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
      </div>
    </header>
  )
}
