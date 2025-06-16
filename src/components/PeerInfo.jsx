import { Server, Wifi } from 'lucide-react'

function PeerInfo({ peerInfo }) {
  return (
    <div className="card">
      <div className="card-header">
        <Server size={20} />
        <h2 className="card-title">Peer Information</h2>
        <div className={`status-indicator ${peerInfo.connected ? 'connected' : ''}`}></div>
      </div>
      
      <div className="peer-info-grid">
        <div className="peer-info-item">
          <span className="peer-info-label">Peer ID</span>
          <span className="peer-info-value">{peerInfo.peerId}</span>
        </div>
        
        <div className="peer-info-item">
          <span className="peer-info-label">Port</span>
          <span className="peer-info-value">{peerInfo.port}</span>
        </div>
        
        <div className="peer-info-item">
          <span className="peer-info-label">Tracker Status</span>
          <div className="connection-status">
            <Wifi size={16} color={peerInfo.connected ? '#10b981' : '#ef4444'} />
            <span className={`connection-text ${peerInfo.connected ? 'connected' : 'disconnected'}`}>
              {peerInfo.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PeerInfo