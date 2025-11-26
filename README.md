# TikTok Processor

A simple React web application to process TikTok videos by extracting frames and transcripts.

## Features

- Paste a TikTok URL and process it
- View the job ID from the ingest endpoint
- Display extracted frame thumbnails
- View the full transcript in a scrollable text box

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

1. Paste a TikTok URL in the input field
2. Click the "Process" button
3. The app will:
   - Call the ingest endpoint and display the job ID
   - Fetch and display frame thumbnails
   - Fetch and display the transcript

## Build

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.


