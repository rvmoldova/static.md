<script setup lang="ts">
import { ref } from 'vue'
import { X, CloudUpload, AlertCircle } from 'lucide-vue-next'
import { useFocusTrap } from '../composables/useFocusTrap'

const modalRef = ref<HTMLElement | null>(null)
useFocusTrap(modalRef)

const props = defineProps({
  isUploading: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  error: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['upload', 'close'])

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function openFilePicker() {
  if (!props.isUploading) {
    fileInput.value?.click()
  }
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > 0) {
    emit('upload', files)
  }
  // Reset input so the same file can be picked again
  input.value = ''
}

function handleDropZoneDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function handleDropZoneDragLeave() {
  isDragOver.value = false
}

function handleDropZoneDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files || []).filter((f: File) =>
    f.type.startsWith('image/')
  )
  if (files.length > 0) {
    emit('upload', files)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <!-- Backdrop -->
  <div
    ref="modalRef"
    class="modal-wrapper"
    role="dialog"
    aria-modal="true"
    aria-label="Upload images"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
  >
    <div class="modal">
      <!-- Header -->
      <div class="modal__header">
        <h2 class="modal__title">Upload</h2>
        <button
          type="button"
          class="modal__close"
          aria-label="Close upload modal"
          @click="emit('close')"
        >
          <X :size="16" aria-hidden="true" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal__body">
        <!-- State: Uploading -->
        <div v-if="isUploading" class="modal__uploading">
          <div class="modal__progress-label">
            <span>Uploading</span>
            <span class="modal__progress-pct">{{ progress }}%</span>
          </div>
          <div class="modal__progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
            <div class="modal__progress-fill" :style="{ width: progress + '%' }" />
          </div>
          <p class="modal__progress-hint">Please wait…</p>
        </div>

        <!-- State: Error -->
        <div v-else-if="error" class="modal__error">
          <AlertCircle :size="40" aria-hidden="true" class="modal__error-icon" />
          <p class="modal__error-message">{{ error }}</p>
          <button type="button" class="modal__retry-btn" @click="openFilePicker">
            Try again
          </button>
        </div>

        <!-- State: Idle — drop zone -->
        <div
          v-else
          class="modal__dropzone"
          :class="{ 'is-dragover': isDragOver }"
          role="button"
          tabindex="0"
          aria-label="Select files or drop them here"
          @click="openFilePicker"
          @keydown.enter.space.prevent="openFilePicker"
          @dragover="handleDropZoneDragOver"
          @dragleave="handleDropZoneDragLeave"
          @drop="handleDropZoneDrop"
        >
          <CloudUpload :size="48" aria-hidden="true" class="modal__dropzone-icon" />
          <p class="modal__dropzone-primary">Select files or drop them here</p>
          <p class="modal__dropzone-hint">Or press <kbd>Ctrl+V</kbd> to paste from clipboard</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal__footer">
        <button type="button" class="modal__cancel-btn" @click="emit('close')">
          Cancel
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="modal__file-input"
        aria-hidden="true"
        tabindex="-1"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ── Backdrop ─────────────────────────────────────────────────────────────────
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background-color: var(--color-overlay);
  backdrop-filter: blur(2px);
}

// ── Modal panel ───────────────────────────────────────────────────────────────
.modal {
  position: relative;
  width: 100%;
  max-width: 480px;
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── Header ────────────────────────────────────────────────────────────────────
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal__title {
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-normal);
  color: var(--color-text);
  margin: 0;
  text-transform: uppercase;
}

.modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out-quart),
    border-color var(--duration-fast) var(--ease-out-quart),
    background-color var(--duration-fast) var(--ease-out-quart);

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    color: var(--color-text);
    border-color: var(--color-border);
    background-color: var(--color-surface-sunken);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

// ── Body ──────────────────────────────────────────────────────────────────────
.modal__body {
  padding: var(--space-6);
  flex: 1;
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
.modal__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-6);
  border: 2px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: center;
  transition:
    border-color var(--duration-fast) var(--ease-out-quart),
    background-color var(--duration-fast) var(--ease-out-quart);

  &:hover,
  &:focus-visible,
  &.is-dragover {
    border-color: var(--color-primary);
    background-color: var(--color-primary-surface);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.modal__dropzone-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-text-tertiary);
  transition: color var(--duration-fast) var(--ease-out-quart);

  .modal__dropzone:hover &,
  .modal__dropzone.is-dragover & {
    color: var(--color-primary);
  }
}

.modal__dropzone-primary {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin: 0;
  letter-spacing: var(--tracking-normal);
}

.modal__dropzone-hint {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 0;

  kbd {
    display: inline-block;
    padding: 0 var(--space-1);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    background-color: var(--color-surface-sunken);
  }
}

// ── Uploading state ───────────────────────────────────────────────────────────
.modal__uploading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) 0;
}

.modal__progress-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.modal__progress-pct {
  font-weight: var(--weight-bold);
  color: var(--color-text);
  font-size: var(--text-base);
}

.modal__progress-track {
  height: 6px;
  background-color: var(--color-surface-sunken);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.modal__progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-fast) var(--ease-out-quart);
  min-width: 2px;
}

.modal__progress-hint {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 0;
  text-align: right;
}

// ── Error state ───────────────────────────────────────────────────────────────
.modal__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) 0;
  text-align: center;
}

.modal__error-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-accent-warm);
}

.modal__error-message {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 32ch;
  line-height: var(--leading-normal);
}

.modal__retry-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-6);
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  cursor: pointer;
  letter-spacing: var(--tracking-normal);
  transition:
    background-color var(--duration-fast) var(--ease-out-quart),
    border-color var(--duration-fast) var(--ease-out-quart);

  &:hover {
    background-color: var(--color-border);
    border-color: var(--color-border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal__cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-4);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out-quart),
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

// ── Hidden file input ─────────────────────────────────────────────────────────
.modal__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// ── Responsive ────────────────────────────────────────────────────────────────
@media (max-width: 480px) {
  .modal-wrapper {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    max-width: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal__progress-fill {
    transition: none;
  }
}
</style>
