<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Copy, Check } from 'lucide-vue-next'
import { useClipboard } from '../composables/useClipboard'
import { useToast } from '../composables/useToast'
import { useFocusTrap } from '../composables/useFocusTrap'

const modalRef = ref<HTMLElement | null>(null)
useFocusTrap(modalRef)

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
const linkCopied = ref(false)
const codeCopied = ref(false)

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
  if (ok) {
    toast.show('Gallery link copied!')
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 1500)
  }
}

async function copyCode() {
  const ok = await copy(activeCode.value)
  if (ok) {
    toast.show('Embed code copied!')
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 1500)
  }
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function onTabKeydown(e: KeyboardEvent) {
  const currentIndex = tabs.findIndex(t => t.id === activeTab.value)
  let nextIndex = -1

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    nextIndex = (currentIndex + 1) % tabs.length
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
  } else if (e.key === 'Home') {
    e.preventDefault()
    nextIndex = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    nextIndex = tabs.length - 1
  }

  if (nextIndex >= 0) {
    activeTab.value = tabs[nextIndex].id
    const tabEl = document.getElementById(`tab-${tabs[nextIndex].id}`)
    tabEl?.focus()
  }
}
</script>

<template>
  <div
    ref="modalRef"
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
          <X :size="16" aria-hidden="true" />
        </button>
      </header>

      <div class="modal-body">
        <!-- Gallery link -->
        <div class="field">
          <p class="field-label">Gallery link</p>
          <div class="input-wrap">
            <input
              type="text"
              class="code-input"
              :value="embedCodes.galleryLink"
              readonly
              aria-label="Gallery link URL"
              @click="copyLink"
            />
            <button
              type="button"
              class="inline-copy-btn"
              :class="{ 'is-copied': linkCopied }"
              aria-label="Copy gallery link"
              @click="copyLink"
            >
              <Check v-if="linkCopied" :size="14" aria-hidden="true" />
              <Copy v-else :size="14" aria-hidden="true" />
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
                :id="`tab-${tab.id}`"
                type="button"
                role="tab"
                class="tab-btn"
                :class="{ 'tab-btn--active': activeTab === tab.id }"
                :aria-selected="activeTab === tab.id"
                :aria-controls="`tabpanel-${tab.id}`"
                :tabindex="activeTab === tab.id ? 0 : -1"
                @click="activeTab = tab.id"
                @keydown="onTabKeydown"
              >{{ tab.label }}</button>
            </div>
          </div>
          <div
            :id="`tabpanel-${activeTab}`"
            role="tabpanel"
            :aria-labelledby="`tab-${activeTab}`"
            class="textarea-wrap"
          >
            <textarea
              class="code-textarea"
              :value="activeCode"
              readonly
              rows="5"
              aria-label="Embed code"
              @click="copyCode"
            />
            <button
              type="button"
              class="textarea-copy-btn"
              :class="{ 'is-copied': codeCopied }"
              aria-label="Copy embed code"
              @click="copyCode"
            >
              <Check v-if="codeCopied" :size="14" aria-hidden="true" />
              <Copy v-else :size="14" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  backdrop-filter: blur(2px);
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
  max-width: 480px;
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
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-8);
  height: var(--space-8);
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
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
  gap: var(--space-3);
}

.field-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
.tabs {
  display: flex;
  gap: 1px;
  background-color: var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.tab-btn {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: var(--space-1) var(--space-3);
  min-height: 28px;
  border: none;
  background: var(--color-surface-raised);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-sunken);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  &--active {
    color: var(--color-primary-text);
    background-color: var(--color-primary-surface);
  }
}

// ── Gallery link input with inline copy button ────────────────────────────────
.input-wrap {
  position: relative;
}

.code-input {
  width: 100%;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    border-color: var(--color-border-strong);
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-color: var(--color-primary);
  }
}

.inline-copy-btn {
  position: absolute;
  right: var(--space-1);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-raised);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &.is-copied {
    color: var(--color-accent);
  }
}

// ── Textarea with corner copy button ──────────────────────────────────────────
.textarea-wrap {
  position: relative;
}

.code-textarea {
  width: 100%;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  padding-top: var(--space-2);
  resize: none;
  cursor: pointer;
  line-height: var(--leading-normal);
  transition: border-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    border-color: var(--color-border-strong);
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-color: var(--color-primary);
  }
}

.textarea-copy-btn {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background-color: var(--color-surface-sunken);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart),
              background-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    color: var(--color-text);
    background-color: var(--color-surface-raised);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &.is-copied {
    color: var(--color-accent);
  }
}

// ── Responsive ────────────────────────────────────────────────────────────────
@media (max-width: 480px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal-container {
    max-width: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-container {
    animation: none;
  }
}
</style>
