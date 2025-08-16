// TikTok Downloader API for Cloudflare Workers
// Supports both web interface and API parameters

// TikTok downloader function (converted from TypeScript, no axios)
async function tiktokDl(url) {
  try {
    const formData = new URLSearchParams()
    formData.append("url", url)
    formData.append("hd", "1")

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: "https://www.tikwm.com",
        Referer: "https://www.tikwm.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      body: formData,
    })

    const data = await response.json()
    const res = data.data

    if (!res) {
      throw new Error("Failed to fetch TikTok data")
    }

    const mediaData = []

    function formatNumber(integer) {
      return Number(Number.parseInt(integer)).toLocaleString().replace(/,/g, ".")
    }

    function formatDate(n, locale = "en") {
      return new Date(n * 1000).toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })
    }

    // Check if it's a photo slideshow or video
    if (!res.size && !res.wm_size && !res.hd_size && res.images) {
      res.images.forEach((imageUrl) => {
        mediaData.push({ type: "photo", url: imageUrl })
      })
    } else {
      if (res.wmplay) mediaData.push({ type: "watermark", url: res.wmplay })
      if (res.play) mediaData.push({ type: "nowatermark", url: res.play })
      if (res.hdplay) mediaData.push({ type: "nowatermark_hd", url: res.hdplay })
    }

    return {
      status: true,
      developer: "@Al_Azet",
      title: res.title,
      taken_at: formatDate(res.create_time),
      region: res.region,
      id: res.id,
      durations: res.duration,
      duration: res.duration + " Seconds",
      cover: res.cover,
      size_wm: res.wm_size,
      size_nowm: res.size,
      size_nowm_hd: res.hd_size,
      data: mediaData,
      music_info: {
        id: res.music_info?.id,
        title: res.music_info?.title,
        author: res.music_info?.author,
        album: res.music_info?.album || null,
        url: res.music || res.music_info?.play,
      },
      stats: {
        views: formatNumber(res.play_count || 0),
        likes: formatNumber(res.digg_count || 0),
        comment: formatNumber(res.comment_count || 0),
        share: formatNumber(res.share_count || 0),
        download: formatNumber(res.download_count || 0),
      },
      author: {
        id: res.author?.id,
        fullname: res.author?.unique_id,
        nickname: res.author?.nickname,
        avatar: res.author?.avatar,
      },
    }
  } catch (error) {
    throw new Error(`TikTok download failed: ${error.message}`)
  }
}

