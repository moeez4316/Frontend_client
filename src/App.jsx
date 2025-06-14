import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [peerInfo, setPeerInfo] = useState(null);
  const [downloadFile, setDownloadFile] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');

  // Fetch peer info on load
  const fetchPeerInfo = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5001/start_peer");
      console.log("[DEBUG] Peer info:", response.data);
      setPeerInfo(response.data);
    } catch (err) {
      console.error("[ERROR] Failed to fetch peer info:", err);
    }
  };

  const handleDownload = async () => {
    if (!downloadFile) return;
    setDownloadStatus('Starting download...');
    try {
      const res = await axios.post(`http://127.0.0.1:5001/download/${downloadFile}`);
      setDownloadStatus(res.data.message);
    } catch (err) {
      console.error("[ERROR] Download failed:", err);
      setDownloadStatus("Download failed. See console.");
    }
  };

  useEffect(() => {
    fetchPeerInfo();
  }, []);

  return (
    <div className="app">
      <h1>P2P File Sharing - Peer</h1>

      {peerInfo ? (
        <>
          <h2>Peer ID: {peerInfo.peer_id}</h2>

          <h3>Shared Files:</h3>
          <ul>
            {Object.entries(peerInfo.shared_files).map(([file, parts]) => (
              <li key={file}>{file} ({parts} parts)</li>
            ))}
          </ul>

          <h3>Files to Download:</h3>
          <ul>
            {peerInfo.download_targets.map(file => (
              <li key={file}>{file}</li>
            ))}
          </ul>

          <div className="download-section">
            <input
              type="text"
              placeholder="Enter filename to download"
              value={downloadFile}
              onChange={(e) => setDownloadFile(e.target.value)}
            />
            <button onClick={handleDownload}>Download File</button>
            {downloadStatus && <p>{downloadStatus}</p>}
          </div>
        </>
      ) : (
        <p>Loading peer information...</p>
      )}
    </div>
  );
}

export default App;
