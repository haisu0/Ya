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
const HTML_TEMPLATE = `
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

        /* Main container - improved sizing for all devices */
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
            font-size: 3.5rem;
            font-weight: bold;
            background: linear-gradient(45deg, #ff0040, #00eaff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            text-shadow: 0 0 30px rgba(255, 0, 64, 0.5);
        }

        .subtitle {
            font-size: 1.3rem;
            color: #cccccc;
            opacity: 0.8;
        }

        /* Input section */
        .input-section {
            width: 100%;
            max-width: 700px;
            margin-bottom: 40px;
        }

        .input-container {
            position: relative;
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }

        .url-input {
            flex: 1;
            padding: 20px 30px;
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(255, 0, 64, 0.3);
            border-radius: 15px;
            color: #ffffff;
            font-size: 18px;
            outline: none;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .url-input:focus {
            border-color: #ff0040;
            box-shadow: 0 0 20px rgba(255, 0, 64, 0.3);
        }

        .url-input::placeholder {
            color: #888888;
        }

        .download-btn {
            padding: 20px 40px;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border: none;
            border-radius: 15px;
            color: #ffffff;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0.5;
            pointer-events: none;
        }

        .download-btn.active {
            opacity: 1;
            pointer-events: auto;
        }

        .download-btn.active:hover {
            background: linear-gradient(45deg, #ff4070, #ff0040);
            box-shadow: 0 0 25px rgba(255, 0, 64, 0.5);
            transform: translateY(-2px);
        }

        .download-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Loading spinner */
        .loading {
            display: none;
            text-align: center;
            margin: 30px 0;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 0, 64, 0.3);
            border-top: 4px solid #ff0040;
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

        .result-info {
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(0, 234, 255, 0.3);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 40px;
            backdrop-filter: blur(10px);
        }

        .result-title {
            font-size: 1.6rem;
            font-weight: bold;
            color: #00eaff;
            margin-bottom: 20px;
            line-height: 1.4;
        }

        .result-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .stat-item {
            text-align: center;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
        }

        .stat-value {
            font-size: 1.4rem;
            font-weight: bold;
            color: #ff0040;
        }

        .stat-label {
            font-size: 1rem;
            color: #cccccc;
            margin-top: 8px;
        }

        /* Custom audio player with play/stop button */
        .audio-section {
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(255, 0, 64, 0.3);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 40px;
            backdrop-filter: blur(10px);
        }

        .audio-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #ff0040;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .audio-controls {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .custom-audio-player {
            display: flex;
            align-items: center;
            gap: 15px;
            flex: 1;
            min-width: 300px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            padding: 15px;
        }

        .play-stop-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 18px;
        }

        .play-stop-btn:hover {
            background: linear-gradient(45deg, #ff4070, #ff0040);
            box-shadow: 0 0 15px rgba(255, 0, 64, 0.5);
            transform: scale(1.05);
        }

        .audio-info {
            flex: 1;
            color: #cccccc;
        }

        .audio-title-text {
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 5px;
        }

        .audio-author-text {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .audio-time {
            font-size: 0.9rem;
            color: #ff0040;
            font-weight: bold;
        }

        /* Fixed photo grid for exact 2-column layout */
        .photo-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 40px;
        }

        .photo-item {
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(0, 234, 255, 0.3);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .photo-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 234, 255, 0.2);
        }

        .photo-item img {
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin-bottom: 20px;
            object-fit: cover;
            aspect-ratio: 9/16;
            max-height: 400px;
        }

        /* Improved video grid layout for better desktop sizing */
        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .video-item {
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(0, 234, 255, 0.3);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .video-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 234, 255, 0.2);
        }

        .video-item video {
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin-bottom: 20px;
            background: #000;
            max-height: 500px;
        }

        .video-quality-label {
            margin-bottom: 20px;
            color: #00eaff;
            font-weight: bold;
            font-size: 1.2rem;
        }

        /* Enhanced download buttons */
        .download-media-btn {
            padding: 15px 30px;
            background: linear-gradient(45deg, #00eaff, #0099cc);
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            width: 100%;
            max-width: 250px;
        }

        .download-media-btn:hover {
            background: linear-gradient(45deg, #0099cc, #00eaff);
            box-shadow: 0 0 25px rgba(0, 234, 255, 0.4);
            transform: translateY(-2px);
        }

        .download-audio-btn {
            padding: 15px 30px;
            background: linear-gradient(45deg, #ff0040, #ff4070);
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            min-width: 180px;
        }

        .download-audio-btn:hover {
            background: linear-gradient(45deg, #ff4070, #ff0040);
            box-shadow: 0 0 25px rgba(255, 0, 64, 0.4);
            transform: translateY(-2px);
        }

        /* API Documentation */
        .api-docs {
            width: 100%;
            max-width: 1200px;
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(255, 0, 64, 0.3);
            border-radius: 15px;
            padding: 30px;
            margin-top: 40px;
            backdrop-filter: blur(10px);
        }

        .api-title {
            font-size: 1.6rem;
            font-weight: bold;
            color: #ff0040;
            margin-bottom: 25px;
        }

        .api-example {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 15px;
            color: #00eaff;
            overflow-x: auto;
            line-height: 1.5;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 15px;
            right: 15px;
            font-size: 16px;
            color: white;
            background: rgba(0, 0, 0, 0.6);
            padding: 10px 18px;
            border-radius: 12px;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }

        .footer a {
            color: #ff0040;
            text-decoration: none;
            font-weight: bold;
        }

        .footer a:hover {
            color: #00eaff;
        }

        /* Enhanced responsive design for better device compatibility */
        @media (min-width: 1400px) {
            .container {
                padding: 60px 40px 40px;
            }
            
            .title {
                font-size: 4rem;
            }
            
            .photo-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .video-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 1200px) {
            .video-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .container {
                padding: 30px 20px 20px;
            }
        }

        @media (max-width: 768px) {
            .title {
                font-size: 2.5rem;
            }
            
            .subtitle {
                font-size: 1.1rem;
            }
            
            .input-container {
                flex-direction: column;
                gap: 15px;
            }
            
            .url-input, .download-btn {
                padding: 18px 25px;
                font-size: 16px;
            }
            
            .video-grid {
                grid-template-columns: 1fr;
                gap: 25px;
            }
            
            .photo-grid {
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .result-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .audio-controls {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }

            .custom-audio-player {
                min-width: 100%;
            }
            
            .download-audio-btn {
                min-width: 100%;
            }
        }

        @media (max-width: 480px) {
            .container {
                padding: 20px 15px 15px;
            }
            
            .title {
                font-size: 2rem;
            }
            
            .subtitle {
                font-size: 1rem;
            }
            
            .photo-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .result-stats {
                grid-template-columns: 1fr;
            }

            .fullscreen-btn {
                top: 15px;
                right: 15px;
                width: 45px;
                height: 45px;
            }
            
            .result-info, .audio-section, .api-docs {
                padding: 20px;
            }
        }

        /* Additional responsive breakpoints for tablets and landscape modes */
        @media (min-width: 768px) and (max-width: 1024px) {
            .photo-grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .video-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (orientation: landscape) and (max-height: 600px) {
            .title {
                font-size: 1.8rem;
            }
            
            .header {
                margin-bottom: 25px;
            }
            
            .container {
                padding: 15px 20px;
            }
        }

        /* Desktop mode improvements for better sizing */
        @media (min-width: 1024px) {
            .container {
                max-width: 1400px;
                padding: 50px 30px 30px;
            }
            
            .input-section {
                max-width: 800px;
            }
            
            .results {
                max-width: 1300px;
            }
            
            .video-grid {
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
            <p style="margin-bottom: 15px; color: #cccccc;">You can also use this service as an API by adding parameters to the URL:</p>
            
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
                downloadBtn.classList.add('active');
            } else {
                downloadBtn.classList.remove('active');
            }
        });

        // Enter key support
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                downloadTikTok();
            }
        });

        function toggleAudio(audioUrl, playBtn) {
            if (currentAudio && currentAudioUrl === audioUrl) {
                if (isPlaying) {
                    currentAudio.pause();
                    playBtn.innerHTML = '▶️';
                    isPlaying = false;
                } else {
                    currentAudio.play();
                    playBtn.innerHTML = '⏸️';
                    isPlaying = true;
                }
            } else {
                if (currentAudio) {
                    currentAudio.pause();
                    // Reset previous button
                    const prevBtn = document.querySelector('.play-stop-btn[data-playing="true"]');
                    if (prevBtn) {
                        prevBtn.innerHTML = '▶️';
                        prevBtn.setAttribute('data-playing', 'false');
                    }
                }
                
                currentAudio = new Audio(audioUrl);
                currentAudioUrl = audioUrl;
                
                currentAudio.addEventListener('ended', () => {
                    playBtn.innerHTML = '▶️';
                    playBtn.setAttribute('data-playing', 'false');
                    isPlaying = false;
                });
                
                currentAudio.addEventListener('error', () => {
                    alert('Error playing audio. Please try downloading instead.');
                    playBtn.innerHTML = '▶️';
                    playBtn.setAttribute('data-playing', 'false');
                    isPlaying = false;
                });
                
                currentAudio.play();
                playBtn.innerHTML = '⏸️';
                playBtn.setAttribute('data-playing', 'true');
                isPlaying = true;
            }
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
        }

        async function downloadTikTok() {
            const url = urlInput.value.trim();
            if (!url) return;

            // Hide keyboard on mobile devices
            urlInput.blur();
            document.activeElement.blur();

            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            
            loading.style.display = 'block';
            results.style.display = 'none';

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
                    throw new Error(data.message || 'Failed to download');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                loading.style.display = 'none';
            }
        }

        function downloadFile(url, filename) {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.blob();
                })
                .then(blob => {
                    const link = document.createElement('a');
                    const objectUrl = URL.createObjectURL(blob);
                    link.href = objectUrl;
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(objectUrl);
                })
                .catch(error => {
                    console.error('Download failed:', error);
                    // Fallback to direct link
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
        }

        function displayResults(data) {
            const results = document.getElementById('results');
            
            let html = \`
                <div class="result-info">
                    <div class="result-title">\${data.title}</div>
                    <div class="result-stats">
                        <div class="stat-item">
                            <div class="stat-value">\${data.stats.views}</div>
                            <div class="stat-label">Views</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${data.stats.likes}</div>
                            <div class="stat-label">Likes</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${data.stats.comment}</div>
                            <div class="stat-label">Comments</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${data.stats.share}</div>
                            <div class="stat-label">Shares</div>
                        </div>
                    </div>
                    <p><strong>Author:</strong> \${data.author.nickname} (@\${data.author.fullname})</p>
                    <p><strong>Duration:</strong> \${data.duration || 'N/A'}</p>
                    <p><strong>Date:</strong> \${data.taken_at}</p>
                    <p><strong>Developer:</strong> \${data.developer}</p>
                </div>
            \`;

            if (data.music_info && data.music_info.url) {
                const audioTitle = data.music_info.title || 'TikTok Audio';
                const audioAuthor = data.music_info.author || 'Unknown Artist';
                const audioFilename = \`tiktok-audio-\${audioTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp3\`;
                
                html += \`
                    <div class="audio-section">
                        <div class="audio-title">
                            🎵 Audio: \${audioTitle} - \${audioAuthor}
                        </div>
                        <div class="audio-controls">
                            <div class="custom-audio-player">
                                <button class="play-stop-btn" onclick="toggleAudio('\${data.music_info.url}', this)" data-playing="false">
                                    ▶️
                                </button>
                                <div class="audio-info">
                                    <div class="audio-title-text">\${audioTitle}</div>
                                    <div class="audio-author-text">by \${audioAuthor}</div>
                                    <div class="audio-time">Click play to listen</div>
                                </div>
                            </div>
                            <button class="download-audio-btn" onclick="downloadFile('\${data.music_info.url}', '\${audioFilename}')">Download Audio</button>
                        </div>
                    </div>
                \`;
            }

            // Check if it's photos or videos
            const hasPhotos = data.data.some(item => item.type === 'photo');
            
            if (hasPhotos) {
                html += '<div class="photo-grid">';
                data.data.forEach((item, index) => {
                    if (item.type === 'photo') {
                        const photoFilename = \`tiktok-photo-\${index + 1}.jpg\`;
                        html += \`
                            <div class="photo-item">
                                <img src="\${item.url}" alt="TikTok Photo \${index + 1}" loading="lazy">
                                <button class="download-media-btn" onclick="downloadFile('\${item.url}', '\${photoFilename}')">Download Photo</button>
                            </div>
                        \`;
                    }
                });
                html += '</div>';
            } else {
                html += '<div class="video-grid">';
                data.data.forEach((item, index) => {
                    let qualityLabel = '';
                    let filename = '';
                    if (item.type === 'watermark') {
                        qualityLabel = 'With Watermark';
                        filename = 'tiktok-video-watermark.mp4';
                    } else if (item.type === 'nowatermark') {
                        qualityLabel = 'No Watermark';
                        filename = 'tiktok-video-no-watermark.mp4';
                    } else if (item.type === 'nowatermark_hd') {
                        qualityLabel = 'HD No Watermark';
                        filename = 'tiktok-video-hd.mp4';
                    }

                    html += \`
                        <div class="video-item">
                            <div class="video-quality-label">\${qualityLabel}</div>
                            <video controls preload="metadata" poster="\${data.cover}" onplay="this.removeAttribute('poster')" controlsList="nodownload">
                                <source src="\${item.url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            <button class="download-media-btn" onclick="downloadFile('\${item.url}', '\${filename}')">Download Video</button>
                        </div>
                    \`;
                });
                html += '</div>';
            }

            results.innerHTML = html;
            results.style.display = 'block';
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
