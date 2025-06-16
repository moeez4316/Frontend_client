import { useState } from 'react'
import { X, Wifi, CheckCircle, AlertCircle } from 'lucide-react'

function TrackerPanel({ isOpen, onClose, onConnect }) {
  const [ipAddress, setIpAddress] = useState('192.168.0.100')
  const [port, setPort] = useState('8080')
  const [connectionStatus, setConnectionStatus] = useState(null) // null, 'loading', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('')

  const handleConnect = async () => {
    if (!ipAddress || !port) {
      setConnectionStatus('error')
      setStatusMessage('Please fill in both IP address and port')
      return
    }

    setConnectionStatus('loading')
    setStatusMessage('Connecting to tracker...')

    try {
      const response = await fetch('http://localhost:5001/configure_tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: ipAddress,
          port: parseInt(port)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('success')
        setStatusMessage(`Successfully connected to tracker at ${ipAddress}:${port}`)
        onConnect({ ipAddress, port, connected: true })
      } else {
        setConnectionStatus('error')
        setStatusMessage(data.error || 'Failed to connect to tracker. Please check the IP address and port.')
      }
    } catch (error) {
      setConnectionStatus('error')
      setStatusMessage('Connection failed. Please try again.')
    }
  }

  const handleClose = () => {
    setConnectionStatus(null)
    setStatusMessage('')
    onClose()
  }

  return (
    <>
      <div 
        className={`tracker-panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
      />
      <div className={`tracker-panel ${isOpen ? 'open' : ''}`}>
        <div className="tracker-panel-header">
          <h2 className="tracker-panel-title">Configure Tracker</h2>
          <button 
            className="tracker-panel-close"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="tracker-panel-content">
          <div className="form-group">
            <label className="form-label" htmlFor="ip-address">
              IP Address
            </label>
            <input
              id="ip-address"
              type="text"
              className="form-input"
              placeholder="192.168.0.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="port">
              Port
            </label>
            <input
              id="port"
              type="number"
              className="form-input"
              placeholder="8080"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={connectionStatus === 'loading'}
            style={{ width: '100%' }}
          >
            {connectionStatus === 'loading' ? (
              <>
                <div className="spinner" />
                Connecting...
              </>
            ) : (
              <>
                <Wifi size={16} />
                Connect to Tracker
              </>
            )}
          </button>
          
          {connectionStatus && (
            <div className={`connection-status-card ${connectionStatus}`}>
              <div className={`status-message ${connectionStatus}`}>
                {connectionStatus === 'loading' && <div className="spinner" />}
                {connectionStatus === 'success' && <CheckCircle size={16} />}
                {connectionStatus === 'error' && <AlertCircle size={16} />}
                {statusMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TrackerPanel