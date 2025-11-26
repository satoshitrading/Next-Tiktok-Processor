import { useState } from 'react'
import './App.css'

const INGEST_ENDPOINT = 'https://iwc.app.n8n.cloud/webhook/api/remix/ingest'
const FRAMES_ENDPOINT = 'https://iwc.app.n8n.cloud/webhook/api/remix/frames'
const TRANSCRIBE_ENDPOINT = 'https://iwc.app.n8n.cloud/webhook/api/remix/transcribe'

function App() {
  const [tiktokURL, setTiktokURL] = useState('')
  const [jobId, setJobId] = useState(null)
  const [frames, setFrames] = useState([])
  const [transcript, setTranscript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleProcess = async () => {
    if (!tiktokURL.trim()) {
      setError('Please enter a TikTok URL')
      return
    }

    setLoading(true)
    setTranscriptLoading(false)
    setError(null)
    setJobId(null)
    setFrames([])
    setTranscript(null)

    try {
      // Step 1: Call ingest endpoint
      const ingestResponse = await fetch(INGEST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tiktokURL: tiktokURL.trim(),
        }),
      })

      if (!ingestResponse.ok) {
        throw new Error(`Ingest failed: ${ingestResponse.statusText}`)
      }

      const ingestData = await ingestResponse.json()
      const receivedJobId = ingestData.job_id || ingestData.jobId || ingestData.id
      
      if (!receivedJobId) {
        throw new Error('No job_id received from ingest endpoint')
      }

      setJobId(receivedJobId)

      // Step 2: Call frames endpoint
      try {
        const framesResponse = await fetch(FRAMES_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: receivedJobId,
          }),
        })

        if (framesResponse.ok) {
          const framesData = await framesResponse.json()
          // Handle different possible response formats
          const frameUrls = framesData.frames || framesData.frame_urls || framesData.thumbnails || []
          setFrames(Array.isArray(frameUrls) ? frameUrls : [])
        }
      } catch (framesError) {
        console.error('Error fetching frames:', framesError)
        // Don't throw, just log - frames might not be ready yet
      }

      // Step 3: Call transcribe endpoint
      setTranscriptLoading(true)
      try {
        const transcribeResponse = await fetch(TRANSCRIBE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: receivedJobId,
          }),
        })

        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json()
          console.log(transcribeData, '===transcribeData')
          // Handle different possible response formats
          setTranscript(transcribeData || null)
        }
      } catch (transcribeError) {
        console.error('Error fetching transcript:', transcribeError)
        // Don't throw, just log - transcript might not be ready yet
      } finally {
        setTranscriptLoading(false)
      }
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

        {jobId && (
          <div className="job-id-section">
            <h2>Job ID</h2>
            <div className="job-id">{jobId}</div>
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

        {(transcriptLoading || transcript) && (
          <div className="transcript-section">
            <h2>Transcript</h2>
            <div className="transcript-box">
              {transcriptLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p className="loading-text">Loading transcript...</p>
                </div>
              ) : transcript ? (
                <ul className="transcript-list">
                  {Object.entries(transcript)
                    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                    .map(([key, value]) => (
                      <li key={key} className="transcript-item">
                        <div className="transcript-label">{key}</div>
                        <div className="transcript-content">{value}</div>
                      </li>
                    ))}
                </ul>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App


