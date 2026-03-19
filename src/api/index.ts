const API_BASE = 'https://static.md/api/v4';

export interface GalleryImage {
  url: string
  size: { w: number; h: number }
}

export interface GalleryResponse {
  links: GalleryImage[]
}

export interface UploadResponse {
  gallery: string
  links: GalleryImage[]
  errors: string[]
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

export async function fetchGallery(galleryId: string): Promise<GalleryResponse> {
  const res = await fetch(`${API_BASE}/g/${galleryId}`);
  if (!res.ok) {
    const err = new Error(`Gallery fetch failed: ${res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json(); // { links: [{ url, size: { w, h } }] }
}

export function uploadFiles(files: File[], options: UploadOptions = {}): Promise<UploadResponse> {
  const { onProgress, signal } = options;
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('token', 'carocetoken');
    for (const file of files) {
      form.append('file', file);
    }

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({ loaded: e.loaded, total: e.total, percent: (e.loaded / e.total) * 100 });
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status < 400) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const err = new Error(xhr.statusText || 'Upload failed') as Error & { status?: number };
        err.status = xhr.status;
        try { Object.assign(err, JSON.parse(xhr.responseText)); } catch {}
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    if (signal) {
      signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.open('POST', `${API_BASE}/upload`, true);
    xhr.send(form);
  });
}
