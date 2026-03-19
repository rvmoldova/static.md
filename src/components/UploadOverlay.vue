<script setup lang="ts">
import { CloudUpload } from 'lucide-vue-next'
</script>

<template>
  <div class="upload-overlay" aria-hidden="true">
    <div class="upload-overlay__inner">
      <CloudUpload :size="56" aria-hidden="true" class="upload-overlay__icon" />
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
    border: 2px dashed oklch(from var(--color-on-primary) l c h / 0.6);
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
  color: oklch(from var(--color-on-primary) l c h / 0.92);
}

.upload-overlay__icon {
  width: 3.5rem;
  height: 3.5rem;
  opacity: 0.85;
  filter: drop-shadow(0 2px 8px oklch(from var(--color-shadow) l c h / 0.3));
}

.upload-overlay__label {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-normal);
  text-transform: uppercase;
  text-shadow: 0 2px 12px oklch(from var(--color-shadow) l c h / 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .upload-overlay {
    animation: none;
    background-color: var(--upload-color-1);
  }
}
</style>
