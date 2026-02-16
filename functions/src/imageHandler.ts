import * as admin from 'firebase-admin';
import { Request } from 'firebase-functions/v2/https';
import { Response } from 'express';
import sharp from 'sharp';

const allowedFormats = ['jpg', 'jpeg', 'png'];

const mimeMap: Record<string, string> = {
  gif: 'image/gif', ico: 'image/x-icon',
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', svg: 'image/svg+xml', bmp: 'image/bmp',
};

/**
 * Image handler Cloud Function.
 * Serves images by looking up the link in Firestore, then either:
 *   - Streams from Cloud Storage (full-size images)
 *   - Resizes on-the-fly with Sharp (for ?size=N)
 *
 * Firebase CDN caches the response via s-maxage, so subsequent
 * requests are served from the edge with zero function invocations.
 */
export async function handleImageRequest(req: Request, res: Response): Promise<void> {
  const db = admin.firestore();
  const link = req.path.replace(/^\//, '');

  if (!link || link === 'favicon.ico' || link === 'robots.txt') {
    res.status(404).send('Not found');
    return;
  }

  let requestedSize = 0;
  if (req.query.size) {
    let sizeStr = String(req.query.size);
    if (sizeStr.indexOf('.') !== -1) sizeStr = sizeStr.split('.')[0];
    requestedSize = parseInt(sizeStr, 10) || 0;
  }

  try {
    const linkDoc = await db.collection('links').doc(link).get();

    if (linkDoc.exists) {
      const linkData = linkDoc.data()!;

      if (linkData.type === 'gallery') {
        res.redirect(301, `/g/${link}`);
        return;
      }

      if (linkData.type === 'photo') {
        const photoId = linkData.photoId as string;
        const photoSnap = await db.collection('photos').doc(photoId).get();

        if (!photoSnap.exists) {
          res.status(404).send('Photo not found');
          return;
        }

        const photo = photoSnap.data()!;
        const photoName = photo.name as string;
        const format = photo.format as string;
        const photoWidth = (photo.width as number) || 0;

        // Fire-and-forget: update seen count
        db.collection('photos').doc(photoId).update({
          lastSeen: new Date(),
          seenCount: (photo.seenCount || 0) + 1,
        }).catch(() => {});

        const bucket = admin.storage().bucket();
        const file = bucket.file(`uploads/${photoName}`);
        const contentType = mimeMap[format] || 'application/octet-stream';

        // Resize path — needs full buffer for Sharp
        if (requestedSize > 0 && allowedFormats.includes(format)) {
          let sizeW = requestedSize;
          if (sizeW > photoWidth || sizeW < 10) sizeW = photoWidth;

          if (sizeW !== photoWidth && sizeW > 0) {
            const [buffer] = await file.download();
            const resized = await sharp(buffer).resize(sizeW).toBuffer();

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', String(resized.length));
            res.setHeader('Cache-Control', 'public, s-maxage=315360000, max-age=315360000');
            res.end(resized, 'binary');
            return;
          }
        }

        // Full-size: stream directly from Cloud Storage
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, s-maxage=315360000, max-age=315360000');

        const stream = file.createReadStream();
        stream.on('error', (err) => {
          console.error('stream error:', err);
          if (!res.headersSent) res.status(500).send('Storage error');
        });
        stream.pipe(res);
        return;
      }
    }

    // Fallback: gallery array-contains query
    const galleryQuery = await db.collection('galleries')
      .where('links', 'array-contains', link)
      .limit(1)
      .get();

    if (!galleryQuery.empty) {
      res.redirect(301, `/g/${link}`);
      return;
    }

    res.status(404).send('Not found');
  } catch (err) {
    console.error('imageHandler error:', err);
    res.status(500).send('Internal error');
  }
}
