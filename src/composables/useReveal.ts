import { onMounted, onUnmounted, Ref } from 'vue';

interface RevealOptions {
  selector?: string
  threshold?: number
  rootMargin?: string
  animationClass?: string
  stagger?: boolean
  staggerDelay?: number
}

export function useReveal(containerRef?: Ref<HTMLElement | null>, options: RevealOptions = {}) {
  const {
    selector = '.reveal',
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    animationClass = 'animate-fade-in-up',
    stagger = true,
    staggerDelay = 80,
  } = options;

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const container = containerRef?.value || document;

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
