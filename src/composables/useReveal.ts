import { onMounted, onUnmounted, Ref } from 'vue';

interface RevealOptions {
  selector?: string
  threshold?: number
  rootMargin?: string
  animationClass?: string
  stagger?: boolean
}

export function useReveal(containerRef?: Ref<HTMLElement | null>, options: RevealOptions = {}) {
  const {
    selector = '.reveal',
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    animationClass = 'animate-fade-in-up',
    stagger = true,
  } = options;

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const container = containerRef?.value || document;

    // If user prefers reduced motion, show all content immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const elements = container.querySelectorAll(selector);
      elements.forEach((el: Element) => {
        el.classList.add(animationClass);
      });
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass);
            observer!.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const elements = container.querySelectorAll(selector);
    elements.forEach((el: Element, index: number) => {
      // Set stagger index for CSS delay
      if (stagger) {
        (el as HTMLElement).style.setProperty('--stagger-index', String(index));
        el.classList.add('stagger');
      }
      // Start invisible
      (el as HTMLElement).style.opacity = '0';
      observer!.observe(el);
    });
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });
}
