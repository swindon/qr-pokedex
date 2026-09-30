import { reactive, watch } from 'vue';
import { ANIMATIONS } from '../bot/animations';
import { GRADIENTS, SOLIDS } from '../bot/palette';
import { SHAPES } from '../bot/shapes';
import { TEXTURES } from '../bot/textures';
import type { Identity, Selection } from '../bot/types';
import { mapPayload, selectionToPayload } from '../qr/mapping';

export type ViewName = 'studio' | 'scanner';

const STORAGE_KEY = 'mote.selection.v1';

function clampIndex(value: number | undefined, length: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= length) return 0;
  return value;
}

export function clampIdentity(value: Partial<Identity>): Identity {
  return {
    shape: clampIndex(value.shape, SHAPES.length),
    mode: value.mode === 'gradient' ? 'gradient' : 'solid',
    solid: clampIndex(value.solid, SOLIDS.length),
    gradient: clampIndex(value.gradient, GRADIENTS.length),
    texture: clampIndex(value.texture, TEXTURES.length),
  };
}

export function clampSelection(value: Partial<Selection>): Selection {
  return {
    ...clampIdentity(value),
    anim: clampIndex(value.anim, ANIMATIONS.length),
  };
}

export const mote = reactive({
  shape: 0,
  mode: 'solid' as Selection['mode'],
  solid: 52,
  gradient: 2,
  texture: 0,
  anim: 0,
  playing: true,
  view: 'studio' as ViewName,
  shareOpen: false,
  epoch: 0,
});

export function currentSelection(): Selection {
  return {
    shape: mote.shape,
    mode: mote.mode,
    solid: mote.solid,
    gradient: mote.gradient,
    texture: mote.texture,
    anim: mote.anim,
  };
}

export function applyIdentity(identity: Identity) {
  const next = clampIdentity(identity);
  mote.shape = next.shape;
  mote.mode = next.mode;
  mote.solid = next.solid;
  mote.gradient = next.gradient;
  mote.texture = next.texture;
}

export function applySelection(selection: Selection, play = true) {
  applyIdentity(selection);
  mote.anim = clampIndex(selection.anim, ANIMATIONS.length);
  if (play) {
    mote.playing = true;
    mote.epoch += 1;
  }
}

export function chooseAnim(index: number) {
  mote.anim = clampIndex(index, ANIMATIONS.length);
  mote.playing = true;
  mote.epoch += 1;
}

function hashValue(): string {
  return decodeURIComponent(window.location.hash.replace(/^#/, ''));
}

export function syncHashFromState() {
  if (mote.view !== 'studio') return;
  const url = new URL(window.location.href);
  url.hash = selectionToPayload(currentSelection());
  history.replaceState(null, '', url);
}

export function readRoute() {
  const hash = hashValue();
  if (hash === 'scanner') {
    mote.view = 'scanner';
    return;
  }
  mote.view = 'studio';
  if (hash.startsWith('mote1|')) applyIdentity(mapPayload(hash));
}

export function go(view: ViewName) {
  mote.view = view;
  mote.shareOpen = false;
  const url = new URL(window.location.href);
  url.hash = view === 'studio' ? selectionToPayload(currentSelection()) : view;
  history.pushState(null, '', url);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSelection()));
  } catch {
    /* storage can be blocked; the bot still works for this visit */
  }
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    applySelection(clampSelection(JSON.parse(raw) as Partial<Selection>), false);
  } catch {
    /* ignore broken storage */
  }
}

export function initMote() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  loadStored();
  const hash = hashValue();
  if (hash.startsWith('mote1|') || hash === 'scanner') readRoute();
  if (reduce) mote.playing = false;
  if (!hash) syncHashFromState();
  window.addEventListener('popstate', () => readRoute());
  watch(
    () => [mote.shape, mote.mode, mote.solid, mote.gradient, mote.texture],
    () => {
      persist();
      syncHashFromState();
    },
  );
  watch(
    () => mote.anim,
    () => persist(),
  );
}
