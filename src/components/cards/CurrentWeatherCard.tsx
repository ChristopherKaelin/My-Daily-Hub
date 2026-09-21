import { useEffect, useState } from 'react'
import { getUserSettings } from '../../services/userSettingsService'
import { getWeather, type WeatherData } from '../../services/weatherService'

interface CurrentWeatherCardProps {
  weather?: WeatherData
  unit?: 'fahrenheit' | 'celsius'
  city?: string
}

function CurrentWeatherCard({ weather: weatherProp, unit: unitProp }: CurrentWeatherCardProps) {
  const [localWeather, setLocalWeather] = useState<WeatherData | null>(null)
  const [localUnit, setLocalUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit')
  const resolvedWeather = weatherProp ?? localWeather
  const resolvedUnit = unitProp ?? localUnit


  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!weatherProp)

  useEffect(() => {
    if (weatherProp) {
      return
    }
    const load = async () => {
      const settings = await getUserSettings()

      if (!settings?.city) {
        setError('No city set. Please update your settings.')
        setLoading(false)
        return
      }

      setLocalUnit(settings.weatherUnit)

      try {
        const data = await getWeather(settings.city)
        setLocalWeather(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load weather data. Please try again later.')
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p>Loading weather...</p>
  if (error) return <p className="form-error">{error}</p>
  if (!resolvedWeather) return null

  const { current } = resolvedWeather
  const temp = resolvedUnit === 'fahrenheit' ? `${current.temp_f}°F` : `${current.temp_c}°C`
  const feelsLike = resolvedUnit === 'fahrenheit' ? `${current.feels_like_f}°F` : `${current.feels_like_c}°C`
  const wind = resolvedUnit === 'fahrenheit' ? `${current.wind_mph} mph` : `${current.wind_kph} kph`

  return (
        <div className="card weather-current">
          <div className="weather-location">
            {current.city}, {current.region}
          </div>
          <div className="weather-main">
            <img src={current.condition_icon} alt={current.condition} className="weather-icon-lg" />
            <div className="weather-temp">{temp}</div>
          </div>
          <div className="weather-condition">{current.condition}</div>
          <div className="weather-details">
            <span>Feels like {feelsLike}</span>
            <span>Humidity {current.humidity}%</span>
            <span>Wind {wind}</span>
          </div>
        </div>
  )
}

export default CurrentWeatherCard
