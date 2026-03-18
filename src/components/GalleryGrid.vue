<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Masonry from 'masonry-layout'
import imagesLoaded from 'imagesloaded'
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

let msnry: Masonry | null = null

function initMasonry() {
  if (!gridRef.value) return

  msnry = new Masonry(gridRef.value, {
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    gutter: '.gutter-sizer',
    percentPosition: true,
    transitionDuration: '0.3s',
  })

  imagesLoaded(gridRef.value, () => {
    msnry.layout()
  })
}

async function copyImageUrl(url: string, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  const ok = await copy(url)
  if (ok) toast.show('Image URL copied!')
}

onMounted(() => {
  initMasonry()
})

onUnmounted(() => {
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
  setTimeout(initMasonry, 0)
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
    <div class="gutter-sizer" aria-hidden="true"></div>

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
          :alt="`Gallery image ${index + 1}`"
          class="grid-item__img"
          loading="lazy"
          itemprop="url"
        />
        <!-- Hover overlay -->
        <div class="grid-item__overlay" aria-hidden="true">
          <!-- Zoom icon -->
          <svg class="overlay-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M8 11H14M11 8V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </a>

      <!-- Share / copy icon -->
      <button
        type="button"
        class="grid-item__share"
        :aria-label="`Copy URL of image ${index + 1}`"
        @click="copyImageUrl(image.url, $event)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" stroke-width="1.2"/>
          <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" stroke-width="1.2"/>
          <circle cx="2.5" cy="7" r="1.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M4 7.3L9.5 10.3M9.5 3.7L4 6.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </figure>
  </div>
</template>

<style lang="scss" scoped>
.grid-gallery {
  position: relative;
}

.grid-sizer,
.grid-item {
  width: 100%;

  @media (min-width: 500px) {
    width: calc(50% - 3px);
  }

  @media (min-width: 1100px) {
    width: calc(33.333% - 4px);
  }
}

.gutter-sizer {
  width: 5px;

  @media (min-width: 500px) {
    width: 5px;
  }
}

.grid-item {
  margin-bottom: 5px;
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
  transition: transform var(--duration-normal) var(--ease-out-quart);
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
  color: oklch(98% 0 0);
  filter: drop-shadow(0 2px 4px oklch(0% 0 0 / 0.3));
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
  width: 28px;
  height: 28px;
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

// Show share button on figure hover
.grid-item:hover .grid-item__share {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .grid-item__img,
  .grid-item__overlay,
  .grid-item__share {
    transition: none;
  }
}
</style>
