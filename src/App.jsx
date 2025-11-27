import { useState } from 'react'
import './App.css'

const TIKTOK_INGEST_ENDPOINT = 'https://iwc.app.n8n.cloud/webhook/api/remix/tiktok-ingest-v1'

function App() {
  const [tiktokURL, setTiktokURL] = useState('')
  const [videoData, setVideoData] = useState(null)
  const [frames, setFrames] = useState([])
  const [transcript, setTranscript] = useState(null)
  const [tones, setTones] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleProcess = async () => {
    if (!tiktokURL.trim()) {
      setError('Please enter a TikTok URL')
      return
    }

    setLoading(true)
    setError(null)
    setVideoData(null)
    setFrames([])
    setTranscript(null)
    setTones(null)

    try {
      const response = await fetch(TIKTOK_INGEST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tiktokURL: tiktokURL.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status !== 'success') {
        throw new Error(data.message || 'Processing failed')
      }

      // Set all the data from the response
      setVideoData(data.video || null)
      setFrames(Array.isArray(data.frames) ? data.frames : [])
      setTranscript(data.transcript || null)
      setTones(data.tones || null)
    } catch (err) {
      setError(err.message || 'An error occurred while processing')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>TikTok Processor</h1>
        
        <div className="input-section">
          <input
            type="text"
            value={tiktokURL}
            onChange={(e) => setTiktokURL(e.target.value)}
            placeholder="Paste TikTok URL here..."
            className="url-input"
            disabled={loading}
          />
          <button
            onClick={handleProcess}
            disabled={loading || !tiktokURL.trim()}
            className="process-button"
          >
            {loading ? 'Processing...' : 'Process'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {videoData && (
          <div className="video-info-section">
            <h2>Video Information</h2>
            <div className="video-info">
              <div className="info-item">
                <strong>Video ID:</strong> {videoData.video_id}
              </div>
              <div className="info-item">
                <strong>User:</strong> {videoData.user_name}
              </div>
              <div className="info-item">
                <strong>Duration:</strong> {videoData.video_duration} seconds
              </div>
              {videoData.video_url && (
                <div className="info-item">
                  <strong>Video URL:</strong>{' '}
                  <a href={videoData.video_url} target="_blank" rel="noopener noreferrer">
                    {videoData.video_url}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {frames.length > 0 && (
          <div className="frames-section">
            <h2>Frame Thumbnails</h2>
            <div className="frames-grid">
              {frames.map((frameUrl, index) => (
                <div key={index} className="frame-item">
                  <img
                    src={frameUrl}
                    alt={`Frame ${index + 1}`}
                    className="frame-thumbnail"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div className="frame-error" style={{ display: 'none' }}>
                    Failed to load image
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tones && (
          <div className="tones-section">
            <h2>Tone Variations</h2>
            <ul className="tones-list">
              {Object.entries(tones)
                .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                .map(([key, value]) => (
                  <li key={key} className="tone-item">
                    <div className="tone-label">{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div className="tone-content">{value}</div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {transcript && (
          <div className="transcript-section">
            <h2>Transcript</h2>
            <div className="transcript-box">
              <p className="transcript-text">{transcript}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App


