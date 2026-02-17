import * as admin from 'firebase-admin';
import vision from '@google-cloud/vision';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

const visionClient = new vision.ImageAnnotatorClient();
const db = admin.firestore();

/**
 * Cloud Storage trigger: runs after a new image is uploaded to uploads/.
 * Calls Google Cloud Vision SafeSearch + label detection,
 * then merges results into the existing Firestore `tags` array.
 */
export const analyzeImage = onObjectFinalized(
  { bucket: 'static-10546.appspot.com', region: 'europe-west1', memory: '256MiB', timeoutSeconds: 60 },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath || !filePath.startsWith('uploads/')) return;

    const fileName = filePath.replace('uploads/', '');
    const photoRef = db.collection('photos').doc(fileName);
    const photoSnap = await photoRef.get();
    if (!photoSnap.exists) {
      console.log(`No Firestore doc for ${fileName}, skipping`);
      return;
    }

    // Skip if already analyzed
    const data = photoSnap.data()!;
    const existingTags: string[] = data.tags || [];
    if (existingTags.some((t) => t === 'ai:analyzed')) {
      console.log(`${fileName} already analyzed, skipping`);
      return;
    }

    // Skip non-image formats (e.g. videos, SVGs)
    const contentType = event.data.contentType || '';
    if (!contentType.startsWith('image/') || contentType === 'image/svg+xml') {
      console.log(`${fileName} is ${contentType}, skipping analysis`);
      return;
    }

    const imageUri = `gs://${event.data.bucket}/${filePath}`;

    try {
      const [result] = await visionClient.annotateImage({
        image: { source: { imageUri } },
        features: [
          { type: 'SAFE_SEARCH_DETECTION' },
          { type: 'LABEL_DETECTION', maxResults: 10 },
        ],
      });

      const newTags: string[] = [];

      // SafeSearch flags
      const safe = result.safeSearchAnnotation;
      if (safe) {
        if (safe.adult === 'LIKELY' || safe.adult === 'VERY_LIKELY') newTags.push('nsfw');
        if (safe.violence === 'LIKELY' || safe.violence === 'VERY_LIKELY') newTags.push('violence');
        if (safe.racy === 'LIKELY' || safe.racy === 'VERY_LIKELY') newTags.push('racy');
        if (safe.medical === 'LIKELY' || safe.medical === 'VERY_LIKELY') newTags.push('medical');
      }

      // Vision labels as tags
      for (const label of result.labelAnnotations || []) {
        if ((label.score || 0) > 0.7 && label.description) {
          newTags.push(label.description.toLowerCase());
        }
      }

      // Marker so we don't re-analyze
      newTags.push('ai:analyzed');

      // Merge with existing tags, deduplicate
      const merged = [...new Set([...existingTags, ...newTags])];

      await photoRef.update({ tags: merged });

      console.log(`Analyzed ${fileName}: tags=[${newTags.join(', ')}]`);
    } catch (err) {
      console.error(`Vision API error for ${fileName}:`, err);
    }
  }
);
