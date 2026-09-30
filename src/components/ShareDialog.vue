<script setup lang="ts">
import QRCode from 'qrcode';
import { computed, ref, watch } from 'vue';
import { describeSelection, selectionToPayload } from '../qr/mapping';
import { currentSelection, mote } from '../state/mote';

const dataUrl = ref('');
const note = ref('');
const payload = computed(() => selectionToPayload(currentSelection()));
const summary = computed(() => describeSelection(currentSelection()));
const pageLink = computed(() => {
  const url = new URL(window.location.href);
  url.hash = payload.value;
  return url.toString();
});

watch(
  () => [mote.shareOpen, payload.value] as const,
  async ([open, text]) => {
    if (!open) return;
    note.value = '';
    dataUrl.value = await QRCode.toDataURL(text, {
      margin: 1,
      width: 360,
      errorCorrectionLevel: 'M',
      color: { dark: '#1e1a16', light: '#fffdf9' },
    });
  },
  { immediate: true },
);

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    note.value = `${label} copied.`;
  } catch {
    note.value = 'Copy was blocked. Select the text and copy it yourself.';
  }
}

function download() {
  const link = document.createElement('a');
  link.href = dataUrl.value;
  link.download = 'mote-qr.png';
  link.click();
}

function close() {
  mote.shareOpen = false;
}
</script>

<template>
  <div
    v-if="mote.shareOpen"
    class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
    role="presentation"
    @click.self="close"
  >
    <div
      class="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 id="share-title" class="font-serif text-2xl">My QR</h2>
          <p class="mt-1 text-sm text-muted">Anyone who scans this code gets this exact bot.</p>
        </div>
        <button type="button" class="rounded-full px-3 py-1 text-sm text-muted hover:bg-paper" @click="close">
          Close
        </button>
      </div>
      <img v-if="dataUrl" :src="dataUrl" alt="QR code for this bot" class="mx-auto mt-4 w-56 rounded-2xl bg-white" />
      <p class="mt-3 text-center text-sm">{{ summary }}</p>
      <label class="mt-4 block text-xs font-medium tracking-wide text-muted uppercase">Payload</label>
      <textarea
        readonly
        class="mt-1 h-20 w-full resize-none rounded-2xl border border-line bg-paper px-3 py-2 text-xs"
        :value="payload"
      />
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class="rounded-full bg-ink px-4 py-2 text-sm text-card" @click="copy(payload, 'Payload')">
          Copy payload
        </button>
        <button type="button" class="rounded-full bg-accent px-4 py-2 text-sm text-white" @click="download">
          Download PNG
        </button>
        <button type="button" class="rounded-full border border-line px-4 py-2 text-sm" @click="copy(pageLink, 'Link')">
          Copy link
        </button>
      </div>
      <p class="mt-3 min-h-5 text-sm text-muted" role="status">{{ note }}</p>
    </div>
  </div>
</template>
