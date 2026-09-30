<script setup lang="ts">
import { computed, useId } from 'vue';
import { GRADIENTS, SOLIDS } from '../bot/palette';
import { posterTime, sample } from '../bot/engine';
import { TEXTURES } from '../bot/textures';
import { contrastInk, mixHex, STAGE_PAPER } from '../bot/geometry';
import type { GradientDef, GradientStop } from '../bot/types';

const props = withDefaults(
  defineProps<{
    shape: number;
    mode: 'solid' | 'gradient';
    solid: number;
    gradient: number;
    texture: number;
    anim: number;
    time?: number;
    poster?: boolean;
    label?: string;
  }>(),
  { time: 0, poster: false, label: 'Mote bot' },
);

const uid = useId();
const maskId = computed(() => `mote-mask-${uid}`);
const fillId = computed(() => `mote-fill-${uid}`);
const textureId = computed(() => `mote-tex-${uid}`);

const frame = computed(() => sample(props.poster ? posterTime(props.anim) : props.time, props.shape, props.anim));
const texture = computed(() => TEXTURES[props.texture] ?? TEXTURES[0]);

const paint = computed(() => {
  if (props.mode === 'gradient') {
    const gradient: GradientDef = GRADIENTS[props.gradient] ?? GRADIENTS[0];
    return { kind: 'gradient' as const, gradient };
  }
  const color = SOLIDS[props.solid]?.hex ?? '#d4532b';
  return { kind: 'solid' as const, color };
});

function colorAlong(stops: GradientStop[], t: number): string {
  const ordered = [...stops].sort((a, b) => a.offset - b.offset);
  if (t <= ordered[0].offset) return ordered[0].color;
  for (let index = 1; index < ordered.length; index++) {
    if (t <= ordered[index].offset) {
      const span = ordered[index].offset - ordered[index - 1].offset || 1;
      return mixHex(ordered[index - 1].color, ordered[index].color, (t - ordered[index - 1].offset) / span);
    }
  }
  return ordered[ordered.length - 1].color;
}

const eyeColor = computed(() => {
  if (paint.value.kind === 'solid') return paint.value.color;
  const gradient = paint.value.gradient;
  if (gradient.kind === 'radial') {
    const t = Math.min(1, Math.hypot(0, -8 - -16) / 120);
    return colorAlong(gradient.stops, t);
  }
  const rad = (gradient.angle * Math.PI) / 180;
  const reach = 110;
  const x1 = -Math.cos(rad) * reach;
  const y1 = -Math.sin(rad) * reach;
  const dx = Math.cos(rad) * reach - x1;
  const dy = Math.sin(rad) * reach - y1;
  const t = ((0 - x1) * dx + (-8 - y1) * dy) / (dx * dx + dy * dy);
  return colorAlong(gradient.stops, Math.min(1, Math.max(0, t)));
});

const eyeInk = computed(() => contrastInk(eyeColor.value));
const sparkInk = '#2a241f';

const linear = computed(() => {
  if (paint.value.kind !== 'gradient' || paint.value.gradient.kind !== 'linear') return null;
  const rad = (paint.value.gradient.angle * Math.PI) / 180;
  const reach = 110;
  return {
    x1: Math.cos(rad + Math.PI) * reach,
    y1: Math.sin(rad + Math.PI) * reach,
    x2: Math.cos(rad) * reach,
    y2: Math.sin(rad) * reach,
  };
});

const fillRef = computed(() => (paint.value.kind === 'solid' ? paint.value.color : `url(#${fillId.value})`));
const showTexture = computed(() => texture.value.marks.length > 0);
</script>

