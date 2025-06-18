import { Wifi, WifiOff, Users, Activity } from 'lucide-react'

function PeerStatus({ peerInfo, networkStats }) {
  const getConnectionStatus = () => {
    if (!peerInfo.connected) return 'disconnected'
    return 'connected'
  }

  const getStatusColor = () => {
    return peerInfo.connected ? 'var(--success)' : 'var(--error)'
  }

  const getStatusIcon = () => {
    return peerInfo.connected ? <Wifi size={16} /> : <WifiOff size={16} />
  }

  return (
    <div className="peer-status-card">
      <div className="status-header">
        <div className="status-indicator">
          <div 
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="status-text">
            {peerInfo.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {getStatusIcon()}
      </div>

      <div className="peer-info">
        <div className="info-row">
          <span className="info-label">Peer ID:</span>
          <span className="info-value">{peerInfo.peerId}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Port:</span>
          <span className="info-value">{peerInfo.port}</span>
        </div>
      </div>

      {networkStats && (
        <div className="network-stats">
          <div className="stat-item">
            <Users size={14} />
            <span>{networkStats.activePeers || 0} Peers</span>
          </div>
          <div className="stat-item">
            <Activity size={14} />
            <span>{networkStats.transferRate || '0'} MB/s</span>
          </div>
        </div>
      )}

      <div className="connection-bar">
        <div 
          className="connection-fill"
          style={{ 
            width: peerInfo.connected ? '100%' : '0%',
            backgroundColor: getStatusColor()
          }}
        />
      </div>
    </div>
  )
}

export default PeerStatus 