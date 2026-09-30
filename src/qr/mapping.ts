import { ANIMATIONS } from '../bot/animations';
import { GRADIENTS, SOLIDS } from '../bot/palette';
import { SHAPES } from '../bot/shapes';
import { TEXTURES } from '../bot/textures';
import type { FillMode, Identity, Selection } from '../bot/types';
import { readUint32, sha256 } from './sha256';

const shapeById = new Map(SHAPES.map((shape, index) => [shape.id, index]));
const solidById = new Map(SOLIDS.map((color, index) => [color.id, index]));
const gradientById = new Map(GRADIENTS.map((gradient, index) => [gradient.id, index]));
const textureById = new Map(TEXTURES.map((texture, index) => [texture.id, index]));

export function selectionToPayload(selection: Identity): string {
  const shape = SHAPES[selection.shape]?.id ?? SHAPES[0].id;
  const mode: FillMode = selection.mode === 'gradient' ? 'gradient' : 'solid';
  const fill =
    mode === 'solid'
      ? (SOLIDS[selection.solid]?.id ?? SOLIDS[0].id)
      : (GRADIENTS[selection.gradient]?.id ?? GRADIENTS[0].id);
  const texture = TEXTURES[selection.texture]?.id ?? TEXTURES[0].id;
  const modeFlag = mode === 'solid' ? 's' : 'g';
  return `mote1|${shape}|${modeFlag}|${fill}|${texture}`;
}

function identityFromHash(bytes: Uint8Array): Identity {
  const mode: FillMode = (bytes[4] & 1) === 0 ? 'solid' : 'gradient';
  return {
    shape: readUint32(bytes, 0) % SHAPES.length,
    mode,
    solid: readUint32(bytes, 5) % SOLIDS.length,
    gradient: readUint32(bytes, 9) % GRADIENTS.length,
    texture: readUint32(bytes, 13) % TEXTURES.length,
  };
}

function parseStructured(payload: string): Identity | null {
  const parts = payload.trim().split('|');
  if (parts[0] !== 'mote1' || (parts.length !== 5 && parts.length !== 6)) return null;
  const [, shapeId, modeFlag, fillId, textureId] = parts;
  if (modeFlag !== 's' && modeFlag !== 'g') return null;
  const shape = shapeById.get(shapeId);
  const texture = textureById.get(textureId);
  if (shape === undefined || texture === undefined) return null;
  if (modeFlag === 's') {
    const solid = solidById.get(fillId);
    if (solid === undefined) return null;
    return { shape, mode: 'solid', solid, gradient: 0, texture };
  }
  const gradient = gradientById.get(fillId);
  if (gradient === undefined) return null;
  return { shape, mode: 'gradient', solid: 0, gradient, texture };
}

export function describeIdentity(identity: Identity): string {
  const shape = SHAPES[identity.shape]?.name ?? 'Shape';
  const fill =
    identity.mode === 'gradient'
      ? (GRADIENTS[identity.gradient]?.name ?? 'Gradient')
      : (SOLIDS[identity.solid]?.name ?? 'Colour');
  const texture = TEXTURES[identity.texture]?.name ?? 'Texture';
  return `${shape}, ${fill}, ${texture}`;
}

export function describeSelection(selection: Selection): string {
  const anim = ANIMATIONS[selection.anim]?.name ?? 'Motion';
  return `${describeIdentity(selection)}, ${anim}`;
}

/**
 * Map a QR payload to shape, colour mode, fill, and texture.
 * Structured codes are exact. A legacy sixth field, if present, is ignored.
 * Anything else is hashed into those four catalogues. Motion is never included.
 */
export function mapPayload(payload: string): Identity {
  const trimmed = payload.trim();
  const structured = parseStructured(trimmed);
  if (structured) return structured;
  return identityFromHash(sha256(trimmed));
}
