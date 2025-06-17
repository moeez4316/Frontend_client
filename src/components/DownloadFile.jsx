import React, { useState } from 'react'
import { Download, Users } from 'lucide-react'

function DownloadFile({ availableFiles, onDownloadFile }) {
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!fileName.trim()) {
      setError('Please enter a file name')
      return
    }

    try {
      // First add the file to target files
      const response = await fetch('http://localhost:5001/add_target_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: fileName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add target file')
      }

      // Then start the download
      onDownloadFile(fileName)
      setFileName('') // Clear the input after successful submission
    } catch (error) {
      setError(error.message)
    }
  }

  const selectedFileData = availableFiles.find(f => f.name === fileName)

  return (
    <div className="card">
      <div className="card-header">
        <Download size={20} />
        <h2 className="card-title">Download File</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="download-form">
        <div className="form-group">
          <label htmlFor="fileName">Enter file name to download:</label>
          <input
            type="text"
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name..."
            className={error ? 'error' : ''}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        <button type="submit" className="primary">
          Download File
        </button>
      </form>

      {availableFiles.length > 0 && (
        <div className="available-files">
          <h3>Available Files</h3>
          <ul className="file-list">
            {availableFiles.map((file) => (
              <li key={file.name} className="file-item">
                <span>{file.name}</span>
                <span>{file.parts} parts</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFileData && (
        <div className="file-preview">
          <div className="file-preview-header">
            <Users size={16} />
            <strong>Available from peers:</strong>
          </div>
          <div className="file-preview-peers">
            {selectedFileData.peers.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

export default DownloadFile