/*
====================================================
INSTAWALA - INSTAGRAM VIDEO DOWNLOADER
====================================================

The external API returns something like:

{
    "success": true,
    "creator": "InstaWala",
    "data": {
        "url": "https://....mp4"
    }
}

IMPORTANT:

The returned Instagram CDN URL is ONLY used
for video preview.

The Download button uses our own Node.js
backend:

/api/download?url=INSTAGRAM_URL

This prevents the browser from simply opening
the Instagram CDN video in a new tab.
====================================================
*/


const API_BASE =
  "https://meta.davidxtech.de/api/instagram/download?url=";


/* =========================
   ELEMENTS
========================= */

const urlInput =
  document.getElementById("urlInput");

const downloadBtn =
  document.getElementById("downloadBtn");

const btnText =
  document.getElementById("btnText");

const spinner =
  document.getElementById("spinner");

const pasteBtn =
  document.getElementById("pasteBtn");

const message =
  document.getElementById("message");

const result =
  document.getElementById("result");

const videoPreview =
  document.getElementById("videoPreview");

const saveBtn =
  document.getElementById("saveBtn");

const creator =
  document.getElementById("creator");


/* =========================
   HELPERS
========================= */

function showMessage(
  text,
  type = "error"
) {

  message.textContent = text;

  message.className =
    "message " + type;

}


function clearMessage() {

  message.textContent = "";

  message.className =
    "message hidden";

}


function isInstagramUrl(value) {

  try {

    const url =
      new URL(value);

    return (

      /(^|\.)instagram\.com$/i
        .test(url.hostname)

      ||

      /(^|\.)instagr\.am$/i
        .test(url.hostname)

    );

  } catch {

    return false;

  }

}


function setLoading(loading) {

  downloadBtn.disabled =
    loading;

  btnText.textContent =
    loading
      ? "Processing..."
      : "Download Video";

  spinner.classList.toggle(
    "hidden",
    !loading
  );

}


/* =========================
   PASTE BUTTON
========================= */

pasteBtn.addEventListener(
  "click",
  async () => {

    try {

      const text =
        await navigator
          .clipboard
          .readText();

      if (text) {

        urlInput.value =
          text.trim();

      }

    } catch (error) {

      showMessage(
        "Clipboard access was blocked. Please paste the Instagram link manually."
      );

    }

  }
);


/* =========================
   DOWNLOAD BUTTON
========================= */

downloadBtn.addEventListener(
  "click",
  async () => {

    clearMessage();

    result.classList.add(
      "hidden"
    );

    videoPreview
      .removeAttribute("src");

    videoPreview.load();


    const instagramUrl =
      urlInput.value.trim();


    /* =====================
       EMPTY URL
    ===================== */

    if (!instagramUrl) {

      showMessage(
        "Please paste an Instagram video URL first."
      );

      urlInput.focus();

      return;

    }


    /* =====================
       VALIDATE URL
    ===================== */

    if (
      !isInstagramUrl(
        instagramUrl
      )
    ) {

      showMessage(
        "Please enter a valid Instagram URL, for example https://www.instagram.com/reel/..."
      );

      urlInput.focus();

      return;

    }


    setLoading(true);


    try {

      /*
      ==========================================
      STEP 1
      Call DavidXTech API
      ==========================================
      */

      const response =
        await fetch(
          API_BASE +
          encodeURIComponent(
            instagramUrl
          ),
          {
            method: "GET",

            headers: {
              "Accept":
                "application/json"
            }
          }
        );


      if (!response.ok) {

        throw new Error(
          "API returned HTTP " +
          response.status
        );

      }


      const data =
        await response.json();


      /*
      ==========================================
      STEP 2
      Validate API response
      ==========================================
      */

      if (
        !data ||
        data.success !== true ||
        !data.data ||
        !data.data.url
      ) {

        throw new Error(
          "No downloadable video returned."
        );

      }


      const videoUrl =
        data.data.url;


      /*
      ==========================================
      STEP 3
      Preview the returned MP4
      ==========================================
      */

      videoPreview.src =
        videoUrl;


      /*
      ==========================================
      STEP 4
      IMPORTANT DOWNLOAD FIX

      DO NOT use:

      saveBtn.href = videoUrl;

      because browser may open the
      Instagram CDN video.

      Instead use our Node backend.
      ==========================================
      */

      saveBtn.href =
        "/api/download?url=" +
        encodeURIComponent(
          instagramUrl
        );


      /*
      Force same-tab navigation.
      The backend sends Content-Disposition:
      attachment.
      */

      saveBtn.target =
        "_self";


      /*
      ==========================================
      STEP 5
      Brand name
      ==========================================
      */

      creator.textContent =
        "by InstaWala";


      /*
      ==========================================
      STEP 6
      Show result
      ==========================================
      */

      result.classList.remove(
        "hidden"
      );


      result.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


    } catch (error) {

      console.error(
        "Downloader error:",
        error
      );


      showMessage(
        "Unable to process this Instagram video right now. Please try another public video."
      );


    } finally {

      setLoading(false);

    }

  }
);