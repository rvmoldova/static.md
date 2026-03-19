<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const pageRef = ref(null)
useReveal(pageRef, { selector: '.reveal', animationClass: 'animate-fade-in-up', stagger: true })

const capabilities = [
  { cmd: 'drop', desc: 'Drag files anywhere on this page' },
  { cmd: 'paste', desc: 'Ctrl+V from clipboard' },
  { cmd: 'upload', desc: 'Pick files via the upload button' },
  { cmd: 'share', desc: 'Get a gallery link instantly' },
  { cmd: 'embed', desc: 'HTML, BBCode, or direct links' },
  { cmd: 'resize', desc: 'On-the-fly via URL parameter' },
  { cmd: 'dedup', desc: 'Content-hash based detection' },
  { cmd: 'capture', desc: 'Chrome extension for screenshots', href: 'https://chromewebstore.google.com/detail/staticshot-screenshot-cap/bbgoenllpdnfljjapjcababahphohncj' },
]
</script>

<template>
  <div ref="pageRef" class="home">
    <section class="hero" aria-label="Welcome">
      <h1 class="hero-reveal headline">Hello</h1>
      <p class="hero-reveal subheadline" style="--hero-delay: 120ms">Free image hosting</p>
      <p class="hero-reveal usage-hint" style="--hero-delay: 240ms" aria-label="Quick start instructions">
        Drop images anywhere&nbsp;&nbsp;·&nbsp;&nbsp;Paste from clipboard&nbsp;&nbsp;·&nbsp;&nbsp;Get a shareable link
      </p>
    </section>

    <section class="capabilities" aria-label="Capabilities">
      <div class="terminal reveal">
        <div class="terminal__bar">
          <span class="terminal__dot" aria-hidden="true" />
          <span class="terminal__dot" aria-hidden="true" />
          <span class="terminal__dot" aria-hidden="true" />
          <span class="terminal__title">static.md</span>
        </div>
        <div class="terminal__body">
          <div
            v-for="(cap, i) in capabilities"
            :key="cap.cmd"
            class="terminal__line"
            :style="{ '--stagger-index': i }"
          >
            <span class="terminal__prompt" aria-hidden="true">$</span>
            <span class="terminal__cmd">{{ cap.cmd }}</span>
            <span class="terminal__sep" aria-hidden="true">—</span>
            <a v-if="cap.href" class="terminal__desc terminal__desc--link" :href="cap.href" target="_blank" rel="noopener noreferrer">{{ cap.desc }}</a>
            <span v-else class="terminal__desc">{{ cap.desc }}</span>
          </div>
          <p class="terminal__cursor" aria-hidden="true">_</p>
        </div>
      </div>
    </section>

    <section class="contact-section" aria-label="Contact">
      <h2 class="reveal section-title">Contact</h2>
      <div class="reveal contact-item">
        <a class="contact-link" href="mailto:salut@static.md">salut@static.md</a>
        <span class="contact-desc">Questions, abuse reports, removal requests</span>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--content-padding);
  padding-bottom: var(--space-24);
}

// ── Hero ───────────────────────────────────────────────────────────────────

@keyframes hero-reveal {
  from { opacity: 0; transform: scale(1.04); filter: blur(4px); }
  to   { opacity: 1; transform: scale(1);    filter: blur(0); }
}

.hero-reveal {
  animation: hero-reveal var(--duration-entrance) var(--ease-out-quart) both;
  animation-delay: var(--hero-delay, 0ms);
}

.hero {
  margin-top: var(--space-16);
  margin-bottom: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.usage-hint {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-normal);
}

// ── Capabilities (terminal) ───────────────────────────────────────────────

.capabilities {
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-border);
  margin-bottom: var(--space-16);
}

.terminal {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-surface-sunken);
}

.terminal__bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface-raised);
}

.terminal__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-border-strong);

  &:nth-child(1) { background-color: oklch(60% 0.18 25); }
  &:nth-child(2) { background-color: oklch(72% 0.16 85); }
  &:nth-child(3) { background-color: oklch(60% 0.15 145); }
}

.terminal__title {
  margin-left: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.04em;
}

.terminal__body {
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.terminal__line {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  font-size: var(--text-sm);
  line-height: 1.8;
}

.terminal__prompt {
  color: var(--color-accent);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
  user-select: none;
}

.terminal__cmd {
  color: var(--color-primary);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
  white-space: nowrap;
}

.terminal__sep {
  color: var(--color-border-strong);
  flex-shrink: 0;
}

.terminal__desc {
  color: var(--color-text-secondary);

  &--link {
    text-decoration: underline;
    text-underline-offset: 0.15em;
    text-decoration-thickness: 1px;
    transition: color var(--duration-fast) var(--ease-out-quart);

    &:hover {
      color: var(--color-primary);
    }
  }
}


.terminal__cursor {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-primary);
  animation: blink 1.2s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

@media (max-width: 480px) {
  .hero {
    margin-top: var(--space-8);
    margin-bottom: var(--space-12);
  }

  .usage-hint {
    display: none;
  }

  .terminal__body {
    padding: var(--space-3) var(--space-4);
  }

  // Stack each terminal line: prompt+cmd on one row, desc below
  .terminal__line {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: auto auto;
    column-gap: var(--space-2);
    row-gap: 0;
    align-items: baseline;
  }

  .terminal__prompt {
    grid-column: 1;
    grid-row: 1;
  }

  .terminal__cmd {
    grid-column: 2;
    grid-row: 1;
  }

  .terminal__sep {
    display: none;
  }

  .terminal__desc {
    grid-column: 1 / -1;
    grid-row: 2;
    padding-left: calc(1ch + var(--space-2));
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    padding-bottom: var(--space-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-reveal {
    animation: none;
    opacity: 1;
  }

  .terminal__cursor {
    animation: none;
  }
}

// ── Contact ───────────────────────────────────────────────────────────────

.contact-section {
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-border);
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-4);
}

.contact-link {
  font-size: var(--text-lg);
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

.contact-desc {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
