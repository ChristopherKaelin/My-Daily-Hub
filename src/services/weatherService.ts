const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const CACHE_KEY = 'mdh_weather_cache'
const CACHE_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export interface CurrentWeather {
  temp_f: number
  temp_c: number
  feels_like_f: number
  feels_like_c: number
  condition: string
  condition_icon: string
  humidity: number
  wind_mph: number
  wind_kph: number
  city: string
  region: string
  country: string
}

export interface HourlyForecast {
  time: string
  temp_f: number
  temp_c: number
  condition: string
  condition_icon: string
  chance_of_rain: number
}

export interface ForecastDay {
  date: string
  max_temp_f: number
  max_temp_c: number
  min_temp_f: number
  min_temp_c: number
  condition: string
  condition_icon: string
}

interface WeatherApiHour {
  time: string
  temp_f: number
  temp_c: number
  condition: { text: string; icon: string }
  chance_of_rain: number
}

interface WeatherApiDay {
  date: string
  day: {
    maxtemp_f: number
    maxtemp_c: number
    mintemp_f: number
    mintemp_c: number
    condition: { text: string; icon: string }
  }
  hour: WeatherApiHour[]
}

export interface WeatherData {
  current: CurrentWeather
  hourly: HourlyForecast[]
  forecast: ForecastDay[]
  fetchedAt: number
}

function loadCache(): WeatherData | null {
  const raw = localStorage.getItem(CACHE_KEY)
  if (!raw) return null
  const data: WeatherData = JSON.parse(raw)
  const age = Date.now() - data.fetchedAt
  if (age > CACHE_DURATION_MS) return null
  return data
}

function saveCache(data: WeatherData): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export async function getWeather(city: string): Promise<WeatherData> {
  const cached = loadCache()
  if (cached && cached.current.city.toLowerCase() === city.toLowerCase()) {
    return cached
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=4&aqi=no&alerts=no`
  const response = await fetch(url)

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null)
    const errorCode = errorJson?.error?.code
    if (errorCode === 1006) {
      throw new Error(`City "${city}" not found. Please update your city in Settings.`)
    }
    throw new Error('Unable to load weather data. Please try again later.')
  }

  const json = await response.json()

  const localHour = new Date(json.location.localtime).getHours()
  const localDate = new Date(json.location.localtime).getDate()
  const todayHours: WeatherApiHour[] = json.forecast.forecastday[0].hour
  const tomorrowHours: WeatherApiHour[] = json.forecast.forecastday[1].hour
  const allHours = [...todayHours, ...tomorrowHours]

  const hourly: HourlyForecast[] = allHours
    .filter((h: WeatherApiHour) => {
      const hDate = new Date(h.time)
      return hDate.getHours() > localHour || hDate.getDate() > localDate
    })
    .slice(0, 6)
    .map((h: WeatherApiHour) => ({
      time: h.time,
      temp_f: h.temp_f,
      temp_c: h.temp_c,
      condition: h.condition.text,
      condition_icon: 'https:' + h.condition.icon,
      chance_of_rain: h.chance_of_rain,
    }))

  const data: WeatherData = {
    fetchedAt: Date.now(),
    current: {
      temp_f: json.current.temp_f,
      temp_c: json.current.temp_c,
      feels_like_f: json.current.feelslike_f,
      feels_like_c: json.current.feelslike_c,
      condition: json.current.condition.text,
      condition_icon: 'https:' + json.current.condition.icon,
      humidity: json.current.humidity,
      wind_mph: json.current.wind_mph,
      wind_kph: json.current.wind_kph,
      city: json.location.name,
      region: json.location.region,
      country: json.location.country,
    },
    hourly,
    forecast: json.forecast.forecastday.map((day: WeatherApiDay) => ({
      date: day.date,
      max_temp_f: day.day.maxtemp_f,
      max_temp_c: day.day.maxtemp_c,
      min_temp_f: day.day.mintemp_f,
      min_temp_c: day.day.mintemp_c,
      condition: day.day.condition.text,
      condition_icon: 'https:' + day.day.condition.icon,
    })),
  }

  saveCache(data)
  return data
}
