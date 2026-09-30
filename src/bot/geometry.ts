export const SAMPLES = 96;
export const TAU = Math.PI * 2;
export const BASE_RADIUS = 84;

export function thetaAt(index: number, samples = SAMPLES): number {
  return (index / samples) * TAU;
}

export function normalizeProfile(raw: number[], floor = 0.3): number[] {
  let max = 0;
  for (const value of raw) if (value > max) max = value;
  if (max < 1e-6) return raw.map(() => 1);
  const scaled = raw.map((value) => Math.max(1e-4, value) / max);
  const min = Math.min(...scaled);
  if (min >= floor || min >= 0.999) return scaled;
  const span = 1 - min;
  return scaled.map((value) => floor + (1 - floor) * ((value - min) / span));
}

export function samplePolar(fn: (theta: number) => number, samples = SAMPLES): number[] {
  const raw = new Array<number>(samples);
  for (let i = 0; i < samples; i++) raw[i] = fn(thetaAt(i, samples));
  return normalizeProfile(raw);
}

export interface Point {
  x: number;
  y: number;
}

export function rayRadius(theta: number, points: Point[]): number {
  const dx = Math.cos(theta);
  const dy = Math.sin(theta);
  let best = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const det = dx * ey - dy * ex;
    if (Math.abs(det) < 1e-10) continue;
    const t = (a.x * ey - a.y * ex) / det;
    const u = (a.x * dy - a.y * dx) / det;
    if (t >= 0 && u >= -1e-5 && u <= 1 + 1e-5 && t > best) best = t;
  }
  return best;
}

export function profileFromPoints(points: Point[]): number[] {
  let cx = 0;
  let cy = 0;
  for (const point of points) {
    cx += point.x;
    cy += point.y;
  }
  cx /= points.length;
  cy /= points.length;
  const shifted = points.map((point) => ({ x: point.x - cx, y: point.y - cy }));
  const raw = new Array<number>(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) raw[i] = rayRadius(thetaAt(i), shifted);
  return normalizeProfile(raw);
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export function profileFromCircles(circles: Circle[]): number[] {
  const raw = new Array<number>(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const theta = thetaAt(i);
    const dx = Math.cos(theta);
    const dy = Math.sin(theta);
    let best = 0;
    for (const circle of circles) {
      const toward = dx * circle.x + dy * circle.y;
      const disc = toward * toward - (circle.x * circle.x + circle.y * circle.y - circle.r * circle.r);
      if (disc < 0) continue;
      const hit = toward + Math.sqrt(disc);
      if (hit > best) best = hit;
    }
    raw[i] = best;
  }
  return normalizeProfile(raw);
}

export function profileAt(profile: number[], theta: number): number {
  const turns = ((theta % TAU) + TAU) % TAU;
  const position = (turns / TAU) * profile.length;
  const i0 = Math.floor(position) % profile.length;
  const i1 = (i0 + 1) % profile.length;
  const mix = position - Math.floor(position);
  return profile[i0] * (1 - mix) + profile[i1] * mix;
}

export function catmullRomClosed(points: Array<[number, number]>): string {
  const count = points.length;
  if (count < 3) return '';
  const fmt = (value: number) => value.toFixed(2);
  let path = `M ${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 0; i < count; i++) {
    const p0 = points[(i - 1 + count) % count];
    const p1 = points[i];
    const p2 = points[(i + 1) % count];
    const p3 = points[(i + 2) % count];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return `${path} Z`;
}

export function radiiToPath(
  radii: number[],
  scaleX: number,
  scaleY: number,
  rotation: number,
  originX: number,
  originY: number,
  baseRadius = BASE_RADIUS,
): string {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const points: Array<[number, number]> = radii.map((radius, index) => {
    const theta = thetaAt(index, radii.length);
    const x = Math.cos(theta) * radius * baseRadius * scaleX;
    const y = Math.sin(theta) * radius * baseRadius * scaleY;
    return [x * cos - y * sin + originX, x * sin + y * cos + originY];
  });
  return catmullRomClosed(points);
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12;
    const value = lightness - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.min(1, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

export function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const channel = (start: number) => {
    const srgb = parseInt(value.slice(start, start + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  const red = channel(0);
  const green = channel(2);
  const blue = channel(4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export const STAGE_PAPER = '#f6f0e6';

function hexRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export function mixHex(from: string, to: string, amount: number): string {
  const start = hexRgb(from);
  const end = hexRgb(to);
  const channel = (index: number) =>
    Math.round(start[index] + (end[index] - start[index]) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/** Pick a near-black or near-white that stays readable against `hex`. */
export function contrastInk(hex: string): string {
  const luminance = relativeLuminance(hex);
  const dark = relativeLuminance('#1c1814');
  const light = relativeLuminance('#fffaf2');
  const ratio = (a: number, b: number) => {
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  };
  return ratio(luminance, dark) >= ratio(luminance, light) ? '#1c1814' : '#fffaf2';
}

export function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
