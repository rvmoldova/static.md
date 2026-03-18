import { ref } from 'vue';

const message = ref('');
const visible = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  function show(msg: string, duration = 3000): void {
    message.value = msg;
    visible.value = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      visible.value = false;
    }, duration);
  }

  return { message, visible, show };
}
