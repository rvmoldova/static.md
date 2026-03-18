<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const pageRef = ref(null)
useReveal(pageRef, { selector: '.reveal', animationClass: 'animate-fade-in-up', stagger: true })

const apiVersions = [
  { version: 'V1', path: '/v1', status: 'Deprecated', statusMod: 'deprecated' },
  { version: 'V2', path: '/v2', status: 'Current Version', statusMod: 'current' },
  { version: 'V3', path: '/v3', status: 'Coming Soon', statusMod: 'soon' },
]
</script>

<template>
  <div ref="pageRef" class="developer">
    <section class="hero" aria-label="API documentation heading">
      <h1 class="reveal headline">API</h1>
      <p class="reveal subheadline">Docs coming soon</p>
    </section>

    <section class="api-section" aria-label="API versions">
      <h2 class="reveal section-title">Versions</h2>
      <ul class="api-list" role="list">
        <li
          v-for="api in apiVersions"
          :key="api.version"
          class="reveal api-row"
          :data-status="api.statusMod"
        >
          <span class="api-version">{{ api.version }}</span>
          <code class="api-path">{{ api.path }}</code>
          <span class="api-status" :class="`api-status--${api.statusMod}`">{{ api.status }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.developer {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
}

.hero {
  margin-top: var(--space-16);
  margin-bottom: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.api-section {
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-border);
}

.api-list {
  list-style: none;
  padding: 0;
  margin: var(--space-6) 0 0;
  display: flex;
  flex-direction: column;
}

.api-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-6);
  padding-block: var(--space-4);
  border-bottom: 1px solid var(--color-border);

  &:first-child {
    border-top: 1px solid var(--color-border);
  }
}

.api-version {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
  width: 2.5rem;
  flex-shrink: 0;
}

.api-path {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  color: var(--color-text);
  flex: 1;
}

.api-status {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--weight-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);

  &--deprecated {
    color: var(--color-accent-warm);
    background-color: oklch(from var(--color-accent-warm) l c h / 0.1);
  }

  &--current {
    color: var(--color-accent);
    background-color: oklch(from var(--color-accent) l c h / 0.1);
  }

  &--soon {
    color: var(--color-text-tertiary);
    background-color: var(--color-surface-sunken);
  }
}
</style>
