<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <!-- Copyright -->
      <p class="app-footer__copy">
        <a
          href="https://www.linkedin.com/in/rvmdl/"
          class="app-footer__copy-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Author's LinkedIn profile"
        >© {{ currentYear }}</a>
        <span class="app-footer__copy-sep" aria-hidden="true">·</span>
        <span class="app-footer__copy-tagline">static.md</span>
      </p>

      <!-- Nav links -->
      <nav class="app-footer__nav" aria-label="Footer navigation">
        <router-link to="/contact" class="app-footer__nav-link app-footer__nav-link--mobile-only">Contact</router-link>
        <router-link to="/privacy" class="app-footer__nav-link">Terms &amp; Privacy</router-link>
      </nav>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface-raised);
  transition:
    background-color var(--duration-normal) var(--ease-out-quart),
    border-color var(--duration-normal) var(--ease-out-quart);
}

.app-footer__inner {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-6) var(--content-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  flex-wrap: wrap;
}

// ── Copyright ────────────────────────────────────────────────────────────────
.app-footer__copy {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

.app-footer__copy-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
}

.app-footer__copy-sep {
  color: var(--color-border-strong);
}

.app-footer__copy-tagline {
  letter-spacing: var(--tracking-normal);
}

// ── Nav ──────────────────────────────────────────────────────────────────────
.app-footer__nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.app-footer__nav-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--duration-fast) var(--ease-out-quart),
    background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text-secondary);
    background-color: var(--color-surface-sunken);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  // Router active link
  &.router-link-exact-active {
    color: var(--color-text-secondary);
  }

  // Contact link — only visible on mobile (hidden in header there)
  &--mobile-only {
    display: none;
  }
}

@media (max-width: 640px) {
  .app-footer__inner {
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-4) var(--content-padding);
  }

  .app-footer__nav-link--mobile-only {
    display: inline-flex;
  }
}
</style>
