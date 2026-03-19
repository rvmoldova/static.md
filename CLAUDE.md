# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static.md is a free, open-source image hosting service, rewritten as a Vue 3 SPA + Firebase backend. This subdirectory (`static.md/`) replaces the old `static-back` (Express/MongoDB) and `static-land` (Pug/Gulp) projects with a unified Vite + Firebase Functions architecture. There is no public API — the API is internal, used only by the frontend and Chrome extension.

## Build & Development Commands

### Frontend (Vue 3 + Vite)

```bash
npm install
npm run dev              # Vite dev server on port 3000
npm run build:frontend   # Vite build → hosting/
npm run preview          # Preview production build
```

### Cloud Functions

```bash
cd functions
npm install
npm run build            # TypeScript → dist/
npm run build:watch      # TypeScript watch mode
npm run serve            # Build + firebase emulators:start --only functions
```

### Full Deploy

```bash
npm run deploy              # Build frontend + functions, then firebase deploy
npm run deploy:functions    # Functions only
npm run deploy:hosting      # Hosting only
```

## Architecture

### Frontend (`src/`)

Vue 3 SPA with Composition API (`<script setup lang="ts">`), vue-router 4, and SCSS styling. Vite builds to `hosting/` (which Firebase Hosting serves).

**State management:** No Vuex/Pinia — state is managed via composables (`src/composables/`) and `provide`/`inject` at the App level. `useUpload` and `useToast` are provided globally from `App.vue`.

**API layer:** `src/api/index.ts` — all backend calls go through the V4 API (`/api/v4`). Uses XHR (not fetch) for upload to get progress events.

**Routing:** vue-router with lazy-loaded views. Gallery pages at `/g/:galleryId`. Catch-all redirects to `/404`.

**SCSS:** Token-based design system in `src/styles/` — `_tokens.scss` defines CSS custom properties, `_themes.scss` handles light/dark mode.

**Icons:** All icons use `lucide-vue-next`. No inline SVGs — import components from Lucide (e.g., `import { Copy, Check, X } from 'lucide-vue-next'`).

**Design principles:** See `.impeccable.md` for design principles and aesthetic direction.

### Cloud Functions (`functions/src/`)

Firebase Functions v2 (2nd gen) on Node 22, deployed to `europe-west1`. Express app handles API routes; a separate `imageHandler` function serves images.

**Key functions:**
- `api` — Express app handling `/api/v2/*` and `/api/v4/*` routes
- `imageHandler` — Catch-all for `/{hash}` URLs; streams images from Cloud Storage with on-the-fly Sharp resizing via `?size=N`. Responses are CDN-cached via `s-maxage`
- `analyzeImage` — Cloud Storage trigger (`onObjectFinalized`); runs Google Cloud Vision SafeSearch + label detection, writes tags to Firestore

**Upload flow (V4):** Client POSTs files + token to `/api/v4/upload` → server validates token (via `UPLOAD_TOKEN` secret) → computes MD5 → deduplicates by MD5 hash → stores in Cloud Storage (`uploads/{md5}.{ext}`) → creates Firestore docs (photo + links + gallery) → returns gallery link + image URLs with dimensions.

**Upload flow (V2):** Two-step token flow for extension compatibility — client sends MD5 to `/api/v2/get-token` → gets time-limited token → uploads single file with token to `/api/v2/upload`.

**Data model (Firestore collections):**
- `photos` — keyed by `{md5}.{ext}`, stores dimensions, format, upload metadata, tags
- `galleries` — photo lists with shareable 6-char links, deduplicated by `photoListKey`
- `links` — O(1) lookup table mapping short links → photo or gallery refs
- `v2tokens` — time-limited upload tokens (validFrom/expireAt)

**Content-addressable dedup:** Photos are identified by MD5 hash. Re-uploading the same image increments `uploadCount` and appends the IP instead of creating a duplicate.

### Firebase Config

- **Hosting:** Serves from `hosting/`, rewrites `/api/**` → `api` function, `/g/**` + static pages → SPA, everything else → `imageHandler` function
- **Storage rules:** `uploads/` is publicly readable, write is denied (only functions write)
- **Firestore rules:** All client access denied — only functions access Firestore via Admin SDK

### Multipart Parsing

Functions use a custom Busboy-based `parseForm` middleware (`functions/src/parseForm.ts`) instead of Multer for streaming multipart parsing in the Cloud Functions environment. It buffers files into memory as `ParsedFile` objects.
