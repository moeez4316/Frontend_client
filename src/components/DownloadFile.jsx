import { useState } from 'react'
import { Download, Users } from 'lucide-react'

function DownloadFile({ availableFiles, onDownloadFile }) {
  const [selectedFile, setSelectedFile] = useState('')

  const handleDownload = () => {
    if (selectedFile) {
      onDownloadFile(selectedFile)
      setSelectedFile('')
    }
  }

  const selectedFileData = availableFiles.find(f => f.name === selectedFile)

  return (
    <div className="card">
      <div className="card-header">
        <Download size={20} />
        <h2 className="card-title">Download File</h2>
      </div>
      
      <select 
        className="select"
        value={selectedFile}
        onChange={(e) => setSelectedFile(e.target.value)}
      >
        <option value="">Select a file to download...</option>
        {availableFiles.map((file, index) => (
          <option key={index} value={file.name}>
            {file.name} ({file.parts} parts from {file.peers.length} peers)
          </option>
        ))}
      </select>
      
      {selectedFile && selectedFileData && (
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
      
      <button 
        className="btn btn-primary"
        onClick={handleDownload}
        disabled={!selectedFile}
        style={{ width: '100%' }}
      >
        <Download size={16} />
        Start Download
      </button>
    </div>
  )
}

export default DownloadFile