<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ANIMATIONS } from '../bot/animations';
import { GRADIENTS, SOLIDS } from '../bot/palette';
import { SHAPES } from '../bot/shapes';
import { TEXTURES } from '../bot/textures';
import BotAvatar from './BotAvatar.vue';
import { chooseAnim, mote } from '../state/mote';

const props = defineProps<{
  tab: 'shape' | 'colour' | 'texture' | 'motion';
}>();

const query = ref('');
const group = ref('All');

const shapeGroups = ['All', ...new Set(SHAPES.map((item) => item.group))];
const textureGroups = ['All', ...new Set(TEXTURES.map((item) => item.group))];
const motionGroups = ['All', ...new Set(ANIMATIONS.map((item) => item.group))];

const needle = computed(() => query.value.trim().toLowerCase());

function matches(name: string, itemGroup: string) {
  const groupOk = group.value === 'All' || itemGroup === group.value;
  const textOk = !needle.value || name.toLowerCase().includes(needle.value);
  return groupOk && textOk;
}

const shapes = computed(() =>
  SHAPES.map((item, index) => ({ item, index })).filter(({ item }) => matches(item.name, item.group)),
);
const solids = computed(() =>
  SOLIDS.map((item, index) => ({ item, index })).filter(({ item }) => !needle.value || item.name.toLowerCase().includes(needle.value)),
);
const gradients = computed(() =>
  GRADIENTS.map((item, index) => ({ item, index })).filter(
    ({ item }) => !needle.value || item.name.toLowerCase().includes(needle.value),
  ),
);
const textures = computed(() =>
  TEXTURES.map((item, index) => ({ item, index })).filter(({ item }) => matches(item.name, item.group)),
);
const motions = computed(() =>
  ANIMATIONS.map((item, index) => ({ item, index })).filter(({ item }) => matches(item.name, item.group)),
);

watch(
  () => props.tab,
  () => {
    group.value = 'All';
    query.value = '';
  },
);

const chips = computed(() => {
  if (props.tab === 'shape') return shapeGroups;
  if (props.tab === 'texture') return textureGroups;
  if (props.tab === 'motion') return motionGroups;
  return [];
});

