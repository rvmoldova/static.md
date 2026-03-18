<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'
import { useGallery } from '../composables/useGallery'
import GalleryGrid from '../components/GalleryGrid.vue'
import EmbedModal from '../components/EmbedModal.vue'

const props = defineProps({
  galleryId: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { images, loading, error, loadGallery } = useGallery()
const showEmbedModal = ref(false)
let lightbox: PhotoSwipeLightbox | null = null

function initLightbox() {
  if (lightbox) {
    lightbox.destroy()
    lightbox = null
  }

  lightbox = new PhotoSwipeLightbox({
    gallery: '.grid-gallery',
    children: 'a',
    pswpModule: () => import('photoswipe'),
  })

  lightbox.init()
}

onMounted(async () => {
  await loadGallery(props.galleryId)

  if (error.value) {
    // Treat any error as not found — redirect to 404
    router.replace('/404')
    return
  }

  await nextTick()
  initLightbox()
})

onUnmounted(() => {
  if (lightbox) {
    lightbox.destroy()
    lightbox = null
  }
})

watch(error, (err) => {
  if (err) router.replace('/404')
})
</script>

<template>
  <div class="gallery-view">
    <div class="gallery-header">
      <!-- Loading state -->
      <template v-if="loading">
        <div class="skeleton-headline" aria-hidden="true"></div>
      </template>

      <!-- Loaded state -->
      <template v-else-if="!error">
        <button
          type="button"
          class="embed-btn"
          aria-haspopup="dialog"
          @click="showEmbedModal = true"
        >
          <!-- Link icon -->
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5L7.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5l1-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Embed this gallery</span>
        </button>
      </template>
    </div>

    <!-- Loading skeleton grid -->
    <div v-if="loading" class="skeleton-grid" aria-label="Loading gallery" aria-busy="true">
      <div v-for="n in 9" :key="n" class="skeleton-item animate-pulse"></div>
    </div>

    <!-- Gallery grid -->
    <GalleryGrid
      v-else-if="!error && images.length"
      :images="images"
    />

    <!-- Empty state -->
    <div v-else-if="!error && !images.length && !loading" class="empty-state">
      <p class="empty-state__title">This gallery is empty</p>
      <p class="empty-state__desc">No images have been uploaded to this gallery yet.</p>
    </div>

    <!-- Embed modal -->
    <Transition name="modal">
      <EmbedModal
        v-if="showEmbedModal"
        :gallery-id="galleryId"
        :images="images"
        @close="showEmbedModal = false"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.gallery-view {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
  padding-bottom: var(--space-24);
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-block: var(--space-8);
  min-height: 64px;
}

// Embed button — outlined with hover fill
.embed-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text);
  background-color: transparent;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: color var(--duration-normal) var(--ease-out-quart),
              border-color var(--duration-normal) var(--ease-out-quart);

  // Fill animation on hover via pseudo-element
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--color-primary);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform var(--duration-normal) var(--ease-out-quart);
    z-index: 0;
  }

  svg,
  span {
    position: relative;
    z-index: 1;
  }

  &:hover {
    color: oklch(98% 0.005 250);
    border-color: var(--color-primary);

    &::before {
      transform: scaleX(1);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      transition: none;
    }
  }
}

// Loading skeleton
.skeleton-headline {
  width: 180px;
  height: 36px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-sunken);
  animation: pulse 2s var(--ease-out-quart) infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;

  @media (min-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.skeleton-item {
  background-color: var(--color-surface-sunken);
  border-radius: var(--radius-sm);
  aspect-ratio: 4 / 3;

  &:nth-child(3n+1) { aspect-ratio: 4 / 3; }
  &:nth-child(3n+2) { aspect-ratio: 3 / 4; }
  &:nth-child(3n)   { aspect-ratio: 16 / 9; }
}

// Empty state
.empty-state {
  padding-block: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.empty-state__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.empty-state__desc {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

// Modal transitions
.modal-enter-active {
  transition: opacity var(--duration-normal) var(--ease-out-quart);
}

.modal-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
