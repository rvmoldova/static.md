import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { imageSize } from 'image-size';
import { extractIP } from './utils';
import { Request } from 'express';
import { ParsedFile } from './parseForm';

const mimes: Record<string, string> = {
  'image/gif': 'gif',
  'image/x-icon': 'ico',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/x-png': 'png',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
};

const videoMimes: Record<string, string> = {
  'video/mp4': 'mp4',
};

export interface UploadResult {
  name?: string;
  error?: string;
  photoData?: FirebaseFirestore.DocumentData;
}

/**
 * Validate that the file is an acceptable image (or video if allowed).
 * Returns an error string if bad, or null if OK.
 */
export function isPhotoBad(
  file: ParsedFile,
  allowVideo = false
): string | null {
  if (!allowVideo && !mimes[file.mimetype]) {
    return `"${file.originalname}" is not image`;
  }
  if (!mimes[file.mimetype] && !videoMimes[file.mimetype]) {
    return `"${file.originalname}" is not a supported format`;
  }
  if (file.size > 10 * 1024 * 1024) {
    return `"${file.originalname}" is too big`;
  }
  return null;
}

/**
 * Compute MD5 hash of a buffer.
 */
export function md5Buffer(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Get the file extension for a given mimetype.
 */
export function getExtension(mimetype: string): string | undefined {
  return mimes[mimetype] || videoMimes[mimetype];
}

/**
 * Upload a photo: dedup by MD5, store in Cloud Storage, create Firestore doc.
 * Ported from static-back/src/services/photoTools/index.ts
 */
export async function uploadPhoto(
  file: ParsedFile,
  req: Request,
  db: FirebaseFirestore.Firestore,
  allowVideo = false
): Promise<UploadResult> {
  const err = isPhotoBad(file, allowVideo);
  if (err) {
    return { error: err };
  }

  const md5 = md5Buffer(file.buffer);
  const ext = getExtension(file.mimetype)!;
  const md5Name = `${md5}.${ext}`;
  const realIP = extractIP(req);

  const photoRef = db.collection('photos').doc(md5Name);
  const photoSnap = await photoRef.get();

  if (!photoSnap.exists) {
    // New photo — upload to Cloud Storage
    const storageBucket = admin.storage().bucket();
    const storageFile = storageBucket.file(`uploads/${md5Name}`);
    await storageFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=315360000',
      },
    });

    // Get image dimensions
    let width = 0;
    let height = 0;
    try {
      const dims = imageSize(file.buffer);
      width = dims.width || 0;
      height = dims.height || 0;
    } catch (e) {
      console.log('Could not read dimensions:', e);
    }

    const photoData = {
      blocked: false,
      date: new Date(),
      lastSeen: new Date(),
      seenCount: 0,
      format: ext,
      height,
      width,
      host: 'static.md',
      ip: [realIP],
      links: [md5Name, md5],
      name: md5Name,
      originalName: file.originalname,
      size: file.size,
      uploadCount: 1,
      tags: [],
    };

    const batch = db.batch();
    batch.set(photoRef, photoData);
    // Create link entries for O(1) lookup
    batch.set(db.collection('links').doc(md5Name), {
      type: 'photo',
      photoId: md5Name,
    });
    batch.set(db.collection('links').doc(md5), {
      type: 'photo',
      photoId: md5Name,
    });
    await batch.commit();

    return { name: md5Name, photoData };
  } else {
    // Existing photo — increment count, add IP
    const existingData = photoSnap.data()!;
    const ips: string[] = existingData.ip || [];
    if (!ips.includes(realIP)) {
      ips.push(realIP);
    }
    await photoRef.update({
      uploadCount: (existingData.uploadCount || 1) + 1,
      ip: ips,
    });

    return { name: md5Name, photoData: { ...existingData, name: md5Name } };
  }
}
