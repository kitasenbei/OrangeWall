import { useState } from "react"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  MapPin,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LucideIcon } from "lucide-react"

interface WeatherData {
  location: string
  temperature: number
  feelsLike: number
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy"
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  sunrise: string
  sunset: string
  forecast: { day: string; high: number; low: number; condition: string }[]
}

const conditionIcons: Record<string, LucideIcon> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  stormy: CloudLightning,
}

const mockWeather: WeatherData = {
  location: "San Francisco, CA",
  temperature: 68,
  feelsLike: 65,
  condition: "sunny",
  humidity: 55,
  windSpeed: 12,
  visibility: 10,
  pressure: 30.1,
  sunrise: "6:45 AM",
  sunset: "7:30 PM",
  forecast: [
    { day: "Mon", high: 70, low: 55, condition: "sunny" },
    { day: "Tue", high: 68, low: 54, condition: "cloudy" },
    { day: "Wed", high: 65, low: 52, condition: "rainy" },
    { day: "Thu", high: 63, low: 50, condition: "rainy" },
    { day: "Fri", high: 67, low: 53, condition: "cloudy" },
    { day: "Sat", high: 72, low: 56, condition: "sunny" },
    { day: "Sun", high: 74, low: 58, condition: "sunny" },
  ],
}

export function WeatherPage() {
  const [weather] = useState<WeatherData>(mockWeather)
  const [searchLocation, setSearchLocation] = useState("")

  const WeatherIcon = conditionIcons[weather.condition] || Sun

  const handleSearch = () => {
    // In real app, would fetch weather data
    console.log("Searching for:", searchLocation)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weather</h1>
          <p className="text-sm text-muted-foreground">Current conditions and forecast</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search location..."
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="size-4" />
          <span className="font-medium">{weather.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-7xl font-light">{weather.temperature}°</div>
            <div className="text-orange-100 mt-2">Feels like {weather.feelsLike}°</div>
          </div>
          <div className="text-right">
            <WeatherIcon className="size-20 mb-2" />
            <div className="text-xl capitalize">{weather.condition}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <Droplets className="size-5 mx-auto mb-1 opacity-80" />
            <div className="text-sm opacity-80">Humidity</div>
            <div className="font-medium">{weather.humidity}%</div>
          </div>
          <div className="text-center">
            <Wind className="size-5 mx-auto mb-1 opacity-80" />
            <div className="text-sm opacity-80">Wind</div>
            <div className="font-medium">{weather.windSpeed} mph</div>
          </div>
          <div className="text-center">
            <Eye className="size-5 mx-auto mb-1 opacity-80" />
            <div className="text-sm opacity-80">Visibility</div>
            <div className="font-medium">{weather.visibility} mi</div>
          </div>
          <div className="text-center">
            <Gauge className="size-5 mx-auto mb-1 opacity-80" />
            <div className="text-sm opacity-80">Pressure</div>
            <div className="font-medium">{weather.pressure} in</div>
          </div>
        </div>
      </div>

      {/* Sun Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
          <div className="size-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Sunrise className="size-6 text-orange-500" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Sunrise</div>
            <div className="text-xl font-medium">{weather.sunrise}</div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
          <div className="size-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Sunset className="size-6 text-indigo-500" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Sunset</div>
            <div className="text-xl font-medium">{weather.sunset}</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-card border rounded-xl p-4">
        <h2 className="font-medium mb-4">7-Day Forecast</h2>
        <div className="grid grid-cols-7 gap-2">
          {weather.forecast.map((day, i) => {
            const DayIcon = conditionIcons[day.condition] || Cloud
            return (
              <div key={i} className="text-center p-2">
                <div className="text-sm font-medium mb-2">{day.day}</div>
                <DayIcon className="size-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">{day.high}°</span>
                  <span className="text-muted-foreground ml-1">{day.low}°</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Weather data is simulated. Connect to a weather API for real data.
      </p>
    </div>
  )
}
