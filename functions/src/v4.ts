import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { getUnique, getPhotoUrl } from './utils';
import { uploadPhoto } from './photoTools';
import { parseForm, ParsedFile } from './parseForm';

export function createV4Router(): Router {
  const router = Router();
  const db = admin.firestore();

  /**
   * POST /api/v4/upload
   * Accepts token=carocetoken + files. Uploads photos and creates a gallery.
   */
  router.post('/upload', parseForm(20), async (req: Request, res: Response) => {
    try {
      const token = req.body.token;
      const expectedToken = process.env.UPLOAD_TOKEN;
      if (!expectedToken || token !== expectedToken) {
        res.status(403).json({ error: 'Incorrect token' });
        return;
      }

      const files = (req as any).files as ParsedFile[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'At least one file required' });
        return;
      }

      const uploaded: Array<{ name: string; photoData: any }> = [];
      const errors: string[] = [];

      for (const file of files) {
        console.log('Uploaded ' + file.originalname);
        const result = await uploadPhoto(file, req, db);
        if (result.name) {
          uploaded.push({ name: result.name, photoData: result.photoData });
        }
        if (result.error) {
          errors.push(result.error);
        }
      }

      let galleryLink = '';

      if (uploaded.length > 0) {
        // Deduplicate photo names
        const photoSet = new Set<string>();
        for (const u of uploaded) {
          photoSet.add(u.name);
        }
        const photoList = Array.from(photoSet);

        // Check if a gallery with this exact photo list exists
        // Since Firestore can't query for exact array match easily,
        // we create a deterministic key from sorted photo names
        const sortedKey = [...photoList].sort().join('|');
        const existingQuery = await db.collection('galleries')
          .where('photoListKey', '==', sortedKey)
          .limit(1)
          .get();

        let galleryRef: FirebaseFirestore.DocumentReference;
        let galleryData: FirebaseFirestore.DocumentData;

        if (!existingQuery.empty) {
          galleryRef = existingQuery.docs[0].ref;
          galleryData = existingQuery.docs[0].data();
          galleryLink = galleryData.links[0];
        } else {
          const uniqueLink = await getUnique(db, 6);
          galleryLink = uniqueLink;

          galleryData = {
            date: new Date(),
            links: [uniqueLink],
            photoList,
            photoListKey: sortedKey,
            tags: [],
          };

          galleryRef = db.collection('galleries').doc();
          const batch = db.batch();
          batch.set(galleryRef, galleryData);
          // Create link entry for O(1) gallery lookup
          batch.set(db.collection('links').doc(uniqueLink), {
            type: 'gallery',
            galleryId: galleryRef.id,
          });
          await batch.commit();
        }
      }

      const links = uploaded.map((u) => ({
        url: getPhotoUrl(u.name),
        size: {
          h: u.photoData?.height || 0,
          w: u.photoData?.width || 0,
        },
      }));

      res.json({
        gallery: galleryLink,
        links,
        errors,
      });
    } catch (err: any) {
      console.error('v4 upload error:', err);
      res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
  });

  /**
   * GET /api/v4/g/:id
   * Get gallery by link ID. Returns photo URLs and dimensions.
   */
  router.get('/g/:id', async (req: Request, res: Response) => {
    try {
      const galleryId = req.params.id as string;

      // First try O(1) lookup via links collection
      const linkDoc = await db.collection('links').doc(galleryId).get();
      let gallerySnap: FirebaseFirestore.DocumentSnapshot | null = null;

      if (linkDoc.exists && linkDoc.data()?.type === 'gallery') {
        gallerySnap = await db.collection('galleries').doc(linkDoc.data()!.galleryId).get();
      }

      // Fallback: query galleries by links array
      if (!gallerySnap || !gallerySnap.exists) {
        const query = await db.collection('galleries')
          .where('links', 'array-contains', galleryId)
          .limit(1)
          .get();
        if (query.empty) {
          res.status(404).json({ error: 'Gallery not found' });
          return;
        }
        gallerySnap = query.docs[0];
      }

      const gallery = gallerySnap.data()!;
      const photoList: string[] = gallery.photoList || [];

      // Fetch each photo document
      const links = [];
      for (const photoName of photoList) {
        const photoSnap = await db.collection('photos').doc(photoName).get();
        if (photoSnap.exists) {
          const photo = photoSnap.data()!;
          const photoLinks = photo.links as string[] | undefined;
          links.push({
            url: getPhotoUrl(photoLinks?.[0] || photoName),
            size: {
              h: photo.height || 0,
              w: photo.width || 0,
            },
          });
        }
      }

      res.json({ links });
    } catch (err: any) {
      console.error('get gallery error:', err);
      res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
  });

  return router;
}
