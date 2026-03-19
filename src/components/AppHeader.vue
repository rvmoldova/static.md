<script setup lang="ts">
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { Chromium } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import type { useUpload } from '../composables/useUpload'

const route = useRoute()
const upload = inject<ReturnType<typeof useUpload>>('upload')!

const EXT_URL = 'https://chromewebstore.google.com/detail/staticshot-screenshot-cap/bbgoenllpdnfljjapjcababahphohncj'

function openUpload() {
  upload.openModal()
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <!-- Logo -->
      <router-link to="/" class="app-header__logo" aria-label="static.md home">
        <img
          src="../assets/images/static_logo.svg"
          alt=""
          class="app-header__logo-img"
          aria-hidden="true"
          width="32"
          height="32"
        />
        <span class="app-header__logo-text">static<span class="app-header__logo-dot">.md</span></span>
      </router-link>

      <!-- Nav -->
      <nav class="app-header__nav" aria-label="Main navigation">
        <router-link
          to="/contact"
          class="app-header__nav-link app-header__nav-link--contact"
          :class="{ 'is-active': route.path === '/contact' }"
        >
          Contact
        </router-link>

        <a
          :href="EXT_URL"
          class="app-header__nav-link app-header__nav-link--ext"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Chromium class="app-header__ext-icon" :size="15" aria-hidden="true" />
          <span class="ext-text">Get Extension</span>
        </a>

        <ThemeToggle />

        <button type="button" class="app-header__upload-btn" @click="openUpload" aria-label="Upload images">
          Upload
        </button>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--duration-normal) var(--ease-out-quart),
              border-color var(--duration-normal) var(--ease-out-quart);
}

.app-header__inner {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 var(--content-padding);
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

// ── Logo ────────────────────────────────────────────────────────────────────
.app-header__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-text);
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }
}

.app-header__logo-img {
  width: 1.75rem;
  height: 1.75rem;
  display: block;
}

.app-header__logo-text {
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.app-header__logo-dot {
  color: var(--color-primary);
}

// ── Nav ─────────────────────────────────────────────────────────────────────
.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.app-header__nav-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  color: var(--color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
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

  &.is-active {
    color: var(--color-text);
    background-color: var(--color-surface-sunken);

    &::before {
      content: '›';
      margin-right: var(--space-1);
      color: var(--color-primary);
    }
  }

  // External link — no active state indicator
  &--ext {
    gap: var(--space-2);

    &.is-active::before {
      display: none;
    }
  }
}

.app-header__ext-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

// ── Upload button ────────────────────────────────────────────────────────────
.app-header__upload-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-6);
  margin-left: var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-normal);
  color: oklch(from var(--color-on-primary) l c h / 0.95);
  background-color: var(--upload-color-1);
  cursor: pointer;
  animation: upload-cycle 3s ease-in-out infinite;
  transition: opacity var(--duration-fast) var(--ease-out-quart),
              transform var(--duration-fast) var(--ease-out-quart);

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}

@keyframes upload-cycle {
  0%   { background-color: var(--upload-color-1); }
  33%  { background-color: var(--upload-color-2); }
  66%  { background-color: var(--upload-color-3); }
  100% { background-color: var(--upload-color-1); }
}

// ── Responsive ───────────────────────────────────────────────────────────────
@media (max-width: 640px) {
  .app-header__inner {
    height: 3rem;
    padding-top: 0;
    padding-bottom: 0;
    gap: var(--space-2);
    flex-wrap: nowrap;
  }

  .app-header__nav {
    flex-wrap: nowrap;
    gap: var(--space-1);
    overflow: hidden;
  }

  .app-header__nav-link {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
  }

  // Hide contact and extension links on mobile
  .app-header__nav-link--contact,
  .app-header__nav-link--ext {
    display: none;
  }

  .app-header__upload-btn {
    padding: var(--space-1) var(--space-3);
    margin-left: 0;
    font-size: var(--text-xs);
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header__upload-btn {
    animation: none;
    background-color: var(--upload-color-1);
  }
}

</style>
