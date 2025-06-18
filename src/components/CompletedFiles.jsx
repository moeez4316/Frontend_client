import { CheckCircle, Trash2, FolderOpen, AlertCircle } from 'lucide-react'
import { useState } from 'react'

function CompletedFiles({ files, onDeleteChunks }) {
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteStatus, setDeleteStatus] = useState(null)

  const handleDeleteChunks = async (fileName) => {
    try {
      await onDeleteChunks(fileName)
      setDeleteStatus({ type: 'success', message: `Chunks deleted for ${fileName}` })
      setConfirmDelete(null)
    } catch (error) {
      setDeleteStatus({ type: 'error', message: `Failed to delete chunks: ${error.message}` })
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setDeleteStatus(null), 3000)
  }

  return (
    <div className="card">
      <div className="card-header">
        <CheckCircle size={20} />
        <h2 className="card-title">Completed Downloads</h2>
      </div>
      
      {deleteStatus && (
        <div className={`alert alert-${deleteStatus.type}`}>
          {deleteStatus.message}
        </div>
      )}
      
      {files.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} className="empty-state-icon" />
          <div>No completed downloads yet</div>
        </div>
      ) : (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index} className="file-item">
              <div className="file-info">
                <h4>{file.name}</h4>
                <div className="file-meta">
                  {file.size} • Downloaded {file.downloadedAt}
                </div>
              </div>
              
              {confirmDelete === file.name ? (
                <div className="delete-confirmation">
                  <span className="confirmation-text">
                    <AlertCircle size={12} />
                    Delete chunks?
                  </span>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteChunks(file.name)}
                  >
                    Yes
                  </button>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => setConfirmDelete(null)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => setConfirmDelete(file.name)}
                  title="Delete chunk files to free up space"
                >
                  <Trash2 size={12} />
                  Delete Chunks
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CompletedFiles