<script setup lang="ts">
import { computed, ref } from 'vue';
import { ANIMATIONS } from '../bot/animations';
import { STAGE_PAPER } from '../bot/geometry';
import { chooseAnim, go, mote } from '../state/mote';
import BotAvatar from './BotAvatar.vue';

const group = ref('All');
const groups = ['All', ...new Set(ANIMATIONS.map((item) => item.group))];
const visible = computed(() =>
  ANIMATIONS.map((item, index) => ({ item, index })).filter(
    ({ item }) => group.value === 'All' || item.group === group.value,
  ),
);

const paper = STAGE_PAPER;

function play(index: number) {
  chooseAnim(index);
  go('studio');
}
</script>

<template>
  <section>
    <h2 class="font-serif text-3xl">Gallery</h2>
    <p class="mt-2 max-w-2xl text-sm text-muted">
      Frozen moments from the motion catalogue, drawn with your current shape, colour, and texture. Choose one to play it.
    </p>
    <div class="mt-4 flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="chip in groups"
        :key="chip"
        type="button"
        class="shrink-0 rounded-full px-3 py-1 text-sm"
        :class="group === chip ? 'bg-ink text-card' : 'bg-card text-muted'"
        @click="group = chip"
      >
        {{ chip }}
      </button>
    </div>
    <div class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <button
        v-for="{ item, index } in visible"
        :key="item.id"
        type="button"
        class="gallery-cell rounded-2xl border border-line p-2 text-left"
        :style="{ background: paper }"
        @click="play(index)"
      >
        <BotAvatar
          poster
          :shape="mote.shape"
          :mode="mote.mode"
          :solid="mote.solid"
          :gradient="mote.gradient"
          :texture="mote.texture"
          :anim="index"
          :label="item.name"
        />
        <span class="mt-1 block truncate text-sm">{{ item.name }}</span>
        <span class="block text-xs opacity-70">{{ item.group }}</span>
      </button>
    </div>
  </section>
</template>