// HTML template for the web interface
const HTML_TEMPLATE =
  `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TikTok Downloader - AL AZET</title>
    <link rel="icon" href="https://files.catbox.moe/yxgmb5.png" type="image/x-icon">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100vw;
            height: 100vh;
            overflow-x: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: radial-gradient(circle at center, #0a0a0a 0%, #000000 100%);
            color: #ffffff;
            position: relative;
        }

        /* Animated background */
        .bg-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: 
                radial-gradient(circle, #ff0040 1px, transparent 1px) 0 0/50px 50px,
                radial-gradient(circle, #00eaff 1px, transparent 1px) 25px 25px/50px 50px;
            opacity: 0.1;
            animation: stars-move 20s linear infinite;
        }

        @keyframes stars-move {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-50px); }
        }

        /* Fullscreen button */
        .fullscreen-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 0, 64, 0.2);
            border: 2px solid #ff0040;
            border-radius: 12px;
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .fullscreen-btn:hover {
            background: rgba(255, 0, 64, 0.4);
            box-shadow: 0 0 20px rgba(255, 0, 64, 0.5);
        }

        .fullscreen-btn svg {
            width: 24px;
            height: 24px;
            fill: #ff0040;
        }

        /* Main container */
        .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 40px 20px 20px;
            position: relative;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 40px;
            width: 100%;
        }

        .title {
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(45deg, #ff0040, #00eaff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            text-shadow: 0 0 30px rgba(255, 0, 64, 0.3);
        }

        .subtitle {
            font-size: 1.2rem;
            color: #cccccc;
            margin-bottom: 20px;
        }

        /* Input section */
        .input-section {
            width: 100%;
            max-width: 800px;
            margin-bottom: 40px;
        }

        .input-container {
            display: flex;
            gap: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 8px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .url-input {
            flex: 1;
            background: transparent;
            border: none;
            padding: 15px 20px;
            color: #ffffff;
            font-size: 1rem;
            outline: none;
            border-radius: 15px;
        }

        .url-input::placeholder {
            color: #888888;
        }

        .download-btn {
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border: none;
            padding: 15px 30px;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        .download-btn:hover {
            background: linear-gradient(45deg, #ff4070, #ff0040);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 0, 64, 0.3);
        }

        .download-btn:disabled {
            background: #666666;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* Loading animation */
        .loading {
            display: none;
            text-align: center;
            margin: 40px 0;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left: 4px solid #ff0040;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Results section */
        .results {
            width: 100%;
            max-width: 1200px;
            display: none;
        }

        /* Enhanced result info to match TikTok design with better styling */
        .result-info {
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.95));
            border: 2px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            padding: 30px;
            margin-bottom: 30px;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .post-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 15px;
            line-height: 1.4;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .post-meta {
            color: #aaaaaa;
            font-size: 0.95rem;
            margin-bottom: 25px;
            font-weight: 500;
        }

        .author-section {
            display: flex;
            align-items: center;
            gap: 18px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .author-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .author-info {
            flex: 1;
        }

        .author-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .author-username {
            font-size: 1rem;
            color: #aaaaaa;
            font-weight: 500;
        }

        /* Enhanced stats grid with better icons and styling */
        .result-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 18px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .stat-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
        }

        .stat-icon.views { 
            background: linear-gradient(45deg, #00aaff, #0088cc);
            color: white;
        }
        .stat-icon.likes { 
            background: linear-gradient(45deg, #ff3040, #cc2030);
            color: white;
        }
        .stat-icon.comments { 
            background: linear-gradient(45deg, #00ff88, #00cc66);
            color: white;
        }
        .stat-icon.shares { 
            background: linear-gradient(45deg, #aa44ff, #8833cc);
            color: white;
        }

        .stat-content {
            flex: 1;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #aaaaaa;
            margin-bottom: 4px;
            font-weight: 500;
        }

        .stat-value {
            font-size: 1.3rem;
            font-weight: bold;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        /* Enhanced audio player to match reference design with better styling */
        .audio-section {
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.95));
            border: 2px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            padding: 25px;
            margin-bottom: 30px;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .audio-player-card {
            display: flex;
            align-items: center;
            gap: 25px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
            border-radius: 20px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .music-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 6px 20px rgba(255, 0, 64, 0.3);
        }

        .audio-info {
            flex: 1;
            min-width: 0;
        }

        .audio-title-text {
            font-size: 1.3rem;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .audio-author-text {
            font-size: 1.1rem;
            color: #aaaaaa;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
        }

        .audio-controls {
            display: flex;
            gap: 18px;
            flex-shrink: 0;
        }

        .play-btn {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            border: none;
            background: linear-gradient(45deg, rgba(120, 60, 90, 0.9), rgba(100, 50, 80, 0.9));
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 20px;
            box-shadow: 0 4px 16px rgba(120, 60, 90, 0.3);
        }

        .play-btn:hover {
            background: linear-gradient(45deg, rgba(140, 70, 100, 1), rgba(120, 60, 90, 1));
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(120, 60, 90, 0.5);
        }

        .download-audio-btn {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            border: none;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 20px;
            box-shadow: 0 4px 16px rgba(255, 0, 64, 0.3);
        }

        .download-audio-btn:hover {
            background: linear-gradient(45deg, #ff4070, #ff0040);
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(255, 0, 64, 0.5);
        }

        /* Fixed photo grid to exactly 2 columns as requested */
        .photo-section {
            margin-bottom: 40px;
        }

        .photo-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.95));
            border-radius: 20px;
            border: 2px solid rgba(255, 255, 255, 0.15);
        }

        .photo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, #00ff88, #00cc66);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
        }

        .photo-title {
            font-size: 1.4rem;
            font-weight: bold;
            color: #ffffff;
        }

        .photo-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .photo-item {
            position: relative;
            aspect-ratio: 1;
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .photo-item:hover {
            transform: scale(1.02);
            border-color: #ff0040;
            box-shadow: 0 10px 30px rgba(255, 0, 64, 0.3);
        }

        .photo-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-download {
            position: absolute;
            bottom: 15px;
            right: 15px;
            width: 45px;
            height: 45px;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border: none;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.3s ease;
            font-size: 18px;
        }

        .photo-item:hover .photo-download {
            opacity: 1;
        }

        .photo-download:hover {
            transform: scale(1.1);
        }

        /* Video section */
        .video-section {
            margin-bottom: 40px;
        }

        .video-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.95));
            border-radius: 20px;
            border: 2px solid rgba(255, 255, 255, 0.15);
        }

        .video-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
        }

        .video-title {
            font-size: 1.4rem;
            font-weight: bold;
            color: #ffffff;
        }

        .video-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .video-item {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .video-item:hover {
            border-color: #ff0040;
            box-shadow: 0 10px 30px rgba(255, 0, 64, 0.2);
        }

        .video-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .video-quality {
            font-size: 1.1rem;
            font-weight: bold;
            color: #ffffff;
        }

        .video-size {
            font-size: 0.9rem;
            color: #888888;
        }

        .video-download {
            width: 100%;
            padding: 15px;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border: none;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        .video-download:hover {
            background: linear-gradient(45deg, #ff4070, #ff0040);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 0, 64, 0.3);
        }

        /* API Documentation */
        .api-docs {
            width: 100%;
            max-width: 1000px;
            margin: 60px auto 40px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .api-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #ffffff;
            text-align: center;
        }

        .api-example {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 15px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #cccccc;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow-x: auto;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 30px;
            color: #888888;
            font-size: 0.9rem;
        }

        .footer a {
            color: #ff0040;
            text-decoration: none;
            font-weight: bold;
        }

        .footer a:hover {
            color: #ff4070;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .title {
                font-size: 2.2rem;
            }

            .subtitle {
                font-size: 1rem;
            }

            .input-container {
                flex-direction: column;
                gap: 10px;
            }

            .download-btn {
                width: 100%;
            }

            .audio-player-card {
                flex-direction: column;
                text-align: center;
                gap: 20px;
            }

            .audio-info {
                order: -1;
            }

            .audio-controls {
                justify-content: center;
            }

            .result-stats {
                grid-template-columns: 1fr;
            }

            .author-section {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }

            .container {
                padding: 20px 15px;
            }
        }

        @media (max-width: 480px) {
            .title {
                font-size: 1.8rem;
            }

            .photo-grid {
                grid-template-columns: 1fr;
            }

            .audio-player-card {
                padding: 20px;
            }

            .result-info, .audio-section {
                padding: 20px;
            }
        }

        @media (min-width: 1200px) {
            .photo-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (min-width: 1400px) {
            .photo-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="bg-animation"></div>
    
    <button class="fullscreen-btn" onclick="toggleFullscreen()">
        <svg viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
    </button>

    <div class="container">
        <div class="header">
            <h1 class="title">TikTok Downloader</h1>
            <p class="subtitle">Download TikTok videos, photos, and audio easily</p>
        </div>

        <div class="input-section">
            <div class="input-container">
                <input type="text" class="url-input" placeholder="Paste TikTok URL here..." id="urlInput">
                <button class="download-btn" id="downloadBtn" onclick="downloadTikTok()">Download</button>
            </div>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processing your TikTok URL...</p>
        </div>

        <div class="results" id="results">
            <!-- Results will be populated here -->
        </div>

        <div class="api-docs">
            <h3 class="api-title">🔧 API Usage</h3>
            <p style="margin-bottom: 15px; color: #cccccc;">You can also use this service as an API by adding parameters to the URL:</ 15px; color: #cccccc can also use this service as an API by adding parameters to the URL:
            
            <div class="api-example">
                <strong>GET Request:</strong><br>
                ${typeof window !== "undefined" ? window.location.origin : "https://your-worker.your-subdomain.workers.dev"}/?url=https://www.tiktok.com/@username/video/1234567890
            </div>
            
            <div class="api-example">
                <strong>POST Request:</strong><br>
                POST ${typeof window !== "undefined" ? window.location.origin : "https://your-worker.your-subdomain.workers.dev"}/api<br>
                Content-Type: application/json<br><br>
                {<br>
                &nbsp;&nbsp;"url": "https://www.tiktok.com/@username/video/1234567890"<br>
                }
            </div>
            
            <p style="margin-top: 15px; color: #cccccc;">
                <strong>Response:</strong> JSON object containing video/photo URLs, metadata, author info, statistics, and developer credit.
            </p>
        </div>
    </div>

    <div class="footer">
        Create by <a href="https://instagram.com/al_azet" target="_blank">AL AZET</a>
    </div>

    <script>
        let currentAudio = null;
        let isPlaying = false;
        let currentAudioUrl = null;

        // Auto-enable fullscreen on load (if supported)
        document.addEventListener('DOMContentLoaded', function() {
            // Try to enter fullscreen automatically
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {
                    // Fullscreen failed, that's okay
                });
            }
        });

        // Fullscreen toggle function
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Error attempting to enable fullscreen:', err.message);
                });
            } else {
                document.exitFullscreen();
            }
        }

        // Input validation
        const urlInput = document.getElementById('urlInput');
        const downloadBtn = document.getElementById('downloadBtn');

        urlInput.addEventListener('input', function() {
            if (this.value.trim()) {
                downloadBtn.disabled = false;
            } else {
                downloadBtn.disabled = true;
            }
        });

        // Enter key support
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !downloadBtn.disabled) {
                downloadTikTok();
            }
        });

        function toggleAudio(audioUrl, button) {
            if (currentAudio && currentAudioUrl === audioUrl) {
                if (isPlaying) {
                    currentAudio.pause();
                    button.innerHTML = '▶';
                    isPlaying = false;
                } else {
                    currentAudio.play();
                    button.innerHTML = '⏸';
                    isPlaying = true;
                }
            } else {
                if (currentAudio) {
                    currentAudio.pause();
                    // Reset previous button
                    const prevButtons = document.querySelectorAll('.play-btn');
                    prevButtons.forEach(btn => btn.innerHTML = '▶');
                }
                
                currentAudio = new Audio(audioUrl);
                currentAudioUrl = audioUrl;
                
                currentAudio.addEventListener('ended', function() {
                    button.innerHTML = '▶';
                    isPlaying = false;
                });
                
                currentAudio.addEventListener('error', function() {
                    button.innerHTML = '▶';
                    isPlaying = false;
                    alert('Error playing audio');
                });
                
                currentAudio.play();
                button.innerHTML = '⏸';
                isPlaying = true;
            }
        }

        function downloadFile(url, filename) {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'download';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        async function downloadTikTok() {
            const url = urlInput.value.trim();
            if (!url) {
                alert('Please enter a TikTok URL');
                return;
            }

            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('results').style.display = 'none';
            downloadBtn.disabled = true;

            try {
                const response = await fetch('/api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: url })
                });

                const data = await response.json();

                if (data.status) {
                    displayResults(data);
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                alert('Network error: ' + error.message);
            } finally {
                // Hide loading
                document.getElementById('loading').style.display = 'none';
                downloadBtn.disabled = false;
            }
        }

        function displayResults(data) {
            const resultsDiv = document.getElementById('results');
            let html = '';

            // Post info with enhanced styling
            html += ` < div
