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
}

const navItems: { tool: Tool; label: string; icon: string }[] = [
  { tool: 'home',     label: 'Home',     icon: '/my-daily-hub/src/assets/home.png' },
  { tool: 'tasks',    label: 'Tasks',    icon: '/my-daily-hub/src/assets/task-tracker.png' },
  { tool: 'goals',    label: 'Goals',    icon: '/my-daily-hub/src/assets/habit-definitions.png' },
  { tool: 'habits',   label: 'Habits',   icon: '/my-daily-hub/src/assets/habit-tracking.png' },
  { tool: 'journal',  label: 'Journal',  icon: '/my-daily-hub/src/assets/journal-entry-solid.png' },
  { tool: 'links',    label: 'Links',    icon: '/my-daily-hub/src/assets/favorite-links.png' },
  { tool: 'quotes',   label: 'Quotes',   icon: '/my-daily-hub/src/assets/favorite-quotes-1.png' },
  { tool: 'bible',    label: 'Bible',    icon: '/my-daily-hub/src/assets/bible-verse.png' },
  { tool: 'weather',  label: 'Weather',  icon: '/my-daily-hub/src/assets/weather.png' },
  { tool: 'settings', label: 'Settings', icon: '/my-daily-hub/src/assets/user-settings.png' },
]

function Sidebar({ activeTool, onToolSelect }: SidebarProps) {
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
    </nav>
  )
}

export default Sidebar
export type { Tool }