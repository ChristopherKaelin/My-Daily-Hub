import { useEffect, useState } from 'react'
import { getUserSettings, saveUserSettings } from '../../../services/userSettingsService'
import { isDemoMode } from '../../../services/demoService'

function UserSettings() {
  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [weatherUnit, setWeatherUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    getUserSettings().then(data => {
      if (data) {
        setDisplayName(data.displayName ?? '')
        setCity(data.city ?? '')
        setWeatherUnit(data.weatherUnit)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    isDemoMode().then(setIsDemo)
  }, [])

  const validate = (): boolean => {
    if (displayName.length > 50) {
      setError('Display name must be 50 characters or less.')
      return false
    }
    if (city.length > 100) {
      setError('City must be 100 characters or less.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    if (!validate()) return

    await saveUserSettings({ displayName, city, weatherUnit })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <p>Loading settings...</p>

  return (
    <div className="card">
      <div className="settings-header">
        <h2>User Settings</h2>
        {error && <span className="form-error">{error}</span>}
        {saved && <span className="form-success">Settings saved.</span>}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={isDemo ? 'Demo User' : displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
            readOnly={isDemo}
            className={isDemo ? 'input-readonly' : ''}
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Lexington, KY"
            maxLength={100}
          />
          <span className="form-hint">Use city and state/country for best results (e.g. London, UK or Chicago, IL)</span>
        </div>
        <div className="form-group">
          <label htmlFor="weatherUnit">Temperature Unit</label>
          <select
            id="weatherUnit"
            value={weatherUnit}
            onChange={e => setWeatherUnit(e.target.value as 'fahrenheit' | 'celsius')}
          >
            <option value="fahrenheit">Fahrenheit</option>
            <option value="celsius">Celsius</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  )
}

export default UserSettings