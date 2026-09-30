<script setup lang="ts">
import { computed, ref } from 'vue';
import { ANIMATIONS } from '../bot/animations';
import { STAGE_PAPER } from '../bot/geometry';
import { describeSelection } from '../qr/mapping';
import { useClock } from '../state/clock';
import { currentSelection, mote } from '../state/mote';
import BotAvatar from './BotAvatar.vue';
import PickerPanels from './PickerPanels.vue';

const tabs = [
  { id: 'shape', label: 'Shape' },
  { id: 'colour', label: 'Colour' },
  { id: 'texture', label: 'Texture' },
  { id: 'motion', label: 'Motion' },
] as const;

const activeTab = ref<(typeof tabs)[number]['id']>('shape');
const { time } = useClock(
  computed(() => mote.playing),
  computed(() => mote.epoch),
);

const anim = computed(() => ANIMATIONS[mote.anim] ?? ANIMATIONS[0]);
const summary = computed(() => describeSelection(currentSelection()));
const label = computed(() => `${anim.value.name}. ${summary.value}`);

const paper = STAGE_PAPER;

function togglePlay() {
  mote.playing = !mote.playing;
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
    <section class="stage-sticky py-2 lg:py-0">
      <div class="stage-card mx-auto w-full max-w-[440px] p-4" :style="{ background: paper }">
        <BotAvatar
          :shape="mote.shape"
          :mode="mote.mode"
          :solid="mote.solid"
          :gradient="mote.gradient"
          :texture="mote.texture"
          :anim="mote.anim"
          :time="time"
          :label="label"
        />
      </div>
      <div class="mx-auto mt-4 w-full max-w-[440px]">
        <p class="font-serif text-3xl">{{ anim.name }}</p>
        <p class="mt-1 text-sm text-muted">{{ anim.group }} · {{ summary }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="rounded-full bg-ink px-4 py-2 text-sm text-card" @click="togglePlay">
            {{ mote.playing ? 'Pause' : 'Play' }}
          </button>
          <button type="button" class="rounded-full bg-accent px-4 py-2 text-sm text-white" @click="mote.shareOpen = true">
            My QR
          </button>
        </div>
      </div>
    </section>
    <section class="flex min-h-[28rem] flex-col rounded-3xl border border-line bg-paper p-3">
      <div class="mb-3 grid grid-cols-4 gap-1 rounded-2xl bg-card p-1">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="rounded-xl px-2 py-2 text-sm"
          :class="activeTab === item.id ? 'bg-ink text-card' : 'text-muted'"
          :aria-pressed="activeTab === item.id"
          @click="activeTab = item.id"
        >
          {{ item.label }}
        </button>
      </div>
      <PickerPanels :tab="activeTab" />
    </section>
  </div>
</template>
