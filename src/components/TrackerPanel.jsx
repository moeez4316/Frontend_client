import { useState, useEffect } from 'react'
import { X, Wifi, CheckCircle, AlertCircle } from 'lucide-react'

function TrackerPanel({ isOpen, onClose, onConnect, initialTrackerInfo }) {
  const [trackerInfo, setTrackerInfo] = useState({
    ipAddress: initialTrackerInfo?.ipAddress || '127.0.0.1',
    port: initialTrackerInfo?.port || 9000
  })
  const [connectionStatus, setConnectionStatus] = useState(null) // null, 'loading', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('')

  // Update local state when initialTrackerInfo changes
  useEffect(() => {
    if (initialTrackerInfo) {
      setTrackerInfo(initialTrackerInfo)
    }
  }, [initialTrackerInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setConnectionStatus('loading')
    setStatusMessage('Connecting to tracker...')

    try {
      const response = await fetch('http://localhost:5001/configure_tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: trackerInfo.ipAddress,
          port: trackerInfo.port
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to tracker');
      }

      setConnectionStatus('success')
      setStatusMessage(`Successfully connected to tracker at ${trackerInfo.ipAddress}:${trackerInfo.port}`)
      onConnect(trackerInfo)
    } catch (error) {
      setConnectionStatus('error')
      setStatusMessage(error.message)
    }
  }

  const handleClose = () => {
    setConnectionStatus(null)
    setStatusMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configure Tracker</h2>
          <button onClick={handleClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ipAddress">IP Address:</label>
            <input
              type="text"
              id="ipAddress"
              value={trackerInfo.ipAddress}
              onChange={(e) => setTrackerInfo(prev => ({ ...prev, ipAddress: e.target.value }))}
              placeholder="Enter tracker IP address"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="port">Port:</label>
            <input
              type="number"
              id="port"
              value={trackerInfo.port}
              onChange={(e) => setTrackerInfo(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              placeholder="Enter tracker port"
              min="1"
              max="65535"
              required
            />
          </div>
          
          <button type="submit" className="primary" disabled={connectionStatus === 'loading'}>
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
        </form>
        
        {connectionStatus && (
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'success' && <CheckCircle size={16} />}
            {connectionStatus === 'error' && <AlertCircle size={16} />}
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackerPanel