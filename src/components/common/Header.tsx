import { useEffect, useState } from 'react'
import { isAuthenticated } from '../../services/authService'

function Header() {
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    isAuthenticated().then(auth => setDemo(!auth))
  }, [])

  return (
    <header className="app-header">
      <span className="app-title">My Daily Hub</span>
      {demo && <span className="demo-badge">Demo Mode</span>}
    </header>
  )
}

export default Header
