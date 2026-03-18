<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const pageRef = ref(null)
useReveal(pageRef, { selector: '.reveal', animationClass: 'animate-fade-in-up', stagger: true })
</script>

<template>
  <div ref="pageRef" class="contact">
    <section class="hero" aria-label="Contact heading">
      <h1 class="reveal headline">We love &lt;3 new friends!</h1>
      <p class="reveal subheadline">Contact Us!</p>
    </section>

    <section class="section" aria-label="Email">
      <h2 class="reveal section-title">Email</h2>
      <div class="reveal contact-item">
        <a class="contact-link" href="mailto:salut@static.md">salut@static.md</a>
        <span class="contact-desc">Do you have anything to tell me? Let's talk!</span>
      </div>
    </section>

    <section class="section" aria-label="Social media">
      <h2 class="reveal section-title">Social media</h2>
      <ul class="contact-list" role="list">
        <li class="reveal contact-item">
          <a
            class="contact-link"
            href="https://www.facebook.com/staticmd/"
            target="_blank"
            rel="noopener noreferrer"
          >Facebook</a>
          <span class="contact-desc">Here we share our updates and news</span>
        </li>
        <li class="reveal contact-item">
          <a
            class="contact-link"
            href="https://twitter.com/staticmd/"
            target="_blank"
            rel="noopener noreferrer"
          >Twitter</a>
          <span class="contact-desc">Here we share our updates and news</span>
        </li>
      </ul>
    </section>

    <section class="section" aria-label="Creator">
      <h2 class="reveal section-title">My Creator :)</h2>
      <div class="reveal contact-item">
        <a
          class="contact-link"
          href="https://www.linkedin.com/in/rvmdl/"
          target="_blank"
          rel="noopener noreferrer"
        >Vadim</a>
        <span class="contact-desc">Want bootstrap a cool project? We can help!</span>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.contact {
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

.section {
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-border);

  & + .section {
    margin-top: var(--space-8);
  }
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-4);
}

.contact-list .contact-item {
  margin-top: 0;
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
