import { ref } from 'vue';

const STORAGE_KEY = 'theme';

// Shared state (singleton across components)
const isDark = ref(false);

let initialized = false;

export function useTheme() {
  function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(dark: boolean): void {
    isDark.value = dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  function toggle() {
    const newValue = !isDark.value;
    applyTheme(newValue);
    localStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light');
  }

  if (!initialized) {
    initialized = true;

    // Read saved preference or fall back to system
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      applyTheme(saved === 'dark');
    } else {
      applyTheme(getSystemPreference());
    }

    // Listen for OS theme changes (only if no manual override)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent): void => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
  }

  return { isDark, toggle };
}
