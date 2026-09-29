import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { initializeDemoData } from './services/demoService'
import Header from './components/common/Header'
import Sidebar, { type Tool } from './components/common/Sidebar'
import AuthPage from './components/auth/AuthPage'
import UserSettings from './components/tools/UserSettings/UserSettings'
import Weather from './components/tools/Weather/Weather'
import BibleVerse from './components/tools/BibleVerse/BibleVerse'
import { Tasks } from './components/tools/Tasks/Tasks'
import Dashboard from './components/tools/Dashboard/Dashboard'

type AppMode = 'loading' | 'authed' | 'demo'

function App() {
  const [appMode, setAppMode] = useState<AppMode>('loading')
  const [activeTool, setActiveTool] = useState<Tool>('home')

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAppMode('authed')
      } else {
        // Stay on loading until user chooses demo or signs in
        setAppMode('loading')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAppMode('authed')
      } else {
        setAppMode('loading')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDemoMode = () => {
    initializeDemoData()
    setAppMode('demo')
  }

  const renderTool = () => {
    switch (activeTool) {
      case 'settings': return <UserSettings />
      case 'weather': return <Weather />
      case 'bible': return <BibleVerse />
      case 'tasks': return <Tasks />
      case 'home': return <Dashboard onNavigate={setActiveTool} />
      default: return <p>Coming soon...</p>
    }
  }

  if (appMode === 'loading') {
    return <div className="zone-dashboard"><AuthPage onDemoMode={handleDemoMode} /></div>
  }

  return (
    <div className="app-wrapper zone-dashboard">
      <Header />
      <div className="app-body">
        <Sidebar
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          appMode={appMode as 'authed' | 'demo'}
          onAuthAction={async () => {
            if (appMode === 'authed') {
              await supabase.auth.signOut()
            } else {
              setAppMode('loading')
            }
          }}
        />
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
