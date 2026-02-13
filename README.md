# Galleria Studio V2

AI-powered artwork mockup generator for artists.

## Features

- ✅ Upload artwork (PNG, JPG, WebP, TIFF — up to 50MB)
- ✅ 14 frame styles with custom mats
- ✅ 20+ curated environments across 10 categories
- ✅ AI artwork analysis — automatically selects optimal environment
- ✅ GPT-4o vision for color/style/mood detection
- ✅ DALL-E 3 for photorealistic environment generation
- ✅ Sharp compositing for final mockup
- ✅ Gallery grid with localStorage persistence

## Architecture

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Express + TypeScript |
| AI | OpenAI GPT-4o + DALL-E 3 |
| Database | PostgreSQL + Prisma |
| Storage | AWS S3 |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Docker recommended)
- OpenAI API key

### Backend Setup

```bash
cd server
cp .env.example .env  # Fill in your keys
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

The app runs at `http://localhost:3000` with API at `http://localhost:4000`.

## Environment Variables

**server/.env**
```
PORT=4000
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-key
DATABASE_URL=postgresql://user:pass@localhost:5432/galleria
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=galleria-studio
AWS_REGION=us-east-1
```

**client/.env**
```
REACT_APP_API_URL=http://localhost:4000
```

## License

MIT