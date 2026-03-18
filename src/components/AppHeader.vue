<script setup lang="ts">
import { inject } from 'vue'
import { useRoute } from 'vue-router'
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
          <!-- Chrome icon -->
          <svg
            class="app-header__ext-icon"
            viewBox="0 0 512 512"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M188.8,255.93A67.2,67.2,0,1,0,256,188.75,67.38,67.38,0,0,0,188.8,255.93Z"/>
            <path d="M476.75,217.79s0,0,0,.05a206.63,206.63,0,0,0-7-28.84h-.11a202.16,202.16,0,0,1,7.07,29h0a203.5,203.5,0,0,0-7.07-29H314.24c19.05,17,31.36,40.17,31.36,67.05a86.55,86.55,0,0,1-12.31,44.73L231,478.45a2.44,2.44,0,0,1,0,.27V479h0v-.26A224,224,0,0,0,256,480c6.84,0,13.61-.39,20.3-1a222.91,222.91,0,0,0,29.78-4.74C405.68,451.52,480,362.4,480,255.94A225.25,225.25,0,0,0,476.75,217.79Z"/>
            <path d="M256,345.5c-33.6,0-61.6-17.91-77.29-44.79L76,123.05l-.14-.24A224,224,0,0,0,207.4,474.55l0-.05,77.69-134.6A84.13,84.13,0,0,1,256,345.5Z"/>
            <path d="M91.29,104.57l77.35,133.25A89.19,89.19,0,0,1,256,166H461.17a246.51,246.51,0,0,0-25.78-43.94l.12.08A245.26,245.26,0,0,1,461.17,166h.17a245.91,245.91,0,0,0-25.66-44,2.63,2.63,0,0,1-.35-.26A223.93,223.93,0,0,0,91.14,104.34l.14.24Z"/>
          </svg>
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
  color: oklch(100% 0 0 / 0.95);
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

  // Hide extension and contact on mobile
  .app-header__nav-link--ext,
  .app-header__nav-link--contact {
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
