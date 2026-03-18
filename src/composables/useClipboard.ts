import { ref } from 'vue';

export function useClipboard() {
  const copied = ref(false);

  async function copy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
      return true;
    } catch {
      return false;
    }
  }

  return { copied, copy };
}
