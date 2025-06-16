import { Download, X, User } from 'lucide-react'

function ActiveDownloads({ downloads, onCancelDownload }) {
  return (
    <div className="card">
      <div className="card-header">
        <Download size={20} />
        <h2 className="card-title">Active Downloads</h2>
      </div>
      
      {downloads.length === 0 ? (
        <div className="empty-state">
          <Download size={48} className="empty-state-icon" />
          <div>No active downloads</div>
        </div>
      ) : (
        <div>
          {downloads.map((download) => (
            <div key={download.id} className="download-item">
              <div className="download-header">
                <div className="download-info">
                  <h4>{download.fileName}</h4>
                  <div className="download-peer">
                    <User size={12} />
                    from {download.fromPeer}
                  </div>
                </div>
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => onCancelDownload(download.id)}
                >
                  <X size={12} />
                </button>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${download.progress}%` }}
                ></div>
              </div>
              
              <div className="progress-stats">
                <span>Part {download.currentPart} of {download.totalParts}</span>
                <span>{Math.round(download.progress)}%</span>
              </div>
              
              <div className={`download-status ${download.status}`}>
                {download.status === 'starting' && 'Initializing...'}
                {download.status === 'downloading' && 'Downloading...'}
                {download.status === 'completed' && 'Reconstructing file...'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActiveDownloads