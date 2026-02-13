# Galleria Studio V2 — AI Frame & Environment Generation + Save System

## Overview
Extension to Galleria Studio V2 adding AI-generated custom frames and environments with persistent save system.

## New Dependencies

**Server:**
```bash
cd server
npm install crypto slugify
```

## 1. Database Schema Updates

New models added to Prisma schema:

### SavedFrame
- `id` (UUID primary key)
- `userId` (String, indexed)
- `name`, `slug` (String)
- `prompt`, `style`, `imageUrl`, `thumbnailUrl`
- `borderWidth` (Int), `cornerStyle` (String)
- `material`, `colorPrimary`, `colorSecondary`
- `isPublic` (Boolean, indexed), `usageCount` (Int), `tags` (String[])
- `createdAt`, `updatedAt`

### SavedEnvironment  
- `id` (UUID primary key)
- `userId` (String, indexed)
- `name`, `slug`, `prompt`
- `category`, `imageUrl`, `thumbnailUrl` (String)
- `wallColor`, `lighting`, `roomType`, `mood`
- `isPublic` (Boolean), `usageCount` (Int), `tags` (String[])
- `createdAt`, `updatedAt`

### UserCollection
- `id` (UUID primary key)  
- `userId`, `name`, `type` (frames|environments)
- `itemIds` (String[])

## 2. AI Frame Generation (server/src/routes/ai-frames.ts)

**POST /api/ai/frames/generate**
- GPT-4o refines prompt and extracts metadata (name, material, colors, cornerStyle, tags)
- DALL-E 3 generates frame image (head-on, transparent center, white background)
- Sharp processes and saves image + thumbnail
- Auto-saves to database

**POST /api/ai/frames/generate-variations**  
- Generates 3 distinct frame variations in parallel
- Returns preview URLs for user selection

**GET /api/ai/frames/saved/:userId**
- List user's saved frames with pagination and search

**GET /api/ai/frames/community**
- Browse public frames with popularity sorting

**DELETE /api/ai/frames/saved/:frameId**
- Delete user's frame and associated files

**POST /api/ai/frames/saved/:frameId/use**
- Increment usage count when frame is used in mockup

## 3. AI Environment Generation (server/src/routes/ai-environments.ts)

**POST /api/ai/environments/generate**
- GPT-4o creates detailed environment description
- Considers artwork dimensions for orientation (1024×1024, 1792×1024, 1024×1792)
- Artwork metadata integration (style, mood, colors for better matching)
- DALL-E 3 generates photorealistic interior with blank wall
- Auto-saves with category, wallColor, lighting metadata

**POST /api/ai/environments/generate-variations**
- 3 distinct environment variations

**GET /api/ai/environments/saved/:userId**
- List with category filter and search

**GET /api/ai/environments/community**
- Public environments by category

## 4. Frontend Store Updates (client/src/store/useStudioStore.ts)

### New Types
- `AiGeneratedFrame`: id, name, prompt, imageUrl, borderWidth, cornerStyle, material, colors, tags
- `AiGeneratedEnvironment`: id, name, prompt, imageUrl, category, wallColor, lighting, mood, tags
- `FrameMode`: 'preset' | 'ai-generate' | 'saved'
- `EnvironmentMode`: 'preset' | 'ai-auto' | 'ai-prompt' | 'saved'

### New State
- `frameMode`, `aiFramePrompt`, `aiGeneratedFrame`, `aiFrameVariations`, `savedFrames`, `isGeneratingFrame`
- `environmentMode`, `aiEnvironmentPrompt`, `aiGeneratedEnvironment`, `aiEnvironmentVariations`, `savedEnvironments`, `isGeneratingEnvironment`

## 5. UI Components

### AiFrameGenerator
- Generate vs Saved tabs
- Textarea prompt input with 12 curated suggestions
- Generate button + "×3" variations button
- Live preview of generated frame with metadata (material, colors, tags)
- Grid of saved frames with search and delete

### AiEnvironmentGenerator  
- Generate vs Saved tabs
- Textarea with 12 environment suggestions
- Category filter buttons (All, Living, Gallery, Office, Café, etc.)
- Live preview with wallColor, lighting, mood display
- Variation grid with save-to-library button
- Saved environments grid with search/filter

### Integration Points

**FrameSelector.tsx**: Mode toggle between Presets and AI Create

**TemplateGallery.tsx**: 3-way toggle (Templates | AI Auto | AI Create)

**Studio.tsx**: Updated `handleGenerate()` to handle:
- AI-generated frames: pass `frameStyle: 'ai-generated'` + frame image URL
- AI-generated environments: use saved image directly (no re-generation)
- Track usage counts when AI assets are used

## Key Features

1. **AI Generation Flow**: Prompt → GPT-4o refinement → DALL-E generation → Sharp processing → Database save
2. **Auto-Save**: Every generation persisted immediately
3. **Variations**: Generate 3 options in parallel, pick favorite
4. **Prompt Suggestions**: 12 curated suggestions for each type
5. **Metadata Extraction**: Colors, materials, styles automatically tagged
6. **Usage Tracking**: Popular items bubble up in community views
7. **Community Sharing**: Toggle visibility to share creations

## Generation Flow Integration

When user clicks "Generate Mockup":

1. **Frame source**:
   - Preset: use existing `frameStyle` enum
   - AI: use `aiGeneratedFrame.imageUrl` + borderWidth metadata

2. **Environment source**:
   - AI Auto: analyze artwork → generate new environment
   - AI Generated: use `aiGeneratedEnvironment.imageUrl` directly  
   - Preset: use template prompt → generate environment

3. Track usage: POST to `/api/ai/(frames|environments)/saved/:id/use`

## Notes

- Frame images stored in `/public/frames/` (or S3 in production)
- Environment images stored in `/public/environments/`
- All generations auto-saved — no manual "save" step needed
- Usage count enables "popular first" community browsing
- Prompt suggestions seeded to help users get started

---

*Scope created: 2026-02-13*