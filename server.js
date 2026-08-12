const express = require("express");
const { Readable } = require("stream");

const app = express();

const API_BASE =
  "https://meta.davidxtech.de/api/instagram/download?url=";

app.use(express.static(__dirname));

app.get("/api/download", async (req, res) => {
  try {
    const instagramUrl = String(req.query.url || "").trim();

    if (!instagramUrl) {
      return res.status(400).json({
        success: false,
        error: "Instagram URL is required."
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(instagramUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid Instagram URL."
      });
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    const validInstagram =
      hostname === "instagram.com" ||
      hostname.endsWith(".instagram.com") ||
      hostname === "instagr.am" ||
      hostname.endsWith(".instagr.am");

    if (!validInstagram) {
      return res.status(400).json({
        success: false,
        error: "Only Instagram URLs are supported."
      });
    }

    const apiResponse = await fetch(
      API_BASE + encodeURIComponent(instagramUrl),
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    if (!apiResponse.ok) {
      return res.status(502).json({
        success: false,
        error: "Downloader API is unavailable."
      });
    }

    const data = await apiResponse.json();

    const videoUrl =
      data &&
      data.data &&
      data.data.url;

    if (data.success !== true || !videoUrl) {
      return res.status(404).json({
        success: false,
        error: "No downloadable video was returned."
      });
    }

    const videoResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "video/mp4,video/*,*/*"
      }
    });

    if (!videoResponse.ok || !videoResponse.body) {
      return res.status(502).json({
        success: false,
        error: "Could not fetch the video file."
      });
    }

    res.setHeader(
      "Content-Type",
      videoResponse.headers.get("content-type") ||
        "video/mp4"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="instagram-video.mp4"'
    );

    const contentLength =
      videoResponse.headers.get("content-length");

    if (contentLength) {
      res.setHeader(
        "Content-Length",
        contentLength
      );
    }

    Readable
      .fromWeb(videoResponse.body)
      .pipe(res);

  } catch (error) {
    console.error("Download server error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Download failed."
      });
    }
  }
});

module.exports = app;