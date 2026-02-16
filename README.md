# Static.md

Free image hosting service at [https://static.md](https://static.md).

Upload images, get shareable links. Supports on-the-fly resizing, galleries, and a Chrome extension for screenshot capture and annotation.

> This project started in 2013 as a personal image hosting tool. This is the code running since 2016, slightly adjusted to run on Firebase. It was originally built with Express, MongoDB, and Pug, and ran on a single DigitalOcean droplet for over a decade. In 2026 it was migrated to Firebase (Hosting + Cloud Functions + Firestore + Cloud Storage) and the source code was made public.

## Architecture

- **Firebase Hosting** — CDN + SSL + SPA rewrites
- **Cloud Functions** — Express API (`api`) + image serving (`imageHandler`)
- **Firestore** — photos, galleries, upload tokens, link lookups
- **Cloud Storage** — image file storage (`uploads/`)

### Image serving flow

```
GET https://static.md/{hash}.jpg
  → Firebase CDN (cache hit? serve immediately)
  → imageHandler Cloud Function
    → Firestore lookup (links → photos)
    → Stream from Cloud Storage (or Sharp resize if ?size=N)
    → Cache-Control: s-maxage=315360000 (CDN caches for 10 years)
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v2/get-token` | Get time-limited upload token (MD5 challenge) |
| POST | `/api/v2/upload` | Upload with token |
| POST | `/api/v4/upload` | Upload + auto-create gallery |
| GET | `/api/v4/g/:id` | Get gallery photos |

## Development

```bash
# Frontend (Vite dev server)
npm install
npm run dev

# Functions
cd functions && npm install && npm run build

# Deploy everything
npm run deploy

# Deploy only functions or hosting
npm run deploy:functions
npm run deploy:hosting
```

## Project structure

```
├── src/                  # Frontend source (JS, SASS, HTML partials)
├── hosting/              # Built frontend (Vite output)
├── functions/src/        # Cloud Functions
│   ├── index.ts          # Function exports (api + imageHandler)
│   ├── imageHandler.ts   # Image serving + resize
│   ├── v2.ts             # V2 token-based upload API
│   ├── v4.ts             # V4 upload + gallery API
│   ├── photoTools.ts     # Upload logic, MD5 dedup, validation
│   ├── parseForm.ts      # Multipart form parsing (busboy)
│   └── utils.ts          # Random ID generation, helpers
├── migration/            # One-time MongoDB → Firestore migration
├── firebase.json         # Hosting rewrites, function config
├── firestore.rules       # Deny all client access
└── storage.rules         # Public read, admin write
```

## Chrome Extension

[StaticShot](https://chromewebstore.google.com/detail/staticshot-screenshot-cap/bbgoenllpdnfljjapjcababahphohncj) — capture screenshots, annotate, and upload directly to Static.md. Source in the `chromium-extension` sibling repo.
