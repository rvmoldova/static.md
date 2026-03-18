<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { message, visible } = useToast()
</script>

<template>
  <Transition name="toast">
    <div
      v-if="visible"
      class="toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="toast__message">{{ message }}</span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.toast {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);

  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);

  background-color: var(--color-text);
  color: var(--color-surface);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);

  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  letter-spacing: var(--tracking-normal);

  // Prevent layout overflow on narrow viewports
  max-width: calc(100vw - var(--space-8));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Toast transition
.toast-enter-active {
  transition:
    opacity var(--duration-normal) var(--ease-out-quart),
    transform var(--duration-normal) var(--ease-out-quart);
}

.toast-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-in),
    transform var(--duration-fast) var(--ease-in);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity var(--duration-fast) linear;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateX(-50%);
  }
}
</style>
