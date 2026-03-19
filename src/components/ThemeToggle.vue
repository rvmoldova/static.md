<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <span class="icon-wrap" :class="{ 'is-dark': isDark }">
      <!-- Sun icon — shown in dark mode -->
      <Sun v-if="isDark" :size="16" aria-hidden="true" class="icon icon-sun" />
      <!-- Moon icon — shown in light mode -->
      <Moon v-else :size="16" aria-hidden="true" class="icon icon-moon" />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out-quart),
    background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-sunken);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.92);
  }
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--duration-normal) var(--ease-out-quart);

  &.is-dark {
    transform: rotate(30deg);
  }
}

.icon {
  width: 1rem;
  height: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .icon-wrap {
    transition: none;
  }

  .theme-toggle:active {
    transform: none;
  }
}
</style>
