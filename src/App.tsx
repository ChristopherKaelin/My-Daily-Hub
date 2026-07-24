import { useEffect, useState } from 'react'
import { isDemoMode, initializeDemoData } from './services/demoService'
import Header from './components/common/Header'
import UserSettings from './components/tools/UserSettings/UserSettings'
import Sidebar, { type Tool } from './components/common/Sidebar'


function App() {
  const [activeTool, setActiveTool] = useState<Tool>('home')

  useEffect(() => {
  const init = async () => {
    if (await isDemoMode()) {
      initializeDemoData()
    }
  }
    init()
  }, [])

  const renderTool = () => {
    switch (activeTool) {
      case 'settings': return <UserSettings />
      default: return <p>Coming soon...</p>
    }
  }

  return (
    <div className="app-wrapper zone-dashboard">
      <Header />
      <div className="app-body">
        <Sidebar activeTool={activeTool} onToolSelect={setActiveTool} />
        <main className="app-main">
          <div className="container">
            {renderTool()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App