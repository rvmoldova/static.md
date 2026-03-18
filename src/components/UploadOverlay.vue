<script setup lang="ts">
// No logic needed — purely presentational.
// Parent (App.vue) controls v-if based on upload.showOverlay.
</script>

<template>
  <div class="upload-overlay" aria-hidden="true">
    <div class="upload-overlay__inner">
      <svg
        class="upload-overlay__icon"
        viewBox="0 0 505.736 505.736"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M396.007,191.19c-0.478,0-1.075,0-1.554,0c-6.693-54.147-52.833-96.103-108.773-96.103c-48.171,0-89.051,31.078-103.753,74.349c-16.734-8.128-35.381-12.67-55.224-12.67C56.658,156.765,0,213.542,0,283.707c0,67.416,52.594,122.64,118.934,126.703v0.239h277.91c60.244-0.358,108.893-49.366,108.893-109.729C505.617,240.317,456.609,191.19,396.007,191.19z"/>
      </svg>
      <span class="upload-overlay__label">Drop Here</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  pointer-events: none;
  animation: upload-cycle 3s ease-in-out infinite;

  // Inset dashed border frame
  &::before {
    content: '';
    position: absolute;
    inset: var(--space-4);
    border: 2px dashed oklch(98% 0.005 250 / 0.6);
    border-radius: var(--radius-lg);
    pointer-events: none;
  }
}

.upload-overlay__inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: oklch(98% 0.005 250 / 0.92);
}

.upload-overlay__icon {
  width: 3.5rem;
  height: 3.5rem;
  opacity: 0.85;
  filter: drop-shadow(0 2px 8px oklch(15% 0.01 250 / 0.3));
}

.upload-overlay__label {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-normal);
  text-transform: uppercase;
  text-shadow: 0 2px 12px oklch(15% 0.01 250 / 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .upload-overlay {
    animation: none;
    background-color: var(--upload-color-1);
  }
}
</style>
