import { ANIMATIONS } from '../bot/animations';
import { GRADIENTS, SOLIDS } from '../bot/palette';
import { SHAPES } from '../bot/shapes';
import { TEXTURES } from '../bot/textures';
import type { FillMode, Selection } from '../bot/types';
import { readUint32, sha256 } from './sha256';

const shapeById = new Map(SHAPES.map((shape, index) => [shape.id, index]));
const solidById = new Map(SOLIDS.map((color, index) => [color.id, index]));
const gradientById = new Map(GRADIENTS.map((gradient, index) => [gradient.id, index]));
const textureById = new Map(TEXTURES.map((texture, index) => [texture.id, index]));
const animById = new Map(ANIMATIONS.map((anim, index) => [anim.id, index]));

export function selectionToPayload(selection: Selection): string {
  const shape = SHAPES[selection.shape]?.id ?? SHAPES[0].id;
  const mode: FillMode = selection.mode === 'gradient' ? 'gradient' : 'solid';
  const fill =
    mode === 'solid'
      ? (SOLIDS[selection.solid]?.id ?? SOLIDS[0].id)
      : (GRADIENTS[selection.gradient]?.id ?? GRADIENTS[0].id);
  const texture = TEXTURES[selection.texture]?.id ?? TEXTURES[0].id;
  const anim = ANIMATIONS[selection.anim]?.id ?? ANIMATIONS[0].id;
  const modeFlag = mode === 'solid' ? 's' : 'g';
  return `mote1|${shape}|${modeFlag}|${fill}|${texture}|${anim}`;
}

function selectionFromHash(bytes: Uint8Array): Selection {
  const mode: FillMode = (bytes[4] & 1) === 0 ? 'solid' : 'gradient';
  return {
    shape: readUint32(bytes, 0) % SHAPES.length,
    mode,
    solid: readUint32(bytes, 5) % SOLIDS.length,
    gradient: readUint32(bytes, 9) % GRADIENTS.length,
    texture: readUint32(bytes, 13) % TEXTURES.length,
    anim: readUint32(bytes, 17) % ANIMATIONS.length,
  };
}

function parseStructured(payload: string): Selection | null {
  const parts = payload.trim().split('|');
  if (parts.length !== 6 || parts[0] !== 'mote1') return null;
  const [, shapeId, modeFlag, fillId, textureId, animId] = parts;
  if (modeFlag !== 's' && modeFlag !== 'g') return null;
  const shape = shapeById.get(shapeId);
  const texture = textureById.get(textureId);
  const anim = animById.get(animId);
  if (shape === undefined || texture === undefined || anim === undefined) return null;
  if (modeFlag === 's') {
    const solid = solidById.get(fillId);
    if (solid === undefined) return null;
    return { shape, mode: 'solid', solid, gradient: 0, texture, anim };
  }
  const gradient = gradientById.get(fillId);
  if (gradient === undefined) return null;
  return { shape, mode: 'gradient', solid: 0, gradient, texture, anim };
}

export function describeSelection(selection: Selection): string {
  const shape = SHAPES[selection.shape]?.name ?? 'Shape';
  const fill =
    selection.mode === 'gradient'
      ? (GRADIENTS[selection.gradient]?.name ?? 'Gradient')
      : (SOLIDS[selection.solid]?.name ?? 'Colour');
  const texture = TEXTURES[selection.texture]?.name ?? 'Texture';
  const anim = ANIMATIONS[selection.anim]?.name ?? 'Motion';
  return `${shape}, ${fill}, ${texture}, ${anim}`;
}

/** Map any QR payload to one catalogue combination. Structured Mote codes are exact. */
export function mapPayload(payload: string): Selection {
  const trimmed = payload.trim();
  const structured = parseStructured(trimmed);
  if (structured) return structured;
  return selectionFromHash(sha256(trimmed));
}
