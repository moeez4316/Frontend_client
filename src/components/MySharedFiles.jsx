import { FolderOpen, File } from 'lucide-react'

function MySharedFiles({ files }) {
  return (
    <div className="card">
      <div className="card-header">
        <FolderOpen size={20} />
        <h2 className="card-title">My Shared Files</h2>
      </div>
      
      {files.length === 0 ? (
        <div className="empty-state">
          <File size={48} className="empty-state-icon" />
          <div>No files shared yet</div>
        </div>
      ) : (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index} className="file-item">
              <div className="file-info">
                <h4>{file.name}</h4>
                <div className="file-meta">
                  {file.parts} parts • {file.size}
                </div>
              </div>
              <div className="sharing-badge">
                Sharing
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MySharedFiles