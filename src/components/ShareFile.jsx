import { useState } from 'react'
import { Upload, Plus } from 'lucide-react'

function ShareFile({ onShareFile }) {
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      onShareFile(file)
      event.target.value = ''
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      onShareFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className="card">
      <div className="card-header">
        <Upload size={20} />
        <h2 className="card-title">Share File</h2>
      </div>
      
      <div 
        className={`file-input-area ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input 
          type="file" 
          onChange={handleFileSelect}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-input-content">
          <Plus size={32} className="file-input-icon" />
          <div className="file-input-text">
            Click to select or drag & drop a file here
          </div>
        </label>
      </div>
    </div>
  )
}

export default ShareFile