import { Wifi, Settings } from 'lucide-react'

function Header({ onTrackerToggle }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <Wifi size={28} color="#6366f1" />
          <h1 className="header-title">P2P File Sharing</h1>
        </div>
        <div className="header-actions">
          <button 
            className="tracker-toggle"
            onClick={onTrackerToggle}
          >
            <Settings size={16} />
            Configure Tracker
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header