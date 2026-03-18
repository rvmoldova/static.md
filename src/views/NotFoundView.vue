<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const pageRef = ref(null)
useReveal(pageRef, { selector: '.reveal', animationClass: 'animate-fade-in-up', stagger: true })
</script>

<template>
  <div ref="pageRef" class="not-found">
    <section class="terminal-block" aria-label="404 error">
      <div class="reveal terminal-header">
        <span class="terminal-dot" aria-hidden="true"></span>
        <span class="terminal-dot" aria-hidden="true"></span>
        <span class="terminal-dot" aria-hidden="true"></span>
      </div>
      <div class="terminal-body">
        <p class="reveal terminal-line">
          <span class="terminal-prompt" aria-hidden="true">$ </span>
          <span>GET /{{ $route.path }}</span>
        </p>
        <p class="reveal terminal-error">Error: 404 — Not Found</p>
        <p class="reveal terminal-line secondary">
          Don't worry, go to the
          <RouterLink class="terminal-link" to="/">homepage</RouterLink>.
          Ș tăt a s fie ghini.
        </p>
        <p class="reveal terminal-cursor" aria-hidden="true">_</p>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
  margin-top: var(--space-16);
}

.terminal-block {
  max-width: 600px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-sunken);
  overflow: hidden;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface-raised);
}

.terminal-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: var(--color-border-strong);

  &:nth-child(1) { background-color: var(--color-accent-warm); }
  &:nth-child(2) { background-color: oklch(75% 0.16 85); }
  &:nth-child(3) { background-color: var(--color-accent); }
}

.terminal-body {
  padding: var(--space-6) var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.terminal-line {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);

  &.secondary {
    color: var(--color-text-tertiary);
    margin-top: var(--space-4);
  }
}

.terminal-prompt {
  color: var(--color-accent);
  user-select: none;
}

.terminal-error {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  text-transform: uppercase;
  margin-block: var(--space-4);
}

.terminal-link {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 0.15em;
  text-decoration-thickness: 1px;
  transition: color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-primary-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
}

.terminal-cursor {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-primary);
  animation: blink 1.2s step-end infinite;
  margin-top: var(--space-2);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .terminal-cursor {
    animation: none;
  }
}
</style>
