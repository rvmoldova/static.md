/**
 * MongoDB → Firestore migration script.
 *
 * Run this from the Digital Ocean server where MongoDB is accessible locally.
 *
 * Usage:
 *   1. npm install (in this directory)
 *   2. Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account key JSON
 *   3. Set FIREBASE_PROJECT_ID to your Firebase project ID
 *   4. Set FIREBASE_STORAGE_BUCKET to your bucket (e.g., {project}.appspot.com)
 *   5. Optionally set MONGO_URI (defaults to mongodb://127.0.0.1:27017/static_prod)
 *   6. npx ts-node migrateData.ts
 *
 * The script:
 *   - Streams all photos from MongoDB, batch-writes to Firestore (photos + links collections)
 *   - Streams all galleries from MongoDB, batch-writes to Firestore (galleries + links collections)
 *   - Does NOT migrate files — use gsutil for that (see README)
 */

import * as admin from 'firebase-admin';
import { MongoClient, Db } from 'mongodb';

// ── Configuration ──────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/static_prod';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

if (!FIREBASE_PROJECT_ID) {
  console.error('FIREBASE_PROJECT_ID environment variable is required');
  process.exit(1);
}

// ── Initialize Firebase Admin ──────────────────────────────────

admin.initializeApp({
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// ── Helpers ────────────────────────────────────────────────────

const BATCH_SIZE = 400; // Firestore limit is 500 writes per batch

async function commitBatch(batch: FirebaseFirestore.WriteBatch, label: string, count: number) {
  await batch.commit();
  console.log(`  ${label}: committed batch (${count} docs total)`);
}

// ── Migrate Photos ─────────────────────────────────────────────

async function migratePhotos(mongodb: Db): Promise<void> {
  console.log('\n=== Migrating Photos ===');

  const cursor = mongodb.collection('photos').find({});
  const total = await mongodb.collection('photos').countDocuments();
  console.log(`  Found ${total} photos to migrate`);

  let batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    const name: string = doc.name;
    if (!name) {
      console.warn(`  Skipping photo with no name: ${doc._id}`);
      continue;
    }

    const photoRef = db.collection('photos').doc(name);

    const photoData: Record<string, any> = {
      blocked: doc.blocked || false,
      date: doc.date ? new Date(doc.date) : new Date(),
      lastSeen: doc.lastSeen ? new Date(doc.lastSeen) : new Date(),
      seenCount: doc.seenCount || 0,
      format: doc.format || '',
      height: doc.height || 0,
      width: doc.width || 0,
      host: doc.host || 'static.md',
      ip: doc.ip || [],
      links: doc.links || [],
      name: name,
      originalName: doc.originalName || '',
      size: doc.size || 0,
      uploadCount: doc.uploadCount || 1,
      tags: doc.tags || [],
    };

    batch.set(photoRef, photoData);
    batchCount++;

    // Create link entries for each link value
    const links: string[] = doc.links || [];
    for (const link of links) {
      if (!link) continue;
      if (batchCount >= BATCH_SIZE) {
        await commitBatch(batch, 'photos', totalCount);
        batch = db.batch();
        batchCount = 0;
      }
      batch.set(db.collection('links').doc(link), {
        type: 'photo',
        photoId: name,
      });
      batchCount++;
    }

    totalCount++;

    if (batchCount >= BATCH_SIZE) {
      await commitBatch(batch, 'photos', totalCount);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await commitBatch(batch, 'photos', totalCount);
  }

  console.log(`  Photos migration complete: ${totalCount} photos migrated`);
}

// ── Migrate Galleries ──────────────────────────────────────────

async function migrateGalleries(mongodb: Db): Promise<void> {
  console.log('\n=== Migrating Galleries ===');

  const cursor = mongodb.collection('galleries').find({});
  const total = await mongodb.collection('galleries').countDocuments();
  console.log(`  Found ${total} galleries to migrate`);

  // Build a map from MongoDB ObjectId → photo name for resolving photoList references
  console.log('  Building ObjectId → photo name map...');
  const photoIdMap = new Map<string, string>();
  const photoCursor = mongodb.collection('photos').find({}, { projection: { _id: 1, name: 1 } });
  while (await photoCursor.hasNext()) {
    const doc = await photoCursor.next();
    if (doc && doc.name) {
      photoIdMap.set(doc._id.toString(), doc.name);
    }
  }
  console.log(`  Map built: ${photoIdMap.size} entries`);

  let batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    // Resolve ObjectId references to photo names
    const photoList: string[] = [];
    if (doc.photoList && Array.isArray(doc.photoList)) {
      for (const ref of doc.photoList) {
        const idStr = ref.toString();
        const photoName = photoIdMap.get(idStr);
        if (photoName) {
          photoList.push(photoName);
        } else {
          console.warn(`  Gallery ${doc._id}: could not resolve photo ref ${idStr}`);
        }
      }
    }

    const sortedKey = [...photoList].sort().join('|');

    const galleryRef = db.collection('galleries').doc();
    const galleryData: Record<string, any> = {
      date: doc.date ? new Date(doc.date) : new Date(),
      links: doc.links || [],
      photoList,
      photoListKey: sortedKey,
      tags: doc.tags || [],
    };

    batch.set(galleryRef, galleryData);
    batchCount++;

    // Create link entries for each gallery link
    const links: string[] = doc.links || [];
    for (const link of links) {
      if (!link) continue;
      if (batchCount >= BATCH_SIZE) {
        await commitBatch(batch, 'galleries', totalCount);
        batch = db.batch();
        batchCount = 0;
      }
      batch.set(db.collection('links').doc(link), {
        type: 'gallery',
        galleryId: galleryRef.id,
      });
      batchCount++;
    }

    totalCount++;

    if (batchCount >= BATCH_SIZE) {
      await commitBatch(batch, 'galleries', totalCount);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await commitBatch(batch, 'galleries', totalCount);
  }

  console.log(`  Galleries migration complete: ${totalCount} galleries migrated`);
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Static.md MongoDB → Firestore Migration');
  console.log('========================================');
  console.log(`MongoDB URI: ${MONGO_URI}`);
  console.log(`Firebase project: ${FIREBASE_PROJECT_ID}`);

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const mongodb = client.db();

    await migratePhotos(mongodb);
    await migrateGalleries(mongodb);

    console.log('\n========================================');
    console.log('Migration complete!');
    console.log('\nNext steps:');
    console.log('  1. Migrate files with gsutil:');
    console.log(`     gsutil -m -h "Cache-Control:public, max-age=315360000" \\`);
    console.log(`       cp -r /root/static-back/uploads/* gs://${FIREBASE_STORAGE_BUCKET}/uploads/`);
    console.log('  2. Deploy Firebase functions and hosting');
    console.log('  3. Test at {project}.web.app');
    console.log('  4. Update DNS when ready');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

main();
