import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';
import { ANIMATIONS } from '../bot/animations';
import { GRADIENTS, SOLIDS } from '../bot/palette';
import { SHAPES } from '../bot/shapes';
import { TEXTURES } from '../bot/textures';
import type { Selection } from '../bot/types';
import { mapPayload, selectionToPayload } from './mapping';
import { sha256Hex } from './sha256';

function rasterize(text: string): { data: Uint8ClampedArray; width: number; height: number } {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const scale = 6;
  const margin = 4;
  const width = (size + margin * 2) * scale;
  const data = new Uint8ClampedArray(width * width * 4);
  data.fill(255);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dark = Boolean(qr.modules.get(x, y));
      if (!dark) continue;
      for (let py = 0; py < scale; py++) {
        for (let px = 0; px < scale; px++) {
          const pixel = ((y + margin) * scale + py) * width + ((x + margin) * scale + px);
          const offset = pixel * 4;
          data[offset] = 20;
          data[offset + 1] = 16;
          data[offset + 2] = 12;
          data[offset + 3] = 255;
        }
      }
    }
  }
  return { data, width, height: width };
}

describe('QR identity', () => {
  it('hashes with the standard SHA-256 vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('round-trips a shared payload to the same combination', () => {
    const selection: Selection = {
      shape: SHAPES.length - 1,
      mode: 'gradient',
      solid: 3,
      gradient: GRADIENTS.length - 2,
      texture: TEXTURES.length - 1,
      anim: ANIMATIONS.length - 4,
    };
    const payload = selectionToPayload(selection);
    expect(payload.startsWith('mote1|')).toBe(true);
    expect(mapPayload(payload)).toEqual({ ...selection, solid: 0 });
    expect(mapPayload(`  ${payload}  `)).toEqual({ ...selection, solid: 0 });
  });

  it('keeps solid selections exact, including a zero gradient slot', () => {
    const selection: Selection = {
      shape: 12,
      mode: 'solid',
      solid: SOLIDS.length - 1,
      gradient: 9,
      texture: 4,
      anim: 20,
    };
    expect(mapPayload(selectionToPayload(selection))).toEqual({ ...selection, gradient: 0 });
  });

  it('maps an arbitrary payload deterministically', () => {
    const first = mapPayload('visitor-badge-441');
    const second = mapPayload('visitor-badge-441');
    const other = mapPayload('visitor-badge-442');
    expect(second).toEqual(first);
    expect(other).not.toEqual(first);
    expect(first.shape).toBeGreaterThanOrEqual(0);
    expect(first.shape).toBeLessThan(SHAPES.length);
    expect(first.anim).toBeLessThan(ANIMATIONS.length);
    expect(first.texture).toBeLessThan(TEXTURES.length);
    expect(['solid', 'gradient']).toContain(first.mode);
  });

  it('encodes a payload as a QR matrix and decodes it back to the same bot', () => {
    const selection: Selection = { shape: 5, mode: 'solid', solid: 8, gradient: 1, texture: 2, anim: 11 };
    const payload = selectionToPayload(selection);
    const image = rasterize(payload);
    const decoded = jsQR(image.data, image.width, image.height);
    expect(decoded?.data).toBe(payload);
    expect(mapPayload(decoded?.data ?? '')).toEqual({ ...selection, gradient: 0 });
  });
});
