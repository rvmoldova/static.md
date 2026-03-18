<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '../composables/useClipboard'
import { useToast } from '../composables/useToast'

const props = defineProps({
  galleryId: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close'])

const { copy } = useClipboard()
const toast = useToast()

const activeTab = ref('html')
const tabs = [
  { id: 'html', label: 'HTML' },
  { id: 'bbcode', label: 'BBCode' },
  { id: 'links', label: 'Links' },
]

const embedCodes = computed(() => {
  const galleryLink = `${window.location.host}/g/${props.galleryId}`
  const imgs = props.images as Array<{ url: string; size: { w: number; h: number } }>

  const html = imgs
    .map(img => `<a href="${img.url}"><img src="${img.url}" border="0" />static.md</a>`)
    .join('\n')

  const bbcode = imgs
    .map(img => `[url=${img.url}][img]${img.url}[/img][/url]`)
    .join('\n')

  const links = imgs
    .map(img => img.url)
    .join('\n')

  return { galleryLink, html, bbcode, links }
})

const activeCode = computed(() => {
  const codes = embedCodes.value
  if (activeTab.value === 'html') return codes.html
  if (activeTab.value === 'bbcode') return codes.bbcode
  return codes.links
})

async function copyLink() {
  const ok = await copy(embedCodes.value.galleryLink)
  if (ok) toast.show('Gallery link copied!')
}

async function copyCode() {
  const ok = await copy(activeCode.value)
  if (ok) toast.show('Embed code copied!')
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="embed-modal-title"
    @click="onBackdropClick"
    @keydown="onKeydown"
  >
    <div class="modal-container">
      <header class="modal-header">
        <h2 id="embed-modal-title" class="modal-title">Embed gallery</h2>
        <button
          type="button"
          class="close-btn"
          aria-label="Close embed modal"
          @click="emit('close')"
        >
          <!-- X icon -->
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <div class="modal-body">
        <!-- Gallery link -->
        <div class="field">
          <p class="field-label">Gallery link</p>
          <div class="input-row">
            <input
              type="text"
              class="code-input"
              :value="embedCodes.galleryLink"
              readonly
              aria-label="Gallery link URL"
              @click="copyLink"
            />
            <button type="button" class="copy-btn" aria-label="Copy gallery link" @click="copyLink">
              <!-- Clipboard icon -->
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="2" width="8" height="11" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 4H2a1 1 0 00-1 1v9a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Embed codes -->
        <div class="field">
          <div class="field-header">
            <p class="field-label">Embed codes</p>
            <div class="tabs" role="tablist" aria-label="Embed code format">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                class="tab-btn"
                :class="{ 'tab-btn--active': activeTab === tab.id }"
                :aria-selected="activeTab === tab.id"
                @click="activeTab = tab.id"
              >{{ tab.label }}</button>
            </div>
          </div>
          <div class="input-row">
            <textarea
              class="code-textarea"
              :value="activeCode"
              readonly
              rows="5"
              aria-label="Embed code"
              @click="copyCode"
            />
            <button type="button" class="copy-btn copy-btn--top" aria-label="Copy embed code" @click="copyCode">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="2" width="8" height="11" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 4H2a1 1 0 00-1 1v9a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button type="button" class="footer-close-btn" @click="emit('close')">
          <!-- X icon inline -->
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>close</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-container {
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 520px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  animation: fade-in-up var(--duration-normal) var(--ease-out-quart) both;

  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-normal);
  color: var(--color-text);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-sunken);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.modal-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.field-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
}

.tabs {
  display: flex;
  gap: var(--space-1);
}

.tab-btn {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart),
              border-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &--active {
    color: var(--color-primary-text);
    background-color: var(--color-primary-surface);
    border-color: var(--color-primary-surface);
  }
}

.input-row {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
}

.code-input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out-quart);

  &:hover,
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.code-textarea {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  resize: none;
  cursor: pointer;
  line-height: var(--leading-normal);
  transition: border-color var(--duration-fast) var(--ease-out-quart);

  &:hover,
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.copy-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-sunken);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart),
              border-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-raised);
    border-color: var(--color-border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &--top {
    align-self: flex-start;
  }
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

.footer-close-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              border-color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    background-color: var(--color-surface-sunken);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
</style>
