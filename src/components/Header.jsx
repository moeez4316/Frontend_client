import { Settings, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

function Header({ onTrackerToggle }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M13 8H7"/>
              <path d="M17 12H7"/>
            </svg>
          </div>
          <span>P2P Network</span>
        </div>
        
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="icon sun" size={12} />
            <Moon className="icon moon" size={12} />
          </button>
          
          <button 
            className="btn btn-secondary btn-small"
            onClick={onTrackerToggle}
          >
            <Settings size={16} />
            Tracker
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header