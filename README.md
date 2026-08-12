# InstaSave — Instagram Video Downloader

A cute, responsive HTML/CSS/JavaScript frontend using the supplied DavidXTech-style API endpoint.

## Files
- index.html
- style.css
- script.js

## API
The JavaScript currently calls:

https://meta.davidxtech.de/api/instagram/download?url=

and expects:

{
  "success": true,
  "creator": "DavidXTech",
  "data": {
    "url": "https://...mp4"
  }
}

## Important: CORS
Because this is a browser-only frontend, the API server must allow requests from your website with CORS.

If the browser console shows a CORS error, do not put API keys or private credentials in JavaScript. Put a small backend/proxy on your own domain and have the frontend call your backend instead.

## Run
You can open index.html for the UI. For best results use a local server, e.g. VS Code Live Server.

## Notes
Use only publicly accessible content and content you have permission to download. Do not request Instagram login credentials.