class=\"result-info">
                    <div class=\"post-title\">${data.title || 'TikTok Video'}</div>
                    <div class=\"post-meta\">${data.created_at || 'Recently posted'} • ${data.duration || '0'} Seconds</div>
                    
                    <div class=\"author-section\">
                        <img src=\"${data.author?.avatar || '/diverse-user-avatars.png'}" alt="Author\" class="author-avatar\" onerror="this.src=\'/diverse-user-avatars.png'">\
                        <div class="author-info">\
                            <div class="author-name\">${data.author?.nickname || data.author?.unique_id || 'Unknown Author'}</div>
                            <div class=\"author-username\">@${data.author?.unique_id || 'unknown'}</div>
                        </div>\
                    </div>\
                    
                    <div class=\"result-stats\">\
                        <div class="stat-item">\
                            <div class=\"stat-icon views\">👁</div>
                            <div class=\"stat-content">\
                                <div class=\"stat-label\">Views</div>
                                <div class=\"stat-value\">${formatNumber(data.statistics?.play_count || 0)}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon likes">❤</div>
                            <div class="stat-content">
                                <div class="stat-label">Likes</div>
                                <div class="stat-value">${formatNumber(data.statistics?.digg_count || 0)}
</div>
</div>
                        </div>
                        <div
class="stat-item">
                            <div class="stat-icon comments">💬</div>
                            <div class="stat-content">
                                <div class="stat-label">Comments</div>
                                <div class="stat-value">${formatNumber(data.statistics?.comment_count || 0)}
