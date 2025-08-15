# TikTok Downloader - Cloudflare Workers

A powerful TikTok downloader API built for Cloudflare Workers with a beautiful web interface and custom audio player.

## Features

- 🎵 **Custom Audio Player**: Simple play/stop button instead of complex HTML audio controls
- 📱 **Responsive Design**: Works perfectly on all devices
- 🚀 **Fast Performance**: Powered by Cloudflare Workers edge network
- 🎨 **Beautiful UI**: Modern gradient design with animations
- 📊 **Complete Metadata**: Get video stats, author info, and more
- 🔧 **API Support**: Both GET and POST endpoints
- 👨‍💻 **Developer Credit**: All responses include @Al_Azet attribution

## Quick Start

### Prerequisites

- Node.js 16+ installed
- Cloudflare account
- Wrangler CLI installed globally: `npm install -g wrangler`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd tiktok-downloader-workers
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Login to Cloudflare**
   \`\`\`bash
   wrangler login
   \`\`\`

4. **Deploy to Cloudflare Workers**
   \`\`\`bash
   npm run deploy
   \`\`\`

### Development

Run locally for development:
\`\`\`bash
npm run dev
\`\`\`

This will start a local development server at `http://localhost:8787`

## API Usage

### POST Request
\`\`\`bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tiktok.com/@username/video/1234567890"}'
\`\`\`

### GET Request
\`\`\`bash
curl "https://your-worker.your-subdomain.workers.dev/?url=https://www.tiktok.com/@username/video/1234567890"
\`\`\`

### Response Format
\`\`\`json
{
  "status": true,
  "developer": "@Al_Azet",
  "title": "Video Title",
  "taken_at": "Date",
  "region": "US",
  "id": "video_id",
  "duration": "15 Seconds",
  "cover": "cover_image_url",
  "data": [
    {
      "type": "nowatermark",
      "url": "video_download_url"
    }
  ],
  "music_info": {
    "title": "Audio Title",
    "author": "Artist Name",
    "url": "audio_download_url"
  },
  "stats": {
    "views": "1.2M",
    "likes": "50K",
    "comment": "1.5K",
    "share": "800"
  },
  "author": {
    "nickname": "Display Name",
    "fullname": "username",
    "avatar": "avatar_url"
  }
}
\`\`\`

## Configuration

### Environment Variables

You can set environment variables in `wrangler.toml`:

\`\`\`toml
[env.production.vars]
ENVIRONMENT = "production"
API_KEY = "your-api-key"
\`\`\`

### Custom Domain

To use a custom domain, add routes to `wrangler.toml`:

\`\`\`toml
[[env.production.routes]]
pattern = "tiktok-dl.yourdomain.com/*"
zone_name = "yourdomain.com"
\`\`\`

## Deployment Environments

- **Development**: `npm run dev`
- **Staging**: `npm run deploy:staging`
- **Production**: `npm run deploy:production`

## Features Breakdown

### Custom Audio Player
- Simple play/stop button interface
- No complex HTML audio controls
- Better mobile experience
- Visual feedback for playing state

### Web Interface
- Fullscreen support
- Responsive design for all devices
- Beautiful gradient animations
- Real-time input validation
- Download progress feedback

### API Features
- CORS enabled for cross-origin requests
- Support for both GET and POST methods
- Comprehensive error handling
- Developer attribution in all responses

## Troubleshooting

### Common Issues

1. **Deployment fails**: Make sure you're logged in with `wrangler login`
2. **API not working**: Check the URL format and ensure it's a valid TikTok URL
3. **Audio not playing**: Some browsers require user interaction before playing audio

### Logs

View real-time logs:
\`\`\`bash
npm run tail
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Created by [@Al_Azet](https://instagram.com/al_azet)

## Support

For issues and support, please open an issue on the GitHub repository.
