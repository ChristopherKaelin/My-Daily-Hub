import { useEffect } from 'react'
import { initializeDemoData } from './services/demoService'
import Header from './components/common/Header'

function App() {
  useEffect(() => {
    initializeDemoData()
  }, [])

  return (
    <div className="app-wrapper zone-dashboard">
      <Header />
      <main className="app-main">
        <div className="container">
          <h1>My Daily Hub</h1>
        </div>
      </main>
    </div>
  )
}

export default App