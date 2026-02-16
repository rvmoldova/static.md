import { Request } from 'express';

/**
 * Generate a random alphanumeric string of the given length.
 * Ported from static-back/src/services/random/index.ts
 */
export function genString(length: number): string {
  if (length <= 0) return '';
  const getChunk = () => {
    let str = '';
    const rand = Math.random() * 10e16;
    const bin = rand.toString(2).substr(2, 10);
    const lcase = (rand.toString(36) + '0000000000').substr(0, 10);
    const ucase = lcase.toUpperCase();
    const a = [lcase, ucase];
    for (let i = 0; i < 10; i++) {
      str += a[Number(bin[i])][i];
    }
    return str;
  };
  let str = '';
  while (str.length < length) {
    str += getChunk();
  }
  return str.substr(0, length);
}

/**
 * Generate a unique random string that doesn't collide with existing links.
 */
export async function getUnique(
  db: FirebaseFirestore.Firestore,
  length: number
): Promise<string> {
  let tries = 0;
  while (tries < 20) {
    const id = genString(length);
    const linkDoc = await db.collection('links').doc(id).get();
    if (!linkDoc.exists) {
      return id;
    }
    console.error(`[Niherase] ${id} repeated`);
    tries++;
  }
  throw new Error('Unable to generate unique ID');
}

/**
 * Extract the real client IP from request headers.
 */
export function extractIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

/**
 * Build the public URL for a photo.
 */
export function getPhotoUrl(name: string): string {
  return `https://static.md/${name}`;
}
