<script setup lang="ts">
import { provide, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import UploadOverlay from './components/UploadOverlay.vue'
import UploadModal from './components/UploadModal.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useUpload } from './composables/useUpload'
import { useToast } from './composables/useToast'

const router = useRouter()
const upload = useUpload()
const toast = useToast()

provide('upload', upload)
provide('toast', toast)

// Auto-upload when files arrive via drag-drop or paste
watch(upload.pendingFiles, (files) => {
  if (files.length > 0) {
    onUploadFiles(files)
    upload.pendingFiles.value = []
  }
})

async function onUploadFiles(files: File[]) {
  try {
    const result = await upload.upload(files)
    if (result.gallery) {
      upload.closeModal()
      router.push(`/g/${result.gallery}`)
    }
  } catch {
    // error is already set in upload composable
  }
}
</script>

<template>
  <a href="#main" class="sr-only sr-only-focusable">Skip to content</a>
  <AppHeader />
  <main id="main">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </main>
  <AppFooter />

  <Transition name="overlay">
    <UploadOverlay v-if="upload.showOverlay.value" />
  </Transition>

  <Transition name="modal">
    <UploadModal
      v-if="upload.showModal.value"
      :is-uploading="upload.isUploading.value"
      :progress="upload.progress.value"
      :error="upload.error.value"
      @upload="onUploadFiles"
      @close="upload.closeModal()"
    />
  </Transition>

  <ToastNotification />
</template>

<style lang="scss" scoped>
main {
  flex: 1;
  max-width: var(--content-width);
  margin: var(--space-8) auto 0;
  padding: 0;
  width: 100%;
}

// Page transition
.page-enter-active,
.page-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out-quart),
              transform var(--duration-normal) var(--ease-out-quart);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// Overlay transition
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out-quart);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

// Modal transition
.modal-enter-active {
  transition: opacity var(--duration-normal) var(--ease-out-quart),
              transform var(--duration-normal) var(--ease-out-quart);
}

.modal-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in),
              transform var(--duration-fast) var(--ease-in);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(4px);
}
</style>
