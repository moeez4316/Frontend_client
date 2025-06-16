import { Terminal } from 'lucide-react'

function SystemLogs({ logs }) {
  return (
    <div className="card">
      <div className="card-header">
        <Terminal size={20} />
        <h2 className="card-title">System Logs</h2>
      </div>
      
      <div className="log-container">
        {logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Terminal size={32} className="empty-state-icon" />
            <div>No logs yet</div>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-item">
              <span className="log-timestamp">{log.timestamp}</span>
              <span className={`log-message log-${log.type}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SystemLogs