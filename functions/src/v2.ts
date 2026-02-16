import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { genString, getPhotoUrl } from './utils';
import { isPhotoBad, md5Buffer, uploadPhoto } from './photoTools';
import { parseForm, ParsedFile } from './parseForm';

const md5Reg = /^[0-9a-f]{32}$/;

export function createV2Router(): Router {
  const router = Router();
  const db = admin.firestore();

  /**
   * POST /api/v2/get-token
   * Accepts either { md5: string } in body, or a single file upload.
   * Returns a time-limited token for subsequent upload.
   */
  router.post('/get-token', parseForm(1), async (req: Request, res: Response) => {
    try {
      let md5: string;

      if (req.body.md5) {
        md5 = req.body.md5;
      } else {
        const files = (req as any).files as ParsedFile[];
        if (!files || files.length !== 1) {
          res.status(400).json({ error: 'md5 or ONE file required' });
          return;
        }
        const file = files[0];
        const badResult = isPhotoBad(file, false);
        if (badResult) {
          res.status(400).json({ error: badResult });
          return;
        }
        md5 = md5Buffer(file.buffer);
      }

      if (!md5Reg.test(md5)) {
        res.status(400).json({ error: 'Invalid md5' });
        return;
      }

      const validAfterSeconds = Math.ceil(Math.random() * 3);
      const now = Date.now();
      const validFrom = new Date(now + validAfterSeconds * 1000);
      const expireAt = new Date(now + (30 + validAfterSeconds) * 1000);
      const token = genString(100);

      await db.collection('v2tokens').add({
        md5,
        token,
        validFrom,
        expireAt,
      });

      res.json({
        token,
        token_valid_after_seconds: validAfterSeconds,
        token_valid_after_timestamp: Math.floor(validFrom.getTime() / 1000),
        token_valid_seconds: 30,
        server_timestamp: Math.floor(now / 1000),
        error: '',
      });
    } catch (err: any) {
      console.error('get-token error:', err);
      res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
  });

  /**
   * POST /api/v2/upload
   * Accepts token + single file. Validates token, uploads photo.
   */
  router.post('/upload', parseForm(1), async (req: Request, res: Response) => {
    try {
      const files = (req as any).files as ParsedFile[];
      const token = req.body.token;

      if (!files || files.length !== 1 || !token) {
        res.status(400).json({ error: 'token and ONE file required' });
        return;
      }

      const file = files[0];
      const md5 = md5Buffer(file.buffer);

      // Verify token
      const tokenQuery = await db.collection('v2tokens')
        .where('md5', '==', md5)
        .where('token', '==', token)
        .limit(1)
        .get();

      if (tokenQuery.empty) {
        res.status(401).json({ error: 'Invalid Token' });
        return;
      }

      const tokenDoc = tokenQuery.docs[0].data();
      const now = Date.now();
      const validFromMs = tokenDoc.validFrom.toDate().getTime();
      const expireAtMs = tokenDoc.expireAt.toDate().getTime();

      if (now < validFromMs || now > expireAtMs) {
        res.status(401).json({ error: 'Invalid Token' });
        return;
      }

      const result = await uploadPhoto(file, req, db);
      if (result.error) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        image: getPhotoUrl(result.name!),
        error: '',
      });
    } catch (err: any) {
      console.error('upload error:', err);
      res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
  });

  return router;
}