</div>
</div>
                        </div>
                        <div
class="stat-item">
                            <div class="stat-icon shares">📤</div>
                            <div class="stat-content">
                                <div class="stat-label">Shares</div>
                                <div class="stat-value">${formatNumber(data.statistics?.share_count || 0)}
</div>
</div>
                        </div>
                    </div>
                </div>
            `

// Audio section with enhanced player
if (data.music && data.music.play_url) {
  html += `
                    <div class="audio-section">
                        <div class="audio-player-card">
                            <div class="music-icon">🎵</div>
                            <div class="audio-info">
                                <div class="audio-title-text">${data.music.title || "Audio Track"}</div>
                                <div class="audio-author-text">${data.music.author || "Unknown Artist"}</div>
                            </div>
                            <div class="audio-controls">
                                <button class="play-btn" onclick="toggleAudio('${data.music.play_url}', this)">▶</button>
                                <button class="download-audio-btn" onclick="downloadFile('${data.music.play_url}', 'audio.mp3')">⬇</button>
                            </div>
                        </div>
                    </div>
                `
}

// Photos section
if (data.images && data.images.length > 0) {
  html += `
                    <div class="photo-section">
                        <div class="photo-header">
                            <div class="photo-icon">📷</div>
                            <div class="photo-title">Photos (${data.images.length})</div>
                        </div>
                        <div class="photo-grid">
                `

  data.images.forEach((img, index) => {
    html += `
                        <div class="photo-item">
                            <img src="${img}" alt="Photo ${index + 1}" loading="lazy">
                            <button class="photo-download" onclick="downloadFile('${img}', 'photo_${index + 1}.jpg')">⬇</button>
                        </div>
                    `
  })

  html += `
                        </div>
                    </div>
                `
}

// Videos section
if (data.video && data.video.length > 0) {
  html += `
                    <div class="video-section">
                        <div class="video-header">
                            <div class="video-icon">🎬</div>
                            <div class="video-title">Videos</div>
                        </div>
                        <div class="video-grid">
                `

  data.video.forEach((vid, index) => {
    html += `
                        <div class="video-item">
                            <div class="video-info">
                                <div class="video-quality">${vid.quality || "HD"} Quality</div>
                                <div class="video-size">${vid.size || "Unknown size"}</div>
                            </div>
                            <button class="video-download" onclick="downloadFile('${vid.url}', 'video_${vid.quality || index}.mp4')">
                                Download ${vid.quality || "Video"}
                            </button>
                        </div>
                    `
  })

  html += `
                        </div>
                    </div>
                `
}

resultsDiv.innerHTML = html
resultsDiv.style.display = "block"
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
</script>
</body>
</html>
`

// Main handler function
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // API endpoint for POST requests
      if (path === "/api" && method === "POST") {
        const body = await request.json()
        const tiktokUrl = body.url

        if (!tiktokUrl) {
          return new Response(
            JSON.stringify({
              status: false,
              developer: "@Al_Azet", // Added developer credit to error response
              message: "URL parameter is required",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          )
        }

        const result = await tiktokDl(tiktokUrl)
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // API endpoint for GET requests with URL parameter
      if (method === "GET" && url.searchParams.has("url")) {
        const tiktokUrl = url.searchParams.get("url")

        if (!tiktokUrl) {
          return new Response(
            JSON.stringify({
              status: false,
              developer: "@Al_Azet", // Added developer credit to error response
              message: "URL parameter is required",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          )
        }

        const result = await tiktokDl(tiktokUrl)
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Serve the web interface for all other requests
      return new Response(HTML_TEMPLATE, {
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: false,
          developer: "@Al_Azet", // Added developer credit to error response
          message: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }
  },
}
