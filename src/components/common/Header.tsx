interface HeaderProps {
  appMode: 'authed' | 'demo'
}

function Header({ appMode }: HeaderProps) {
  return (
    <header className="app-header">
      <span className="app-title">My Daily Hub</span>
      {appMode === 'demo' && (
        <span className="demo-badge">Demo Mode</span>
      )}
    </header>
  )
}

export default Header