<template>
  <svg viewBox="-150 -150 300 300" class="block h-auto w-full" role="img" :aria-label="label">
    <title>{{ label }}</title>
    <rect x="-150" y="-150" width="300" height="300" :fill="STAGE_PAPER" />
    <ellipse cx="0" cy="104" rx="46" ry="8" fill="rgba(36,28,22,0.14)" />
    <defs>
      <linearGradient
        v-if="paint.kind === 'gradient' && paint.gradient.kind === 'linear' && linear"
        :id="fillId"
        gradientUnits="userSpaceOnUse"
        :x1="linear.x1"
        :y1="linear.y1"
        :x2="linear.x2"
        :y2="linear.y2"
      >
        <stop
          v-for="(stop, index) in paint.gradient.stops"
          :key="index"
          :offset="`${stop.offset * 100}%`"
          :stop-color="stop.color"
        />
      </linearGradient>
      <radialGradient
        v-else-if="paint.kind === 'gradient'"
        :id="fillId"
        gradientUnits="userSpaceOnUse"
        cx="0"
        cy="-16"
        r="120"
      >
        <stop
          v-for="(stop, index) in paint.gradient.stops"
          :key="index"
          :offset="`${stop.offset * 100}%`"
          :stop-color="stop.color"
        />
      </radialGradient>
      <pattern
        v-if="showTexture"
        :id="textureId"
        patternUnits="userSpaceOnUse"
        :width="texture.tile"
        :height="texture.tile"
      >
        <template v-for="(mark, index) in texture.marks" :key="index">
          <circle
            v-if="mark.type === 'circle'"
            :cx="mark.cx"
            :cy="mark.cy"
            :r="mark.r"
            :fill="mark.fill ?? 'none'"
            :stroke="mark.stroke"
            :stroke-width="mark.sw"
            :opacity="mark.opacity"
          />
          <rect
            v-else-if="mark.type === 'rect'"
            :x="mark.x"
            :y="mark.y"
            :width="mark.w"
            :height="mark.h"
            :fill="mark.fill ?? 'none'"
            :opacity="mark.opacity"
          />
          <line
            v-else-if="mark.type === 'line'"
            :x1="mark.x1"
            :y1="mark.y1"
            :x2="mark.x2"
            :y2="mark.y2"
            :stroke="mark.stroke"
            :stroke-width="mark.sw"
            stroke-linecap="square"
            :opacity="mark.opacity"
          />
          <path
            v-else
            :d="mark.d"
            :fill="mark.fill ?? 'none'"
            :stroke="mark.stroke"
            :stroke-width="mark.sw"
            :opacity="mark.opacity"
          />
        </template>
      </pattern>
      <mask :id="maskId" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-150" y="-150" width="300" height="300">
        <rect x="-150" y="-150" width="300" height="300" fill="black" />
        <path :d="frame.path" fill="white" />
        <ellipse
          v-for="(eye, index) in frame.eyes"
          :key="index"
          :cx="eye.cx"
          :cy="eye.cy"
          :rx="eye.rx"
          :ry="eye.ry"
          fill="black"
          :transform="`rotate(${eye.rotate} ${eye.cx} ${eye.cy})`"
        />
      </mask>
    </defs>
    <g v-for="(ring, index) in frame.rings" :key="`ring-${index}`" :opacity="ring.opacity">
      <ellipse
        :cx="ring.cx"
        :cy="ring.cy"
        :rx="ring.rx"
        :ry="ring.ry"
        fill="none"
        :stroke="sparkInk"
        :stroke-width="ring.width"
        :transform="`rotate(${ring.rotate} ${ring.cx} ${ring.cy})`"
      />
    </g>
    <path :d="frame.path" :fill="eyeInk" />
    <g :mask="`url(#${maskId})`">
      <path :d="frame.path" :fill="fillRef" />
      <path v-if="showTexture" :d="frame.path" :fill="`url(#${textureId})`" opacity="0.9" />
    </g>
    <circle
      v-for="(spark, index) in frame.sparks"
      :key="`spark-${index}`"
      :cx="spark.x"
      :cy="spark.y"
      :r="spark.r"
      :fill="sparkInk"
      :opacity="spark.opacity"
    />
  </svg>
</template>
