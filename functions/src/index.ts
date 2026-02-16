import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';
import { createV2Router } from './v2';
import { createV4Router } from './v4';
import { handleImageRequest } from './imageHandler';

const uploadToken = defineSecret('UPLOAD_TOKEN');

admin.initializeApp();

// ── Express app for API endpoints ──────────────────────────────
const app = express();

app.use(cors({ origin: true }));

app.use('/api/v2', createV2Router());
app.use('/api/v4', createV4Router());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Cloud Function exports ─────────────────────────────────────

/** API function — handles all /api/** routes */
export const api = onRequest(
  { memory: '256MiB', timeoutSeconds: 60, concurrency: 80, secrets: [uploadToken] },
  app
);

/** Image handler — catch-all for /{hash} image URLs */
export const imageHandler = onRequest(
  { memory: '256MiB', timeoutSeconds: 30, concurrency: 80 },
  handleImageRequest as any
);