function swatchStyle(index: number, mode: 'solid' | 'gradient') {
  if (mode === 'solid') return { background: SOLIDS[index].hex };
  const gradient = GRADIENTS[index];
  const stops = gradient.stops.map((stop) => `${stop.color} ${stop.offset * 100}%`).join(', ');
  if (gradient.kind === 'radial') return { background: `radial-gradient(circle, ${stops})` };
  return { background: `linear-gradient(${gradient.angle}deg, ${stops})` };
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <label class="sr-only" for="catalog-search">Search the catalogue</label>
    <input
      id="catalog-search"
      v-model="query"
      type="search"
      placeholder="Search"
      class="w-full rounded-2xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent"
    />
    <div v-if="chips.length" class="mt-3 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="chip in chips"
        :key="chip"
        type="button"
        class="shrink-0 rounded-full px-3 py-1 text-sm"
        :class="group === chip ? 'bg-ink text-card' : 'bg-card text-muted'"
        @click="group = chip"
      >
        {{ chip }}
      </button>
    </div>

    <div v-if="tab === 'shape'" class="panel-scroll mt-3 grid max-h-[28rem] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
      <button
        v-for="{ item, index } in shapes"
        :key="item.id"
        type="button"
        class="rounded-2xl border bg-card p-1.5 text-left"
        :class="mote.shape === index ? 'border-accent ring-2 ring-accent' : 'border-line'"
        :aria-pressed="mote.shape === index"
        :aria-label="item.name"
        @click="mote.shape = index"
      >
        <BotAvatar
          :shape="index"
          :mode="mote.mode"
          :solid="mote.solid"
          :gradient="mote.gradient"
          :texture="0"
          :anim="0"
          :time="0"
          :label="item.name"
        />
        <span class="mt-1 block truncate px-1 text-xs">{{ item.name }}</span>
      </button>
      <p v-if="!shapes.length" class="col-span-full py-8 text-center text-sm text-muted">Nothing matches that search.</p>
    </div>

    <div v-else-if="tab === 'colour'" class="mt-3">
      <div class="grid grid-cols-2 gap-2 rounded-2xl bg-card p-1">
        <button
          type="button"
          class="rounded-xl px-3 py-2 text-sm"
          :class="mote.mode === 'solid' ? 'bg-ink text-card' : 'text-muted'"
          :aria-pressed="mote.mode === 'solid'"
          @click="mote.mode = 'solid'"
        >
          Solid
        </button>
        <button
          type="button"
          class="rounded-xl px-3 py-2 text-sm"
          :class="mote.mode === 'gradient' ? 'bg-ink text-card' : 'text-muted'"
          :aria-pressed="mote.mode === 'gradient'"
          @click="mote.mode = 'gradient'"
        >
          Gradient
        </button>
      </div>
      <div v-if="mote.mode === 'solid'" class="panel-scroll mt-3 grid max-h-[26rem] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
        <button
          v-for="{ item, index } in solids"
          :key="item.id"
          type="button"
          class="aspect-square rounded-2xl border"
          :class="mote.solid === index ? 'border-ink ring-2 ring-ink' : 'border-white'"
          :style="swatchStyle(index, 'solid')"
          :aria-label="item.name"
          :aria-pressed="mote.solid === index"
          :title="item.name"
          @click="mote.solid = index"
        />
        <p v-if="!solids.length" class="col-span-full py-8 text-center text-sm text-muted">Nothing matches that search.</p>
      </div>
      <div v-else class="panel-scroll mt-3 grid max-h-[26rem] grid-cols-2 gap-2 overflow-y-auto pr-1">
        <button
          v-for="{ item, index } in gradients"
          :key="item.id"
          type="button"
          class="h-16 rounded-2xl border text-left"
          :class="mote.gradient === index ? 'border-ink ring-2 ring-ink' : 'border-white'"
          :style="swatchStyle(index, 'gradient')"
          :aria-label="item.name"
          :aria-pressed="mote.gradient === index"
          :title="item.name"
          @click="mote.gradient = index"
        />
        <p v-if="!gradients.length" class="col-span-full py-8 text-center text-sm text-muted">Nothing matches that search.</p>
      </div>
    </div>

    <div v-else-if="tab === 'texture'" class="panel-scroll mt-3 grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
      <button
        v-for="{ item, index } in textures"
        :key="item.id"
        type="button"
        class="rounded-2xl border bg-card p-1 text-left"
        :class="mote.texture === index ? 'border-accent ring-2 ring-accent' : 'border-line'"
        :aria-pressed="mote.texture === index"
        @click="mote.texture = index"
      >
        <BotAvatar
          :shape="mote.shape"
          :mode="mote.mode"
          :solid="mote.solid"
          :gradient="mote.gradient"
          :texture="index"
          :anim="0"
          :time="0"
          :label="item.name"
        />
        <span class="mt-1 block truncate px-1 pb-1 text-xs">{{ item.name }}</span>
      </button>
      <p v-if="!textures.length" class="col-span-full py-8 text-center text-sm text-muted">Nothing matches that search.</p>
    </div>

    <div v-else class="panel-scroll mt-3 flex max-h-[28rem] flex-col gap-1 overflow-y-auto pr-1">
      <button
        v-for="{ item, index } in motions"
        :key="item.id"
        type="button"
        class="flex items-center justify-between rounded-2xl border px-3 py-2 text-left"
        :class="mote.anim === index ? 'border-accent bg-card ring-2 ring-accent' : 'border-transparent bg-card/70'"
        :aria-pressed="mote.anim === index"
        @click="chooseAnim(index)"
      >
        <span>
          <span class="block text-sm">{{ item.name }}</span>
          <span class="block text-xs text-muted">{{ item.group }}</span>
        </span>
        <span class="text-xs text-muted">{{ item.duration.toFixed(1) }}s</span>
      </button>
      <p v-if="!motions.length" class="py-8 text-center text-sm text-muted">Nothing matches that search.</p>
    </div>
  </div>
</template>
