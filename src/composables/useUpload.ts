import { ref, onMounted, onUnmounted } from 'vue';
import { uploadFiles, UploadResponse } from '../api';

export function useUpload() {
  const showOverlay = ref(false);
  const showModal = ref(false);
  const isUploading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);
  const abortController = ref<AbortController | null>(null);

  let dragCounter = 0;

  function onDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (dragCounter === 1) {
      showOverlay.value = true;
      showModal.value = false;
    }
  }

  function onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      showOverlay.value = false;
    }
  }

  function onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    showOverlay.value = false;
    dragCounter = 0;

    const dt = e.dataTransfer;
    const files: File[] = [];
    if (dt?.items) {
      for (let i = 0; i < dt.items.length; i++) {
        if (dt.items[i].kind === 'file') {
          const f = dt.items[i].getAsFile();
          if (f) files.push(f);
        }
      }
    } else if (dt?.files) {
      for (let i = 0; i < dt.files.length; i++) {
        files.push(dt.files[i]);
      }
    }

    if (files.length > 0) {
      showModal.value = true;
      upload(files);
    }
  }

  function onPaste(e: ClipboardEvent): void {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }

    if (files.length > 0) {
      showModal.value = true;
      upload(files);
    }
  }

  async function upload(files: File[]): Promise<UploadResponse> {
    isUploading.value = true;
    progress.value = 0;
    error.value = null;
    abortController.value = new AbortController();

    try {
      const result = await uploadFiles(files, {
        onProgress: (e) => { progress.value = Math.floor(e.percent); },
        signal: abortController.value.signal,
      });
      isUploading.value = false;
      progress.value = 100;
      return result;
    } catch (err) {
      isUploading.value = false;
      error.value = (err as Error).message || 'Upload failed';
      throw err;
    }
  }

  function abort(): void {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
    isUploading.value = false;
    progress.value = 0;
  }

  function openModal(): void {
    showModal.value = true;
  }

  function closeModal(): void {
    abort();
    showModal.value = false;
  }

  onMounted(() => {
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop', onDrop);
    document.addEventListener('paste', onPaste);
  });

  onUnmounted(() => {
    document.removeEventListener('dragenter', onDragEnter);
    document.removeEventListener('dragover', onDragOver);
    document.removeEventListener('dragleave', onDragLeave);
    document.removeEventListener('drop', onDrop);
    document.removeEventListener('paste', onPaste);
  });

  return {
    showOverlay,
    showModal,
    isUploading,
    progress,
    error,
    upload,
    abort,
    openModal,
    closeModal,
  };
}
