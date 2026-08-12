const API_BASE = "https://meta.davidxtech.de/api/instagram/download?url=";

const urlInput = document.getElementById("urlInput");
const downloadBtn = document.getElementById("downloadBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const pasteBtn = document.getElementById("pasteBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");
const videoPreview = document.getElementById("videoPreview");
const saveBtn = document.getElementById("saveBtn");
const creator = document.getElementById("creator");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = "message " + type;
}
function clearMessage() {
  message.textContent = "";
  message.className = "message hidden";
}
function isInstagramUrl(value) {
  try {
    const u = new URL(value);
    return /(^|\.)instagram\.com$/i.test(u.hostname) ||
           /(^|\.)instagr\.am$/i.test(u.hostname);
  } catch {
    return false;
  }
}
function setLoading(loading) {
  downloadBtn.disabled = loading;
  btnText.textContent = loading ? "Processing..." : "Download Video";
  spinner.classList.toggle("hidden", !loading);
}

pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) urlInput.value = text.trim();
  } catch {
    showMessage("Clipboard access was blocked. Please paste the Instagram link manually.", "error");
  }
});

downloadBtn.addEventListener("click", async () => {
  clearMessage();
  result.classList.add("hidden");
  videoPreview.removeAttribute("src");
  videoPreview.load();

  const url = urlInput.value.trim();

  if (!url) {
    showMessage("Please paste an Instagram video URL first.");
    urlInput.focus();
    return;
  }

  if (!isInstagramUrl(url)) {
    showMessage("Please enter a valid Instagram URL, for example https://www.instagram.com/reel/...");
    urlInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(API_BASE + encodeURIComponent(url), {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error("API returned HTTP " + response.status);
    }

    const data = await response.json();

    // Expected response shape:
    // { success: true, creator: "DavidXTech", data: { url: "https://...mp4" } }

    if (!data || data.success !== true || !data.data || !data.data.url) {
      throw new Error("The API did not return a downloadable video.");
    }

    const videoUrl = data.data.url;

    creator.textContent = data.creator ? "by " + data.creator : "";
    videoPreview.src = videoUrl;
    saveBtn.href = videoUrl;
    saveBtn.download = "instagram-video.mp4";

    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    console.error(err);
    showMessage(
      "Unable to download this video right now. The API may be unavailable or the Instagram URL may not be supported. Please try again.",
      "error"
    );
  } finally {
    setLoading(false);
  }
});
