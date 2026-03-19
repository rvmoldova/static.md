<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import Masonry from 'masonry-layout'
import imagesLoaded from 'imagesloaded'
import { Share2, Check, ZoomIn } from 'lucide-vue-next'
import { useClipboard } from '../composables/useClipboard'
import { useToast } from '../composables/useToast'
import type { GalleryImage } from '../api'

const props = defineProps({
  images: {
    type: Array as () => GalleryImage[],
    default: () => [],
  },
})

const gridRef = ref(null)
const { copy } = useClipboard()
const toast = useToast()
const copiedIndex = ref<number | null>(null)
const loadedImages = ref<Set<number>>(new Set())

let msnry: Masonry | null = null

// Gutter size in pixels — single source of truth
const GUTTER = 10

function getColumnLayout(): 'single' | 'double' | 'triple' {
  const w = window.innerWidth
  if (w >= 1100) return 'triple'
  if (w >= 500) return 'double'
  return 'single'
}

function initMasonry() {
  if (!gridRef.value) return

  const layout = getColumnLayout()

  if (layout === 'single') {
    // Single column: no fitWidth, just full-width stacking
    msnry = new Masonry(gridRef.value, {
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      gutter: GUTTER,
      percentPosition: false,
      transitionDuration: '0.3s',
    })
  } else {
    // Multi-column: fitWidth for centering
    msnry = new Masonry(gridRef.value, {
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      gutter: GUTTER,
      fitWidth: true,
      transitionDuration: '0.3s',
    })
  }

  imagesLoaded(gridRef.value, () => {
    msnry?.layout()
  })
}

function onResize() {
  if (msnry) {
    msnry.destroy()
    msnry = null
  }
  initMasonry()
}

async function copyImageUrl(url: string, index: number, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  const ok = await copy(url)
  if (ok) {
    toast.show('Image URL copied!')
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 1500)
  }
}

function onImageLoad(index: number) {
  loadedImages.value.add(index)
}

onMounted(() => {
  initMasonry()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (msnry) {
    msnry.destroy()
    msnry = null
  }
})

watch(() => props.images, () => {
  // Re-init after images change (nextTick handled by imagesLoaded)
  if (msnry) {
    msnry.destroy()
    msnry = null
  }
  nextTick(initMasonry)
})
</script>

<template>
  <div
    ref="gridRef"
    class="grid-gallery"
    itemscope
    itemtype="http://schema.org/ImageGallery"
    role="list"
    aria-label="Gallery images"
  >
    <div class="grid-sizer" aria-hidden="true"></div>

    <figure
      v-for="(image, index) in images"
      :key="image.url"
      class="grid-item"
      itemprop="image"
      itemscope
      itemtype="http://schema.org/ImageObject"
      role="listitem"
    >
      <a
        :href="image.url"
        :data-pswp-width="image.size?.w"
        :data-pswp-height="image.size?.h"
        class="grid-item__link"
        :aria-label="`View image ${index + 1} in lightbox`"
        itemprop="contentUrl"
      >
        <img
          :src="image.url"
          :srcset="`${image.url}?size=400 400w, ${image.url}?size=800 800w, ${image.url} 1200w`"
          sizes="(min-width: 1100px) 33vw, (min-width: 500px) 50vw, 100vw"
          :alt="`Gallery image ${index + 1}`"
          class="grid-item__img"
          :class="{ 'is-loaded': loadedImages.has(index) }"
          loading="lazy"
          itemprop="url"
          @load="onImageLoad(index)"
        />
        <!-- Hover overlay -->
        <div class="grid-item__overlay" aria-hidden="true">
          <!-- Zoom icon -->
          <ZoomIn :size="24" aria-hidden="true" class="overlay-icon" />
        </div>
      </a>

      <!-- Share / copy icon -->
      <button
        type="button"
        class="grid-item__share"
        :class="{ 'is-copied': copiedIndex === index }"
        :aria-label="`Copy URL of image ${index + 1}`"
        @click="copyImageUrl(image.url, index, $event)"
      >
        <Check v-if="copiedIndex === index" :size="14" aria-hidden="true" />
        <Share2 v-else :size="14" aria-hidden="true" />
      </button>
    </figure>
  </div>
</template>

<style lang="scss" scoped>
// Gutter must match the JS GUTTER constant
$gutter: 10px;

.grid-gallery {
  position: relative;
  margin: 0 auto;
}

// ── Sizer and item widths ─────────────────────────────────────────────────────
// Single column (mobile): full width, no fitWidth
.grid-sizer,
.grid-item {
  width: 100%;

  // 2 columns at 500px+
  @media (min-width: 500px) {
    width: 240px;
  }

  // 3 columns at 1100px+
  @media (min-width: 1100px) {
    width: 340px;
  }
}

.grid-item {
  margin-bottom: $gutter;
  position: relative;
  overflow: hidden;
  display: block;

  // Remove default figure margins
  margin-inline: 0;
}

.grid-item__link {
  display: block;
  position: relative;
  overflow: hidden;
  line-height: 0; // Remove inline gap under image

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.grid-item__img {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0;
  transition: transform var(--duration-normal) var(--ease-out-quart),
              opacity var(--duration-normal) var(--ease-out-quart);

  &.is-loaded {
    opacity: 1;
  }
}

.grid-item__overlay {
  position: absolute;
  inset: 0;
  background-color: oklch(from var(--color-primary) l c h / 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out-quart);
}

.overlay-icon {
  color: var(--color-on-primary);
  filter: drop-shadow(0 2px 4px oklch(from var(--color-shadow) l c h / 0.3));
}

// Hover interactions on the link
.grid-item__link:hover {
  .grid-item__img {
    transform: scale(1.03);
  }

  .grid-item__overlay {
    opacity: 1;
  }
}

// Share button
.grid-item__share {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background-color: oklch(from var(--color-surface-raised) l c h / 0.9);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity var(--duration-fast) var(--ease-out-quart),
              transform var(--duration-fast) var(--ease-out-quart),
              color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart);
  z-index: 2;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-raised);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    opacity: 1;
    transform: translateY(0);
  }
}

// Copied state
.grid-item__share.is-copied {
  color: var(--color-accent);
  opacity: 1;
  transform: translateY(0);
}

// Show share button on figure hover
.grid-item:hover .grid-item__share {
  opacity: 1;
  transform: translateY(0);
}

// Always show share button on touch devices (no hover capability)
@media (hover: none) {
  .grid-item__share {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .grid-item__img,
  .grid-item__overlay,
  .grid-item__share {
    transition: none;
  }

  .grid-item__img {
    opacity: 1;
  }
}
</style>
