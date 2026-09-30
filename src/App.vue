<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import ScannerView from './components/ScannerView.vue';
import ShareDialog from './components/ShareDialog.vue';
import StudioView from './components/StudioView.vue';
import { CATALOG_COUNTS } from './bot/catalog';
import { go, initMote, mote } from './state/mote';

const nav = [
  { id: 'studio', label: 'Studio' },
  { id: 'scanner', label: 'Scanner' },
] as const;

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') mote.shareOpen = false;
}

onMounted(() => {
  initMote();
  window.addEventListener('keydown', onKey);
});
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="min-h-dvh">
    <header class="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p class="font-serif text-2xl leading-none">Mote</p>
          <p class="text-xs text-muted">Morphing bot avatar</p>
        </div>
        <nav class="flex gap-1 rounded-full bg-card p-1" aria-label="Primary">
          <button
            v-for="item in nav"
            :key="item.id"
            type="button"
            class="rounded-full px-3 py-1.5 text-sm"
            :class="mote.view === item.id ? 'bg-ink text-card' : 'text-muted'"
            :aria-current="mote.view === item.id ? 'page' : undefined"
            @click="go(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6">
      <StudioView v-if="mote.view === 'studio'" />
      <ScannerView v-else />
    </main>
    <footer class="mx-auto max-w-6xl px-4 pb-10 text-xs leading-5 text-muted">
      <p>
        {{ CATALOG_COUNTS.shapes }} shapes · {{ CATALOG_COUNTS.animations }} motions ·
        {{ CATALOG_COUNTS.solids }} solids · {{ CATALOG_COUNTS.gradients }} gradients ·
        {{ CATALOG_COUNTS.textures }} textures
      </p>
      <p class="mt-2">
        Inspired by the radial-profile bot in bloub. Not affiliated with, endorsed by, or connected to x.ai.
      </p>
    </footer>
    <ShareDialog />
  </div>
</template>
