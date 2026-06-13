# 🎙️ AI News Podcast Generator

An automated pipeline that scrapes trending AI/Tech news, summarizes it with GPT-4o, converts it to speech with ElevenLabs, and delivers a daily podcast episode with full transcript.

## ✨ Features

- 🔍 **Multi-source scraping** via Bright Data (TechCrunch, Wired, HN, ArXiv, and more)
- 🤖 **AI-powered ranking & summarization** with GPT-4o
- 🎙️ **Professional podcast script generation** (intro + segments + outro)
- 🔊 **Natural-sounding audio** via ElevenLabs Turbo v2
- 📄 **PDF & text transcript** auto-generated per episode
- 📧 **Email delivery** to subscribers with audio link + PDF
- 📰 **Weekly newsletter digest** every Sunday
- 📊 **React dashboard** with live generation progress, audio player, transcript viewer
- ⏰ **Daily cron scheduling** (7 AM IST by default)
- 🔁 **Retry logic + graceful fallbacks** for all APIs

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Bright Data account
- OpenAI API key
- ElevenLabs API key
- Gmail account with App Password

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/ai-news-podcast.git
cd ai-news-podcast
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your API keys in .env
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Open Dashboard
Visit `http://localhost:5173`

## 🔑 API Keys Setup

| Service | Where to get it |
|---------|----------------|
| Bright Data | https://brightdata.com → Create Web Unlocker zone |
| OpenAI | https://platform.openai.com/api-keys |
| ElevenLabs | https://elevenlabs.io → Profile → API Keys |
| Gmail App Password | Google Account → Security → 2FA → App Passwords |

## 🏗️ Architecture

```
Cron / Manual Trigger
        ↓
[Bright Data Scraper] → Raw Articles
        ↓
[GPT-4o Ranker] → Top 5-7 Stories
        ↓
[GPT-4o Script Generator] → Full Podcast Script
        ↓
[ElevenLabs TTS] → audio.mp3
        ↓
[PDF Generator] → transcript.pdf
        ↓
[SQLite Storage] + [File System]
        ↓
[Email Delivery] → Subscribers
        ↓
[React Dashboard] → Listen & Read
```

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/generate | Trigger episode generation |
| GET | /api/generate/stream | SSE progress stream |
| GET | /api/episodes | List all episodes |
| GET | /api/episodes/:id/audio | Stream audio |
| GET | /api/episodes/:id/pdf | Download transcript PDF |
| POST | /api/subscribers | Subscribe email |

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Scraping**: Bright Data Web Unlocker
- **AI**: OpenAI GPT-4o
- **TTS**: ElevenLabs Turbo v2
- **DB**: SQLite (better-sqlite3)
- **Scheduler**: node-cron
- **Email**: Nodemailer

## 📁 Episode Storage

Each generated episode creates:
```
episodes/
└── 2024-07-15/
    ├── audio.mp3
    ├── transcript.txt
    ├── transcript.pdf
    └── metadata.json
```

## 🧪 Testing

```bash
# Run a test generation (dry run, no TTS)
curl -X POST http://localhost:5000/api/generate?dryRun=true

# Check health
curl http://localhost:5000/api/health
```

## 🐳 Docker

```bash
docker-compose up --build
```

## 🌐 Deployment

1. Deploy backend to **Railway** or **Render**
2. Deploy frontend to **Vercel** or **Netlify**
3. Set all env vars in deployment platform dashboard
4. Enable cron on backend platform

## 📈 Resume Impact

- Demonstrates **multi-API orchestration** (4 external services)
- Shows **full-stack** skills (React + Node + REST API)
- Covers **automation & scheduling** (cron jobs)
- Includes **file I/O** (audio, PDF, SQLite)
- Real-world **error handling & resilience patterns**

## 📜 License

MIT
