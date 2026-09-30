import { describe, expect, it } from 'vitest';
import { ANIMATIONS } from './animations';
import { CATALOG_COUNTS, REQUIREMENTS } from './catalog';
import { contrastInk, relativeLuminance, SAMPLES } from './geometry';
import { GRADIENTS, SOLIDS } from './palette';
import { SHAPES } from './shapes';
import { TEXTURES } from './textures';

function rms(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const delta = a[i] - b[i];
    sum += delta * delta;
  }
  return Math.sqrt(sum / a.length);
}

describe('catalogue counts', () => {
  it('meets the published minimums', () => {
    expect(CATALOG_COUNTS.shapes).toBe(SHAPES.length);
    expect(CATALOG_COUNTS.animations).toBe(ANIMATIONS.length);
    expect(CATALOG_COUNTS.solids).toBe(SOLIDS.length);
    expect(CATALOG_COUNTS.gradients).toBe(GRADIENTS.length);
    expect(CATALOG_COUNTS.textures).toBe(TEXTURES.length);
    expect(SHAPES.length).toBeGreaterThanOrEqual(REQUIREMENTS.shapes);
    expect(ANIMATIONS.length).toBeGreaterThanOrEqual(REQUIREMENTS.animations);
    expect(SOLIDS.length).toBeGreaterThanOrEqual(REQUIREMENTS.solids);
    expect(GRADIENTS.length).toBeGreaterThanOrEqual(REQUIREMENTS.gradients);
    expect(TEXTURES.length).toBeGreaterThanOrEqual(REQUIREMENTS.textures);
    expect(CATALOG_COUNTS).toEqual({
      shapes: 110,
      animations: 125,
      solids: 112,
      gradients: 100,
      textures: 56,
    });
  });

  it('gives every entry a unique id and a real body', () => {
    expect(new Set(SHAPES.map((shape) => shape.id)).size).toBe(SHAPES.length);
    expect(new Set(SHAPES.map((shape) => shape.name)).size).toBe(SHAPES.length);
    expect(new Set(ANIMATIONS.map((anim) => anim.id)).size).toBe(ANIMATIONS.length);
    expect(new Set(SOLIDS.map((color) => color.id)).size).toBe(SOLIDS.length);
    expect(new Set(SOLIDS.map((color) => color.hex)).size).toBe(SOLIDS.length);
    expect(new Set(GRADIENTS.map((gradient) => gradient.id)).size).toBe(GRADIENTS.length);
    expect(new Set(TEXTURES.map((texture) => texture.id)).size).toBe(TEXTURES.length);

    for (const shape of SHAPES) {
      expect(shape.profile).toHaveLength(SAMPLES);
      for (const radius of shape.profile) {
        expect(radius).toBeGreaterThan(0.2);
        expect(radius).toBeLessThanOrEqual(1);
      }
    }
  });

  it('keeps body silhouettes visibly distinct', () => {
    let closest = Number.POSITIVE_INFINITY;
    let pair = '';
    for (let i = 0; i < SHAPES.length; i++) {
      for (let j = i + 1; j < SHAPES.length; j++) {
        const distance = rms(SHAPES[i].profile, SHAPES[j].profile);
        if (distance < closest) {
          closest = distance;
          pair = `${SHAPES[i].name} vs ${SHAPES[j].name}`;
        }
      }
    }
    expect(closest, pair).toBeGreaterThan(0.015);
  });

  it('builds gradients with at least two different stops', () => {
    for (const gradient of GRADIENTS) {
      expect(gradient.stops.length).toBeGreaterThanOrEqual(2);
      const colors = new Set(gradient.stops.map((stop) => stop.color));
      expect(colors.size).toBeGreaterThanOrEqual(2);
      for (const stop of gradient.stops) {
        expect(stop.offset).toBeGreaterThanOrEqual(0);
        expect(stop.offset).toBeLessThanOrEqual(1);
      }
    }
  });

  it('cuts eye holes in a colour that contrasts with the fill', () => {
    expect(contrastInk('#fffdf8')).toBe('#1c1814');
    expect(contrastInk('#16181d')).toBe('#fffaf2');
    for (const color of SOLIDS) {
      const ink = contrastInk(color.hex);
      const lightFill = relativeLuminance(color.hex) > 0.45;
      if (lightFill) expect(ink, color.name).toBe('#1c1814');
      if (relativeLuminance(color.hex) < 0.08) expect(ink, color.name).toBe('#fffaf2');
    }
  });

  it('offers real texture marks, plus one plain option', () => {
    const plain = TEXTURES.find((texture) => texture.name === 'Plain');
    expect(plain?.marks).toEqual([]);
    const patterned = TEXTURES.filter((texture) => texture.marks.length > 0);
    expect(patterned.length).toBeGreaterThanOrEqual(50);
  });
});
