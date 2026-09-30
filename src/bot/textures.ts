import { slug } from './geometry';
import type { TextureDef, TextureMark } from './types';

const DARK = 'rgba(24, 18, 14, 0.55)';
const LIGHT = 'rgba(255, 250, 242, 0.72)';

function texture(name: string, group: string, tile: number, marks: TextureMark[]): TextureDef {
  return { id: `texture-${slug(name)}`, name, group, tile, marks };
}

function hash(index: number): number {
  let value = (index * 374761393 + 668265263) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function dots(tile: number, radius: number, ox = 0, oy = 0): TextureMark[] {
  return [
    { type: 'circle', cx: tile / 2 + ox, cy: tile / 2 + oy, r: radius, fill: DARK },
    { type: 'circle', cx: tile / 2 + ox - 0.4, cy: tile / 2 + oy - 0.4, r: radius * 0.45, fill: LIGHT },
  ];
}

function grain(tile: number, count: number): TextureMark[] {
  const marks: TextureMark[] = [];
  for (let i = 0; i < count; i++) {
    const x = hash(i * 2) * tile;
    const y = hash(i * 2 + 1) * tile;
    const dark = hash(i + 9) > 0.45;
    marks.push({
      type: 'circle',
      cx: x,
      cy: y,
      r: 0.35 + hash(i + 3) * 0.7,
      fill: dark ? DARK : LIGHT,
    });
  }
  return marks;
}

export const TEXTURES: TextureDef[] = [
  texture('Plain', 'Plain', 8, []),
  texture('Fine dots', 'Dots', 8, dots(8, 0.9)),
  texture('Medium dots', 'Dots', 12, dots(12, 1.6)),
  texture('Large dots', 'Dots', 18, dots(18, 2.8)),
  texture('Sparse dots', 'Dots', 22, dots(22, 1.7)),
  texture('Offset dots', 'Dots', 14, dots(14, 1.5, 2, -1)),
  texture('Micro dots', 'Dots', 6, dots(6, 0.55)),
  texture('Horizontal stripes', 'Stripes', 10, [
    { type: 'rect', x: 0, y: 0, w: 10, h: 3, fill: DARK },
    { type: 'rect', x: 0, y: 3.4, w: 10, h: 1, fill: LIGHT },
  ]),
  texture('Vertical stripes', 'Stripes', 10, [
    { type: 'rect', x: 0, y: 0, w: 3, h: 10, fill: DARK },
    { type: 'rect', x: 3.4, y: 0, w: 1, h: 10, fill: LIGHT },
  ]),
  texture('Thick bands', 'Stripes', 16, [
    { type: 'rect', x: 0, y: 0, w: 16, h: 6, fill: DARK },
    { type: 'rect', x: 0, y: 7, w: 16, h: 1.4, fill: LIGHT },
  ]),
  texture('Hairline stripes', 'Stripes', 6, [
    { type: 'rect', x: 0, y: 0, w: 6, h: 0.7, fill: DARK },
    { type: 'rect', x: 0, y: 2.2, w: 6, h: 0.45, fill: LIGHT },
  ]),
  texture('Diagonal stripes', 'Stripes', 12, [
    { type: 'line', x1: -2, y1: 12, x2: 12, y2: -2, stroke: DARK, sw: 2.4 },
    { type: 'line', x1: 2, y1: 14, x2: 16, y2: 0, stroke: LIGHT, sw: 1 },
  ]),
  texture('Reverse diagonal', 'Stripes', 12, [
    { type: 'line', x1: -2, y1: 0, x2: 12, y2: 14, stroke: DARK, sw: 2.4 },
    { type: 'line', x1: 2, y1: -2, x2: 16, y2: 12, stroke: LIGHT, sw: 1 },
  ]),
  texture('Crosshatch', 'Hatch', 12, [
    { type: 'line', x1: -2, y1: 12, x2: 12, y2: -2, stroke: DARK, sw: 1.2 },
    { type: 'line', x1: -2, y1: 0, x2: 12, y2: 14, stroke: DARK, sw: 1.2 },
    { type: 'line', x1: 4, y1: -2, x2: 16, y2: 10, stroke: LIGHT, sw: 0.6 },
  ]),
  texture('Loose hatch', 'Hatch', 18, [
    { type: 'line', x1: 0, y1: 18, x2: 18, y2: 0, stroke: DARK, sw: 1.4 },
    { type: 'line', x1: 0, y1: 0, x2: 18, y2: 18, stroke: LIGHT, sw: 0.8 },
  ]),
  texture('Tight hatch', 'Hatch', 8, [
    { type: 'line', x1: -1, y1: 8, x2: 8, y2: -1, stroke: DARK, sw: 0.8 },
    { type: 'line', x1: -1, y1: 0, x2: 8, y2: 9, stroke: DARK, sw: 0.8 },
  ]),
  texture('Wood hatch', 'Hatch', 14, [
    { type: 'line', x1: 0, y1: 3, x2: 14, y2: 3, stroke: DARK, sw: 0.8 },
    { type: 'line', x1: 0, y1: 8, x2: 14, y2: 9, stroke: DARK, sw: 0.7 },
    { type: 'line', x1: 0, y1: 12, x2: 14, y2: 11.2, stroke: LIGHT, sw: 0.6 },
  ]),
  texture('Checker', 'Grid', 12, [
    { type: 'rect', x: 0, y: 0, w: 6, h: 6, fill: DARK },
    { type: 'rect', x: 6, y: 6, w: 6, h: 6, fill: DARK },
    { type: 'rect', x: 6, y: 0, w: 6, h: 6, fill: LIGHT, opacity: 0.35 },
    { type: 'rect', x: 0, y: 6, w: 6, h: 6, fill: LIGHT, opacity: 0.35 },
  ]),
  texture('Small checker', 'Grid', 8, [
    { type: 'rect', x: 0, y: 0, w: 4, h: 4, fill: DARK },
    { type: 'rect', x: 4, y: 4, w: 4, h: 4, fill: DARK },
  ]),
  texture('Grid', 'Grid', 12, [
    { type: 'rect', x: 0, y: 0, w: 12, h: 0.8, fill: DARK },
    { type: 'rect', x: 0, y: 0, w: 0.8, h: 12, fill: DARK },
    { type: 'rect', x: 0, y: 11.2, w: 12, h: 0.5, fill: LIGHT },
  ]),
  texture('Graph paper', 'Grid', 10, [
    { type: 'line', x1: 0, y1: 0, x2: 10, y2: 0, stroke: DARK, sw: 0.5 },
    { type: 'line', x1: 0, y1: 0, x2: 0, y2: 10, stroke: DARK, sw: 0.5 },
    { type: 'line', x1: 5, y1: 0, x2: 5, y2: 10, stroke: LIGHT, sw: 0.4 },
  ]),
  texture('Window pane', 'Grid', 16, [
    { type: 'rect', x: 0, y: 0, w: 16, h: 1.4, fill: DARK },
    { type: 'rect', x: 0, y: 0, w: 1.4, h: 16, fill: DARK },
    { type: 'rect', x: 7.4, y: 0, w: 0.7, h: 16, fill: LIGHT },
    { type: 'rect', x: 0, y: 7.4, w: 16, h: 0.7, fill: LIGHT },
  ]),
  texture('Soft wave', 'Wave', 16, [
    { type: 'path', d: 'M0 8 Q 4 4 8 8 T 16 8', fill: 'none', stroke: DARK, sw: 1.3 },
    { type: 'path', d: 'M0 12 Q 4 9 8 12 T 16 12', fill: 'none', stroke: LIGHT, sw: 0.8 },
  ]),
  texture('Tight wave', 'Wave', 10, [
    { type: 'path', d: 'M0 5 Q 2.5 2 5 5 T 10 5', fill: 'none', stroke: DARK, sw: 1 },
    { type: 'path', d: 'M0 8 Q 2.5 6 5 8 T 10 8', fill: 'none', stroke: LIGHT, sw: 0.6 },
  ]),
  texture('Ripple lines', 'Wave', 18, [
    { type: 'path', d: 'M0 6 Q 4 2 9 6 T 18 6', fill: 'none', stroke: DARK, sw: 1.1 },
    { type: 'path', d: 'M0 12 Q 4 9 9 12 T 18 12', fill: 'none', stroke: DARK, sw: 1.1 },
    { type: 'path', d: 'M0 15 Q 4 13 9 15 T 18 15', fill: 'none', stroke: LIGHT, sw: 0.7 },
  ]),
  texture('Sine bands', 'Wave', 20, [
    { type: 'path', d: 'M0 4 Q 5 0 10 4 T 20 4', fill: 'none', stroke: DARK, sw: 2 },
    { type: 'path', d: 'M0 12 Q 5 16 10 12 T 20 12', fill: 'none', stroke: LIGHT, sw: 1.2 },
  ]),
  texture('Fine grain', 'Grain', 16, grain(16, 10)),
  texture('Coarse grain', 'Grain', 20, grain(20, 8)),
  texture('Speckle', 'Grain', 18, grain(18, 14)),
  texture('Dust', 'Grain', 14, grain(14, 18)),
  texture('Salt', 'Grain', 12, grain(12, 6)),
  texture('Pepper', 'Grain', 16, grain(16, 5).map((mark) => ({ ...mark, fill: DARK }))),
  texture('Rings', 'Rings', 16, [
    { type: 'circle', cx: 8, cy: 8, r: 5, fill: 'none', stroke: DARK, sw: 1.1 },
    { type: 'circle', cx: 8, cy: 8, r: 2.2, fill: 'none', stroke: LIGHT, sw: 0.8 },
  ]),
  texture('Target', 'Rings', 18, [
    { type: 'circle', cx: 9, cy: 9, r: 7, fill: 'none', stroke: DARK, sw: 1.3 },
    { type: 'circle', cx: 9, cy: 9, r: 4, fill: 'none', stroke: DARK, sw: 1 },
    { type: 'circle', cx: 9, cy: 9, r: 1.4, fill: LIGHT },
  ]),
  texture('Bubbles', 'Rings', 20, [
    { type: 'circle', cx: 6, cy: 7, r: 3.2, fill: 'none', stroke: DARK, sw: 0.9 },
    { type: 'circle', cx: 14, cy: 13, r: 2.4, fill: 'none', stroke: LIGHT, sw: 0.8 },
  ]),
  texture('Concentric', 'Rings', 14, [
    { type: 'circle', cx: 7, cy: 7, r: 6, fill: 'none', stroke: DARK, sw: 0.7 },
    { type: 'circle', cx: 7, cy: 7, r: 3.5, fill: 'none', stroke: LIGHT, sw: 0.7 },
    { type: 'circle', cx: 7, cy: 7, r: 1.2, fill: 'none', stroke: DARK, sw: 0.7 },
  ]),
  texture('Diamonds', 'Shape', 14, [
    { type: 'path', d: 'M7 1 L13 7 L7 13 L1 7 Z', fill: 'none', stroke: DARK, sw: 1.1 },
    { type: 'path', d: 'M7 4 L10 7 L7 10 L4 7 Z', fill: LIGHT, opacity: 0.8 },
  ]),
  texture('Diamond fill', 'Shape', 12, [
    { type: 'path', d: 'M6 0 L12 6 L6 12 L0 6 Z', fill: DARK, opacity: 0.85 },
  ]),
  texture('Triangles', 'Shape', 14, [
    { type: 'path', d: 'M7 1 L13 12 L1 12 Z', fill: 'none', stroke: DARK, sw: 1.1 },
    { type: 'path', d: 'M7 5 L10 11 L4 11 Z', fill: LIGHT, opacity: 0.7 },
  ]),
  texture('Up and down', 'Shape', 12, [
    { type: 'path', d: 'M6 0 L12 6 L6 6 Z', fill: DARK },
    { type: 'path', d: 'M0 12 L6 6 L6 12 Z', fill: LIGHT, opacity: 0.55 },
  ]),
  texture('Dashes', 'Line', 14, [
    { type: 'line', x1: 1, y1: 4, x2: 8, y2: 4, stroke: DARK, sw: 1.6 },
    { type: 'line', x1: 4, y1: 10, x2: 12, y2: 10, stroke: LIGHT, sw: 1.2 },
  ]),
  texture('Stitches', 'Line', 12, [
    { type: 'line', x1: 2, y1: 2, x2: 6, y2: 6, stroke: DARK, sw: 1.2 },
    { type: 'line', x1: 6, y1: 6, x2: 10, y2: 2, stroke: DARK, sw: 1.2 },
    { type: 'line', x1: 3, y1: 9, x2: 9, y2: 9, stroke: LIGHT, sw: 0.8 },
  ]),
  texture('Plus marks', 'Line', 12, [
    { type: 'line', x1: 6, y1: 2, x2: 6, y2: 10, stroke: DARK, sw: 1.3 },
    { type: 'line', x1: 2, y1: 6, x2: 10, y2: 6, stroke: DARK, sw: 1.3 },
    { type: 'circle', cx: 6, cy: 6, r: 0.7, fill: LIGHT },
  ]),
  texture('Cross marks', 'Line', 14, [
    { type: 'line', x1: 3, y1: 3, x2: 11, y2: 11, stroke: DARK, sw: 1.2 },
    { type: 'line', x1: 11, y1: 3, x2: 3, y2: 11, stroke: LIGHT, sw: 1 },
  ]),
  texture('Scales', 'Shape', 16, [
    { type: 'path', d: 'M0 8 Q 4 2 8 8 T 16 8', fill: 'none', stroke: DARK, sw: 1.2 },
    { type: 'path', d: 'M0 16 Q 4 10 8 16 T 16 16', fill: 'none', stroke: LIGHT, sw: 1 },
  ]),
  texture('Fish scales', 'Shape', 18, [
    { type: 'path', d: 'M0 10 Q 4.5 2 9 10 T 18 10', fill: 'none', stroke: DARK, sw: 1.3 },
    { type: 'path', d: 'M-9 18 Q -4.5 10 0 18 T 9 18', fill: 'none', stroke: DARK, sw: 1.1 },
  ]),
  texture('Zigzag', 'Line', 12, [
    { type: 'path', d: 'M0 8 L3 3 L6 8 L9 3 L12 8', fill: 'none', stroke: DARK, sw: 1.2 },
    { type: 'path', d: 'M0 11 L3 7 L6 11 L9 7 L12 11', fill: 'none', stroke: LIGHT, sw: 0.7 },
  ]),
  texture('Chevrons', 'Line', 14, [
    { type: 'path', d: 'M1 6 L7 2 L13 6', fill: 'none', stroke: DARK, sw: 1.3 },
    { type: 'path', d: 'M1 11 L7 7 L13 11', fill: 'none', stroke: LIGHT, sw: 1 },
  ]),
  texture('Hex dots', 'Dots', 16, [
    { type: 'circle', cx: 4, cy: 4, r: 1.5, fill: DARK },
    { type: 'circle', cx: 12, cy: 4, r: 1.5, fill: LIGHT },
    { type: 'circle', cx: 8, cy: 11, r: 1.5, fill: DARK },
  ]),
  texture('Noise blocks', 'Grain', 12, [
    { type: 'rect', x: 1, y: 1, w: 3, h: 2, fill: DARK },
    { type: 'rect', x: 6, y: 3, w: 2, h: 3, fill: LIGHT },
    { type: 'rect', x: 3, y: 7, w: 4, h: 2, fill: DARK, opacity: 0.7 },
    { type: 'rect', x: 8, y: 8, w: 2, h: 2, fill: LIGHT },
  ]),
  texture('Confetti', 'Grain', 18, [
    { type: 'rect', x: 2, y: 3, w: 3, h: 1.2, fill: DARK },
    { type: 'rect', x: 10, y: 5, w: 1.2, h: 3, fill: LIGHT },
    { type: 'circle', cx: 6, cy: 12, r: 1.1, fill: DARK },
    { type: 'rect', x: 12, y: 12, w: 2.4, h: 2.4, fill: LIGHT },
  ]),
  texture('Linen', 'Hatch', 8, [
    { type: 'line', x1: 0, y1: 2, x2: 8, y2: 2, stroke: DARK, sw: 0.45 },
    { type: 'line', x1: 2, y1: 0, x2: 2, y2: 8, stroke: LIGHT, sw: 0.4 },
    { type: 'line', x1: 0, y1: 6, x2: 8, y2: 6, stroke: DARK, sw: 0.35 },
  ]),
  texture('Mesh', 'Grid', 10, [
    { type: 'circle', cx: 5, cy: 5, r: 3.2, fill: 'none', stroke: DARK, sw: 0.7 },
    { type: 'line', x1: 0, y1: 5, x2: 10, y2: 5, stroke: LIGHT, sw: 0.5 },
    { type: 'line', x1: 5, y1: 0, x2: 5, y2: 10, stroke: LIGHT, sw: 0.5 },
  ]),
  texture('Pinstripe', 'Stripes', 5, [
    { type: 'rect', x: 0, y: 0, w: 0.6, h: 5, fill: DARK },
    { type: 'rect', x: 2.2, y: 0, w: 0.35, h: 5, fill: LIGHT },
  ]),
  texture('Rain', 'Line', 12, [
    { type: 'line', x1: 3, y1: 1, x2: 1, y2: 7, stroke: DARK, sw: 1 },
    { type: 'line', x1: 8, y1: 4, x2: 6, y2: 11, stroke: LIGHT, sw: 0.9 },
  ]),
  texture('Circuit', 'Line', 16, [
    { type: 'path', d: 'M1 4 H7 V12 H14', fill: 'none', stroke: DARK, sw: 1 },
    { type: 'circle', cx: 7, cy: 4, r: 1.1, fill: LIGHT },
    { type: 'circle', cx: 14, cy: 12, r: 1.1, fill: DARK },
  ]),
];
