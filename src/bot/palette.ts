import { hslToHex, slug } from './geometry';
import type { GradientDef, SolidColor } from './types';

const HUES: Array<[number, string]> = [
  [0, 'Red'],
  [12, 'Vermilion'],
  [24, 'Orange'],
  [36, 'Amber'],
  [48, 'Gold'],
  [64, 'Yellow'],
  [84, 'Lime'],
  [108, 'Chartreuse'],
  [136, 'Green'],
  [158, 'Emerald'],
  [172, 'Teal'],
  [188, 'Cyan'],
  [202, 'Sky'],
  [216, 'Blue'],
  [232, 'Cobalt'],
  [252, 'Indigo'],
  [270, 'Violet'],
  [290, 'Purple'],
  [316, 'Magenta'],
  [338, 'Rose'],
];

const TONES: Array<[string, number, number]> = [
  ['Pale', 0.46, 0.78],
  ['Soft', 0.58, 0.64],
  ['Bright', 0.8, 0.52],
  ['Deep', 0.66, 0.36],
  ['Dark', 0.5, 0.24],
];

const NEUTRALS: Array<[string, string]> = [
  ['Ink', '#16181d'],
  ['Charcoal', '#2c3138'],
  ['Slate', '#5d6670'],
  ['Fog', '#b7c0c7'],
  ['Mist', '#e4e8ea'],
  ['Cream', '#f6f0e4'],
  ['Sand', '#e4d2b6'],
  ['Clay', '#b08968'],
  ['Cocoa', '#6b4a38'],
  ['Blush', '#e7c8c0'],
  ['Stone', '#8d887f'],
  ['Paper', '#fffdf8'],
];

function claimHex(
  used: Set<string>,
  hue: number,
  saturation: number,
  lightness: number,
): string {
  let sat = saturation;
  let light = lightness;
  let hex = hslToHex(hue, sat, light);
  let guard = 0;
  while (used.has(hex) && guard < 24) {
    light = Math.min(0.92, light + 0.012);
    sat = Math.max(0.08, sat - 0.01);
    hex = hslToHex(hue, sat, light);
    guard += 1;
  }
  used.add(hex);
  return hex;
}

function buildSolids(): SolidColor[] {
  const used = new Set<string>();
  const list: SolidColor[] = [];
  for (const [hue, hueName] of HUES) {
    for (const [tone, saturation, lightness] of TONES) {
      const name = `${tone} ${hueName}`;
      const hex = claimHex(used, hue, saturation, lightness);
      list.push({ id: `solid-${slug(name)}`, name, hex });
    }
  }
  for (const [name, hex] of NEUTRALS) {
    let color = hex.toLowerCase();
    if (used.has(color)) {
      color = claimHex(used, 30, 0.08, 0.7);
    } else {
      used.add(color);
    }
    list.push({ id: `solid-${slug(name)}`, name, hex: color });
  }
  return list;
}

export const SOLIDS: SolidColor[] = buildSolids();

function buildGradients(): GradientDef[] {
  const list: GradientDef[] = [];
  const angles = [18, 45, 90, 135, 160, 200, 270, 315];
  let cursor = 0;
  while (list.length < 100) {
    const first = SOLIDS[cursor % SOLIDS.length];
    let second = SOLIDS[(cursor * 7 + 11) % SOLIDS.length];
    if (second.hex === first.hex) second = SOLIDS[(cursor + 5) % SOLIDS.length];
    const third = SOLIDS[(cursor * 5 + 2) % SOLIDS.length];
    const useThird = cursor % 4 === 0 && third.hex !== first.hex && third.hex !== second.hex;
    const kind = cursor % 5 === 0 ? 'radial' : 'linear';
    const angle = angles[cursor % angles.length];
    const stops = [
      { offset: 0, color: first.hex },
      ...(useThird ? [{ offset: 0.52, color: third.hex }] : []),
      { offset: 1, color: second.hex },
    ];
    const name =
      kind === 'radial'
        ? `Bloom ${first.name} / ${second.name}`
        : `${angle}° ${first.name} / ${second.name}`;
    list.push({
      id: `gradient-${cursor}`,
      name,
      kind,
      angle,
      stops,
    });
    cursor += 1;
  }
  return list;
}

export const GRADIENTS: GradientDef[] = buildGradients();
