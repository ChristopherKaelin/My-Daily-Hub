import loginIcon from '../../assets/login.png'
import logoutIcon from '../../assets/logout.png'
import homeIcon from '../../assets/home.png'
import tasksIcon from '../../assets/task-tracker.png'
import goalsIcon from '../../assets/habit-definitions.png'
import habitsIcon from '../../assets/habit-tracking.png'
import journalIcon from '../../assets/journal-entry-solid.png'
import linksIcon from '../../assets/favorite-links.png'
import quotesIcon from '../../assets/favorite-quotes-1.png'
import bibleIcon from '../../assets/bible-verse.png'
import weatherIcon from '../../assets/weather.png'
import settingsIcon from '../../assets/user-settings.png'

type Tool =
  | 'home'
  | 'tasks'
  | 'goals'
  | 'habits'
  | 'journal'
  | 'links'
  | 'quotes'
  | 'bible'
  | 'weather'
  | 'settings'

interface SidebarProps {
  activeTool: Tool
  onToolSelect: (tool: Tool) => void
  appMode: 'authed' | 'demo'
  onAuthAction: () => void
}

const navItems: { tool: Tool; label: string; icon: string }[] = [
  { tool: 'home',     label: 'Home',     icon: homeIcon },
  { tool: 'tasks',    label: 'Tasks',    icon: tasksIcon },
  { tool: 'goals',    label: 'Goals',    icon: goalsIcon },
  { tool: 'habits',   label: 'Habits',   icon: habitsIcon },
  { tool: 'journal',  label: 'Journal',  icon: journalIcon },
  { tool: 'links',    label: 'Links',    icon: linksIcon },
  { tool: 'quotes',   label: 'Quotes',   icon: quotesIcon },
  { tool: 'bible',    label: 'Bible',    icon: bibleIcon },
  { tool: 'weather',  label: 'Weather',  icon: weatherIcon },
  { tool: 'settings', label: 'Settings', icon: settingsIcon },
]

function Sidebar({ activeTool, onToolSelect, appMode, onAuthAction }: SidebarProps) {
  return (
    <nav className="sidebar">
      {navItems.map(({ tool, label, icon }) => (
        <button
          key={tool}
          className={`sidebar-item ${activeTool === tool ? 'sidebar-item--active' : ''}`}
          onClick={() => onToolSelect(tool)}
          title={label}
        >
          <img src={icon} alt={label} className="sidebar-icon" />
          <span className="sidebar-label">{label}</span>
        </button>
      ))}

      <div className="sidebar-divider" />

      <button
        className="sidebar-item"
        onClick={onAuthAction}
        title={appMode === 'authed' ? 'Sign Out' : 'Sign In'}
      >
        <img
          src={appMode === 'authed' ? logoutIcon : loginIcon}
          alt={appMode === 'authed' ? 'Sign Out' : 'Sign In'}
          className="sidebar-icon"
        />
        <span className="sidebar-label">
          {appMode === 'authed' ? 'Sign Out' : 'Sign In'}
        </span>
      </button>
    </nav>
  )
}

export default Sidebar
export type { Tool }
