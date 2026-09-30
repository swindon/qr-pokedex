import { ANIMATIONS } from './animations';
import { renderFrame } from './pose';
import { SHAPES } from './shapes';
import type { Frame } from './types';

/**
 * Pure pose at time `t` (seconds). The same inputs always return the same frame.
 * Shape silhouettes share one angular sampling, so a body is a list of radii.
 * Eyes are holes punched out of that filled silhouette.
 */
export function sample(time: number, shapeIndex: number, animIndex: number): Frame {
  const shape = SHAPES[shapeIndex];
  const anim = ANIMATIONS[animIndex];
  if (!shape || !anim) {
    throw new Error(`Catalog index out of range (shape ${shapeIndex}, animation ${animIndex}).`);
  }
  return renderFrame(shape.profile, anim, time);
}

export function posterTime(animIndex: number): number {
  const anim = ANIMATIONS[animIndex];
  if (!anim) return 0;
  return anim.poster * anim.duration;
}
