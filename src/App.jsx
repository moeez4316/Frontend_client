import { useState, useEffect } from 'react'
import Header from './components/Header'
import PeerInfo from './components/PeerInfo'
import ShareFile from './components/ShareFile'
import MySharedFiles from './components/MySharedFiles'
import DownloadFile from './components/DownloadFile'
import ActiveDownloads from './components/ActiveDownloads'
import CompletedFiles from './components/CompletedFiles'
import SystemLogs from './components/SystemLogs'
import TrackerPanel from './components/TrackerPanel'
import './App.css'

const API_BASE_URL = 'http://localhost:5001'

function App() {
  const [trackerPanelOpen, setTrackerPanelOpen] = useState(false)
  
  const [peerInfo, setPeerInfo] = useState({
    peerId: 'peer1',
    port: 5001,
    connected: false
  })

  const [sharedFiles, setSharedFiles] = useState([])
  const [availableFiles, setAvailableFiles] = useState([])
  const [activeDownloads, setActiveDownloads] = useState([])
  const [completedFiles, setCompletedFiles] = useState([])
  const [systemLogs, setSystemLogs] = useState([])

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
        parts: 0, // This will be updated when we implement file info fetching
        peers: [] // This will be updated when we implement peer discovery
      }));
      setAvailableFiles(formattedAvailableFiles);

      addLog('Peer started successfully', 'success');
      addLog(`Registered ${formattedSharedFiles.length} shared files`, 'info');
    } catch (error) {
      addLog(`Failed to start peer: ${error.message}`, 'error');
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
      
      const newSharedFile = {
        name: file.name,
        parts: data.parts,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      };

      setSharedFiles(prev => [...prev, newSharedFile]);
      addLog(`Shared file: ${file.name} (${newSharedFile.parts} parts)`, 'success');
    } catch (error) {
      addLog(`Failed to share file: ${error.message}`, 'error');
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
                }

                return updatedDownload;
              }
              return download;
            }));
          }
        } catch (error) {
          console.error('Error checking download progress:', error);
        }
      }, 1000);
    } catch (error) {
      addLog(`Failed to start download: ${error.message}`, 'error');
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
    } catch (error) {
      addLog(`Failed to delete chunks: ${error.message}`, 'error');
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
    } catch (error) {
      addLog(`Failed to cancel download: ${error.message}`, 'error');
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
          port: parseInt(trackerInfo.port)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to configure tracker');
      }

      setPeerInfo(prev => ({ ...prev, connected: true }));
      addLog(`Tracker connection established at ${trackerInfo.ipAddress}:${trackerInfo.port}`, 'success');
      
      // Start the peer after successful tracker connection
      await startPeer();
    } catch (error) {
      setPeerInfo(prev => ({ ...prev, connected: false }));
      addLog(`Failed to connect to tracker: ${error.message}`, 'error');
    }
  }

  return (
    <div className="app">
      <Header onTrackerToggle={() => setTrackerPanelOpen(true)} />
      
      <div className="container">
        <div className="main-grid">
          <div className="left-column">
            <PeerInfo peerInfo={peerInfo} />
            <ShareFile onShareFile={handleShareFile} />
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
    </div>
  )
}

export default App