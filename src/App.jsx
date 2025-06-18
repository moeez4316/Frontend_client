import { useState, useEffect } from 'react'
import Header from './components/Header'
import PeerInfo from './components/PeerInfo'
import PeerStatus from './components/PeerStatus'
import ShareFile from './components/ShareFile'
import FileUpload from './components/FileUpload'
import MySharedFiles from './components/MySharedFiles'
import DownloadFile from './components/DownloadFile'
import ActiveDownloads from './components/ActiveDownloads'
import CompletedFiles from './components/CompletedFiles'
import SystemLogs from './components/SystemLogs'
import TrackerPanel from './components/TrackerPanel'
import { ToastContainer } from './components/Toast'
import './App.css'

const API_BASE_URL = 'http://localhost:5001'

function App() {
  const [trackerPanelOpen, setTrackerPanelOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  
  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])
  
  // Load saved state from localStorage
  const [peerInfo, setPeerInfo] = useState(() => {
    const saved = localStorage.getItem('peerInfo')
    return saved ? JSON.parse(saved) : {
      peerId: 'Moeez_Ahmed',
      port: 5001,
      connected: false
    }
  })

  const [sharedFiles, setSharedFiles] = useState([])
  const [availableFiles, setAvailableFiles] = useState([])
  const [activeDownloads, setActiveDownloads] = useState([])
  const [completedFiles, setCompletedFiles] = useState([])
  const [systemLogs, setSystemLogs] = useState([])
  const [networkStats, setNetworkStats] = useState({
    activePeers: 0,
    transferRate: '0'
  })

  // Save peerInfo to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('peerInfo', JSON.stringify(peerInfo))
  }, [peerInfo])

  // Toast notification functions
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Function to refresh shared files
  const refreshSharedFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/start_peer`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh shared files');
      }

      const data = await response.json();
      
      // Update shared files
      const formattedSharedFiles = Object.entries(data.shared_files).map(([name, parts]) => ({
        name,
        parts,
        size: 'Calculating...' // You might want to add file size calculation
      }));
      setSharedFiles(formattedSharedFiles);

      // Update available files for download
      const formattedAvailableFiles = data.download_targets.map(name => ({
        name,
        parts: 0,
        peers: []
      }));
      setAvailableFiles(formattedAvailableFiles);

      addLog('Shared files refreshed', 'success');
      addToast('Shared files refreshed successfully', 'success');
    } catch (error) {
      addLog(`Failed to refresh shared files: ${error.message}`, 'error');
      addToast(`Failed to refresh shared files: ${error.message}`, 'error');
    }
  }

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }
    setSystemLogs(prev => [newLog, ...prev.slice(0, 9)])
  }

  const startPeer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/start_peer`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to start peer');
      }

      const data = await response.json();
      
      // Update shared files
      const formattedSharedFiles = Object.entries(data.shared_files).map(([name, parts]) => ({
        name,
        parts,
        size: 'Calculating...' // You might want to add file size calculation
      }));
      setSharedFiles(formattedSharedFiles);

      // Update available files for download
      const formattedAvailableFiles = data.download_targets.map(name => ({
        name,
        parts: 0,
        peers: []
      }));
      setAvailableFiles(formattedAvailableFiles);

      addLog('Peer started successfully', 'success');
      addLog(`Registered ${formattedSharedFiles.length} shared files`, 'info');
      addToast('Peer started successfully', 'success');
    } catch (error) {
      addLog(`Failed to start peer: ${error.message}`, 'error');
      addToast(`Failed to start peer: ${error.message}`, 'error');
    }
  }

  const handleShareFile = async (file) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/share_file`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to share file');
      }

      const data = await response.json();
      
      // Refresh the shared files list after successful upload
      await refreshSharedFiles();
      
      addLog(`Shared file: ${file.name} (${data.parts} parts)`, 'success');
      addToast(`File "${file.name}" shared successfully`, 'success');
    } catch (error) {
      addLog(`Failed to share file: ${error.message}`, 'error');
      addToast(`Failed to share file: ${error.message}`, 'error');
    }
  }

  const handleFileSelect = (files) => {
    if (files.length > 0) {
      handleShareFile(files[0]);
    }
  }

  const handleDownloadFile = async (fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${fileName}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start download');
      }

      const data = await response.json();
      
      const newDownload = {
        id: Date.now(),
        fileName: fileName,
        progress: 0,
        currentPart: 0,
        totalParts: 0, // This will be updated when we implement progress tracking
        status: 'starting',
        fromPeer: 'unknown' // This will be updated when we implement peer selection
      };

      setActiveDownloads(prev => [...prev, newDownload]);
      addLog(`Started downloading ${fileName}`, 'info');
      addToast(`Started downloading ${fileName}`, 'info');

      // Start polling for download progress
      const progressInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`${API_BASE_URL}/download_progress/${fileName}`);
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            
            setActiveDownloads(prev => prev.map(download => {
              if (download.fileName === fileName) {
                const updatedDownload = {
                  ...download,
                  progress: progressData.progress,
                  currentPart: progressData.currentPart,
                  totalParts: progressData.totalParts,
                  status: progressData.status
                };

                if (progressData.status === 'completed') {
                  clearInterval(progressInterval);
                  setCompletedFiles(prev => [{
                    name: fileName,
                    size: progressData.size,
                    downloadedAt: new Date().toLocaleString()
                  }, ...prev]);
                  setActiveDownloads(prev => prev.filter(d => d.fileName !== fileName));
                  addLog(`Download completed: ${fileName}`, 'success');
                  addToast(`Download completed: ${fileName}`, 'success');
                } else if (progressData.status === 'error') {
                  clearInterval(progressInterval);
                  setActiveDownloads(prev => prev.filter(d => d.fileName !== fileName));
                  addLog(`Download failed: ${fileName}`, 'error');
                  addToast(`Download failed: ${fileName}`, 'error');
                } else if (progressData.status === 'cancelled') {
                  clearInterval(progressInterval);
                  setActiveDownloads(prev => prev.filter(d => d.fileName !== fileName));
                  addLog(`Download cancelled: ${fileName}`, 'warning');
                  addToast(`Download cancelled: ${fileName}`, 'warning');
                }

                return updatedDownload;
              }
              return download;
            }));
          } else if (progressResponse.status === 404) {
            // Download not found, stop polling
            clearInterval(progressInterval);
            setActiveDownloads(prev => prev.filter(d => d.fileName !== fileName));
            addLog(`Download not found: ${fileName}`, 'error');
            addToast(`Download not found: ${fileName}`, 'error');
          }
        } catch (error) {
          console.error('Error checking download progress:', error);
          // Don't stop polling on network errors, just log them
          addLog(`Network error checking progress: ${error.message}`, 'error');
        }
      }, 1000);
    } catch (error) {
      addLog(`Failed to start download: ${error.message}`, 'error');
      addToast(`Failed to start download: ${error.message}`, 'error');
    }
  }

  const handleDeleteChunks = async (fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete_chunks/${fileName}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete chunks');
      }

      setCompletedFiles(prev => prev.filter(file => file.name !== fileName));
      addLog(`Deleted chunk files for ${fileName}`, 'info');
      addToast(`Deleted chunk files for ${fileName}`, 'success');
    } catch (error) {
      addLog(`Failed to delete chunks: ${error.message}`, 'error');
      addToast(`Failed to delete chunks: ${error.message}`, 'error');
    }
  }

  const handleCancelDownload = async (downloadId) => {
    const download = activeDownloads.find(d => d.id === downloadId);
    if (!download) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cancel_download/${download.fileName}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel download');
      }

      setActiveDownloads(prev => prev.filter(d => d.id !== downloadId));
      addLog('Download cancelled', 'warning');
      addToast('Download cancelled', 'warning');
    } catch (error) {
      addLog(`Failed to cancel download: ${error.message}`, 'error');
      addToast(`Failed to cancel download: ${error.message}`, 'error');
    }
  }

  const handleTrackerConnect = async (trackerInfo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/configure_tracker`, {
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
        throw new Error('Failed to configure tracker');
      }

      setPeerInfo(prev => ({ ...prev, connected: true }));
      addLog(`Tracker connection established at ${trackerInfo.ipAddress}:${trackerInfo.port}`, 'success');
      addToast(`Connected to tracker at ${trackerInfo.ipAddress}:${trackerInfo.port}`, 'success');
      
      // Start the peer after successful tracker connection
      await startPeer();
    } catch (error) {
      setPeerInfo(prev => ({ ...prev, connected: false }));
      addLog(`Failed to connect to tracker: ${error.message}`, 'error');
      addToast(`Failed to connect to tracker: ${error.message}`, 'error');
    }
  }

  return (
    <div className="app">
      <Header onTrackerToggle={() => setTrackerPanelOpen(true)} />
      
      <div className="container">
        <div className="main-grid">
          <div className="left-column">
            <PeerInfo peerInfo={peerInfo} />
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Share Files</h2>
              </div>
              <FileUpload onFileSelect={handleFileSelect} maxFiles={5} />
            </div>
            <MySharedFiles files={sharedFiles} />
          </div>
          
          <div className="right-column">
            <DownloadFile 
              availableFiles={availableFiles} 
              onDownloadFile={handleDownloadFile}
            />
            <ActiveDownloads 
              downloads={activeDownloads}
              onCancelDownload={handleCancelDownload}
            />
            <CompletedFiles 
              files={completedFiles}
              onDeleteChunks={handleDeleteChunks}
            />
          </div>
        </div>
        
        <SystemLogs logs={systemLogs} />
      </div>

      <TrackerPanel 
        isOpen={trackerPanelOpen}
        onClose={() => setTrackerPanelOpen(false)}
        onConnect={handleTrackerConnect}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App