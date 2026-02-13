# Galleria Studio V2 — Complete Build Guide

## Overview

Galleria Studio is a premium artwork mockup app that lets artists upload their work, specify dimensions, choose or AI-generate frames and environments, and produce photorealistic mockups. Built with React + Node.js, it uses AI for intelligent environment matching and prompt generation.

## Architecture

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| AI | OpenAI API (GPT-4o for prompt generation, DALL-E 3 for environment generation) |
| Storage | AWS S3 (artwork uploads + generated mockups) |
| Database | PostgreSQL via Prisma ORM |
| Auth | Clerk or NextAuth |
| Deployment | Vercel (frontend) + Render (backend) |

## Phase 1 — Project Scaffolding & Core UI Shell

### 1.1 Initialize the monorepo

```bash
mkdir galleria-studio && cd galleria-studio
npm init -y

# Frontend
npx create-react-app client --template typescript
cd client
npm install tailwindcss @headlessui/react framer-motion react-dropzone react-router-dom zustand axios lucide-react react-hot-toast @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-select
npx tailwindcss init -p

# Backend
cd ..
mkdir server && cd server
npm init -y
npm install express cors dotenv multer sharp aws-sdk openai prisma @prisma/client uuid
npm install -D typescript ts-node @types/express @types/cors @types/multer @types/uuid nodemon
npx tsc --init
npx prisma init
```

### 1.2 Tailwind config (client/tailwind.config.js)

Dark gallery theme with gold accents. Custom animations: fade-in, slide-up, float.

### 1.3 Global styles (client/src/index.css)

Glass panel components, gold glow effects, primary/ghost buttons.

## Phase 2 — Artwork Upload & Dimension System

### 2.1 Zustand store

State management for: artwork, dimensions, frame, mat, environment selection, AI mode, generation progress.

### 2.2 Upload component features
- Drag and drop with react-dropzone
- File types: PNG, JPG, JPEG, WebP, TIFF
- Max file size: 50MB
- Preview with delete button
- Animation with Framer Motion

### 2.3 Dimensions panel
- Width/Height sliders (in or cm)
- 11 quick presets (8×10" through 40×60", plus squares)
- Swap orientation button
- Visual aspect ratio preview

## Phase 3 — Frame & Mat System

### 3.1 Frame selector features
- 14 frame styles with live preview
- Frame types: No Frame, Thin (black/white), Classic (gold/silver), Ornate (gold/dark), Natural (oak/walnut/maple), Floating (white/black), Shadow Box, Canvas Wrap
- Mat options: None, White, Cream, Black, Grey
- Mat width slider (1-5 inches)
- Real-time visual preview on uploaded artwork

## Phase 4 — Template Gallery & AI Environment Selection

### 4.1 Templates (20+ environments)

Categories:
- Living Rooms: Scandinavian, Modern Dark, Bohemian, Japandi, Mid-Century
- Galleries: White Cube, Industrial, Contemporary
- Offices: Executive, Creative Studio
- Cafés & Restaurants: Parisian Café, Fine Dining
- Hotels: Boutique Lobby, Luxury Suite
- Bedrooms: Minimal
- Retail: Boutique Store
- Hallways: Grand Mansion
- Outdoor: Mediterranean Terrace

### 4.2 Template gallery features
- Category filter pills
- Grid view with hover previews
- AI Select mode for GPT-4o analysis
- Template selection with visual indicator
- Prompt preview on hover

## Phase 5 — Backend: AI Prompt Generation & Mockup Compositing

### 5.1 Prisma schema

Model: Mockup with fields for artwork, dimensions, frame, environment, AI flags, timestamps.

### 5.2 API Endpoints

**POST /api/ai/analyze-artwork**
- GPT-4o vision analysis for: dominant colors, color temperature, style, mood, contrast
- Returns: analysis JSON + generationPrompt + alternativePrompts

**POST /api/ai/generate-environment**
- DALL-E 3 with HD quality, natural style
- Determined orientation based on artwork aspect ratio
- Returns: imageUrl + revisedPrompt

**POST /api/generate/composite**
- Sharp-based compositing with frame/mat overlays
- Position calculation based on percentage and scale
- Outputs high-quality JPEG

## Phase 6 — Studio Page (Orchestration)

Four-step wizard: Upload → Size & Frame → Environment → Generate

Features:
- Step navigation with progress indicators
- Validation (can't advance without completing step)
- Real-time preview panel
- Progress bar during generation (15%/35%/50%/75%/100%)
- Download + Regenerate buttons for results

## Phase 7 — Landing Page

- Premium dark aesthetic with gold accents
- Hero section with gradient text
- 6 feature cards
- Animated entrance with Framer Motion
- Navigate to Studio CTA

## Phase 8 — Gallery / Saved Mockups Page

- Grid or list view toggle
- Saved mockups in localStorage
- Hover overlay with download/delete
- Dimensions and frame info on each card
- Creation date

## Phase 9 — Environment Variables & Deployment

### Server .env
PORT, CLIENT_URL, OPENAI_API_KEY, DATABASE_URL, AWS credentials

### Client .env
REACT_APP_API_URL

## Phase 10 — Optional Enhancements

- Stable Diffusion XL (Replicate alternative)
- Perspective transform for angled walls
- Batch generation (multiple environments)

## Complete Library Summary

| Layer | Library | Purpose |
|-------|---------|---------|
| Frontend | React 18 + TypeScript | UI |
| Styling | Tailwind CSS + Framer Motion | Design + animation |
| State | Zustand | State management |
| UI primitives | Radix UI | Accessible components |
| File upload | react-dropzone | Drag-and-drop |
| Notifications | react-hot-toast | Toast feedback |
| HTTP | axios | API requests |
| Backend | Express + TypeScript | REST API |
| Image processing | Sharp | Compositing |
| AI text | OpenAI GPT-4o | Analysis, prompts |
| AI image | OpenAI DALL-E 3 | Environment generation |
| Database | PostgreSQL + Prisma | Persistence |
| Storage | AWS S3 | File storage |
| Upload handling | Multer | Multipart uploads |

## Build & Run

```bash
# Terminal 1 — Database
docker run -d --name galleria-db -p 5432:5432 -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=galleria postgres:16

# Terminal 2 — Server
cd server
cp .env.example .env  # fill in your keys
npm install
npx prisma generate
npx prisma db push
npm run dev

# Terminal 3 — Client
cd client
npm install
npm start
```

App at `http://localhost:3000`, API at `http://localhost:4000`.

---

## Future Improvements

- [ ] S3 uploads (currently local files)
- [ ] User authentication
- [ ] Database persistence for mockups
- [ ] Batch generation
- [ ] Perspective warping
- [ ] Custom prompt editing
- [ ] Mockup sharing
- [ ] Print-ready export (300 DPI)

---

*Saved: 2026-02-13*