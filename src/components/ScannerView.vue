<script setup lang="ts">
import jsQR from 'jsqr';
import { computed, onUnmounted, ref } from 'vue';
import { describeIdentity, mapPayload } from '../qr/mapping';
import type { Identity } from '../bot/types';
import { applyIdentity, go, mote } from '../state/mote';
import { useClock } from '../state/clock';
import BotAvatar from './BotAvatar.vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const pasted = ref('');
const status = ref('Paste a decoded payload, or start the camera and point it at a code.');
const error = ref('');
const found = ref<Identity | null>(null);
const foundText = ref('');
const scanning = ref(false);
const playing = ref(true);
const epoch = ref(0);
const { time } = useClock(playing, epoch);

let stream: MediaStream | null = null;
let frame = 0;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });

const summary = computed(() => (found.value ? describeIdentity(found.value) : ''));

function accept(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    error.value = 'That field is empty.';
    return;
  }
  foundText.value = trimmed;
  found.value = mapPayload(trimmed);
  epoch.value += 1;
  status.value = 'This code sets the shape, colour, and texture. Motion stays as it is.';
  error.value = '';
  stopCamera();
}

function applyPaste() {
  accept(pasted.value);
}

function useBot() {
  if (!found.value) return;
  applyIdentity(found.value);
  go('studio');
}

async function startCamera() {
  error.value = '';
  stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = 'This browser has no camera API. Paste the decoded text instead.';
    return;
  }
  try {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
  } catch {
    error.value = 'Camera access is blocked. Paste the decoded text instead.';
    return;
  }
  scanning.value = true;
  status.value = 'Looking for a code…';
  const video = videoRef.value;
  if (!video) return;
  video.srcObject = stream;
  await video.play();
  frame = requestAnimationFrame(scanFrame);
}

function scanFrame() {
  const video = videoRef.value;
  if (!scanning.value || !video || !context || video.readyState < 2) {
    frame = requestAnimationFrame(scanFrame);
    return;
  }
  const width = 360;
  const height = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * width) || 270);
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);
  const image = context.getImageData(0, 0, width, height);
  const code = jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' });
  if (code?.data) {
    accept(code.data);
    return;
  }
  frame = requestAnimationFrame(scanFrame);
}

function stopCamera() {
  scanning.value = false;
  cancelAnimationFrame(frame);
  if (stream) {
    for (const track of stream.getTracks()) track.stop();
    stream = null;
  }
  if (videoRef.value) videoRef.value.srcObject = null;
}

onUnmounted(stopCamera);
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <section class="rounded-3xl border border-line bg-card p-4">
      <h2 class="font-serif text-3xl">Scan a code</h2>
      <p class="mt-2 text-sm text-muted">
        Point the camera at a QR code, or paste the text it contains. The same payload always rebuilds the same
        shape, colour, and texture. It does not change the motion you are playing.
      </p>
      <div class="mt-4 overflow-hidden rounded-2xl bg-ink">
        <video ref="videoRef" class="aspect-video w-full object-cover" autoplay muted playsinline />
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class="rounded-full bg-ink px-4 py-2 text-sm text-card" @click="startCamera">
          {{ scanning ? 'Restart camera' : 'Start camera' }}
        </button>
        <button v-if="scanning" type="button" class="rounded-full border border-line px-4 py-2 text-sm" @click="stopCamera">
          Stop
        </button>
      </div>
      <p class="mt-3 text-sm" role="status">{{ status }}</p>
      <p v-if="error" class="mt-2 text-sm text-accent-dark">{{ error }}</p>
      <label class="mt-5 block text-xs font-medium tracking-wide text-muted uppercase" for="payload">
        Decoded payload
      </label>
      <textarea
        id="payload"
        v-model="pasted"
        class="mt-1 h-28 w-full resize-none rounded-2xl border border-line bg-paper px-3 py-2 text-sm"
        placeholder="Paste the text from a QR code"
      />
      <button type="button" class="mt-3 rounded-full bg-accent px-4 py-2 text-sm text-white" @click="applyPaste">
        Apply text
      </button>
    </section>
    <section class="rounded-3xl border border-line bg-card p-4">
      <h2 class="font-serif text-2xl">Mapped bot</h2>
      <p v-if="!found" class="mt-3 text-sm text-muted">Nothing scanned yet.</p>
      <template v-else>
        <div class="mx-auto mt-3 max-w-sm">
          <BotAvatar
            :shape="found.shape"
            :mode="found.mode"
            :solid="found.solid"
            :gradient="found.gradient"
            :texture="found.texture"
            :anim="mote.anim"
            :time="time"
            :label="summary"
          />
        </div>
        <p class="mt-3 text-sm">{{ summary }}</p>
        <p class="mt-2 break-all text-xs text-muted">{{ foundText }}</p>
        <button type="button" class="mt-4 rounded-full bg-ink px-4 py-2 text-sm text-card" @click="useBot">
          Use this bot
        </button>
      </template>
    </section>
  </div>
</template>
