import { ref } from 'vue';
import { fetchGallery, GalleryImage } from '../api';

export function useGallery() {
  const images = ref<GalleryImage[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function loadGallery(galleryId: string): Promise<void> {
    loading.value = true;
    error.value = null;
    images.value = [];

    try {
      const data = await fetchGallery(galleryId);
      images.value = data.links || [];
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }

  return { images, loading, error, loadGallery };
}
