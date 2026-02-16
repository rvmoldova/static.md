"""
Upload all files from /uploads to Cloud Storage bucket.
Sequential upload — no threading (Docker has strict limits).
Skips existing files.
"""
import os
import time
from google.cloud import storage

BUCKET_NAME = "static-10546.appspot.com"
LOCAL_DIR = "/uploads"
REMOTE_PREFIX = "uploads/"

client = storage.Client()
bucket = client.bucket(BUCKET_NAME)

files = sorted(os.listdir(LOCAL_DIR))
total = len(files)
print(f"Found {total} files to upload", flush=True)

# List existing blobs once to skip already-uploaded files
print("Listing existing blobs in bucket...", flush=True)
existing = set()
for blob in client.list_blobs(bucket, prefix=REMOTE_PREFIX):
    existing.add(blob.name)
print(f"Found {len(existing)} existing blobs, will skip those", flush=True)

uploaded = 0
skipped = 0
errors = 0
start = time.time()

for idx, filename in enumerate(files):
    remote_path = REMOTE_PREFIX + filename
    if remote_path in existing:
        skipped += 1
    else:
        try:
            blob = bucket.blob(remote_path)
            blob.cache_control = "public, max-age=315360000"
            blob.upload_from_filename(os.path.join(LOCAL_DIR, filename))
            uploaded += 1
        except Exception as e:
            errors += 1
            print(f"  ERROR {filename}: {e}", flush=True)

    done = idx + 1
    if done % 200 == 0:
        elapsed = time.time() - start
        rate = done / elapsed if elapsed > 0 else 0
        eta = (total - done) / rate / 60 if rate > 0 else 0
        print(f"  {done}/{total} ({uploaded} up, {skipped} skip, {errors} err) - {rate:.1f}/s - ETA {eta:.0f}min", flush=True)

elapsed = time.time() - start
print(f"\nDone in {elapsed/60:.1f} min: {uploaded} uploaded, {skipped} skipped, {errors} errors", flush=True)
