import { BASE_RADIUS, profileAt, radiiToPath, TAU } from './geometry';
import type { AnimSpec, EyeDraw, Frame, SparkDraw } from './types';

const EYE_RX = 11;
const EYE_RY = 15.5;
const EYE_SPREAD = 24;
const EYE_Y = -8;

function wrapPulse(phase: number, center: number, width: number): number {
  if (width <= 0) return 0;
  let distance = Math.abs(phase - center);
  distance = Math.min(distance, 1 - distance);
  if (distance >= width) return 0;
  const x = distance / width;
  return 0.5 + 0.5 * Math.cos(Math.PI * x);
}

export function phaseOf(anim: AnimSpec, time: number): number {
  const duration = anim.duration;
  if (!(duration > 0) || !Number.isFinite(time)) return 0;
  if (!anim.pingpong) return ((time % duration) + duration) % duration / duration;
  const cycle = duration * 2;
  const place = ((time % cycle) + cycle) % cycle;
  return place <= duration ? place / duration : (cycle - place) / duration;
}

function heartWave(phase: number): number {
  return wrapPulse(phase, 0.16, 0.08) + wrapPulse(phase, 0.34, 0.055) * 0.7;
}

function fits(
  profile: number[],
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  margin: number,
): boolean {
  const unit = Math.hypot(x / scaleX, y / scaleY);
  const theta = Math.atan2(y / scaleY, x / scaleX);
  return unit + margin <= profileAt(profile, theta) * BASE_RADIUS;
}

function containPair(
  left: { x: number; y: number },
  right: { x: number; y: number },
  profile: number[],
  scaleX: number,
  scaleY: number,
  margin: number,
): number {
  const scaleFor = (point: { x: number; y: number }) => {
    if (fits(profile, point.x, point.y, scaleX, scaleY, margin)) return 1;
    let lo = 0;
    let hi = 1;
    for (let step = 0; step < 14; step++) {
      const mid = (lo + hi) / 2;
      if (fits(profile, point.x * mid, point.y * mid, scaleX, scaleY, margin)) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  return Math.min(scaleFor(left), scaleFor(right));
}

export function renderFrame(profile: number[], anim: AnimSpec, time: number): Frame {
  const phase = phaseOf(anim, time);
  const wave = Math.sin(phase * TAU);
  const pulseWave = anim.pulseKind === 'heart' ? heartWave(phase) : wave;

  let scaleX = 1 + anim.breath * wave + anim.pulse * pulseWave + anim.squash * wave;
  let scaleY = 1 + anim.breath * wave * 0.9 - anim.squash * wave;
  const hopPhase = (phase * Math.max(1, anim.hops)) % 1;
  const airborne = anim.bounce > 0 ? Math.sin(hopPhase * Math.PI) : 0;
  const originY = -airborne * anim.bounce + anim.sigh * Math.sin(phase * Math.PI) * 8;
  const originX = anim.sway * wave * 12 + Math.sin(phase * TAU * 10) * anim.shiver * 30;
  let rotation =
    anim.spin * phase * TAU +
    anim.lean * wave +
    anim.leanBias +
    Math.sin(phase * TAU * anim.shakes) * anim.shake +
    Math.sin(phase * TAU * 8) * anim.shiver;

  if (anim.sigh) {
    const sigh = Math.sin(phase * Math.PI);
    scaleX += sigh * anim.sigh;
    scaleY -= sigh * anim.sigh * 0.55;
  }
  if (anim.startle) {
    const hit = wrapPulse(phase, 0.18, 0.12) * anim.startle;
    scaleX += hit * 0.1;
    scaleY -= hit * 0.12;
  }

  scaleX = Math.max(0.55, scaleX);
  scaleY = Math.max(0.55, scaleY);

  const adjusted = profile.map((radius, index) => {
    const theta = (index / profile.length) * TAU;
    const wobble = 1 + anim.wobble * Math.sin(anim.wobbleHarmonic * theta + phase * TAU);
    return radius * wobble;
  });
  let mean = 0;
  for (const radius of adjusted) mean += radius;
  mean /= adjusted.length;

  let gazeX = anim.gazeX;
  let gazeY = anim.gazeY;
  if (anim.gazeMode === 'sway') gazeX = wave * 0.65;
  if (anim.gazeMode === 'horizontal') gazeX = Math.sin(phase * TAU);
  if (anim.gazeMode === 'vertical') gazeY = Math.sin(phase * TAU);
  if (anim.gazeMode === 'scan') {
    gazeX = Math.sin(phase * TAU);
    gazeY = Math.sin(phase * TAU * 2) * 0.45;
  }
  if (anim.gazeMode === 'circle') {
    gazeX = Math.cos(phase * TAU) * 0.85;
    gazeY = Math.sin(phase * TAU) * 0.55;
  }
  if (anim.glance !== 0) {
    const envelope = Math.sin(phase * Math.PI);
    gazeX = anim.glance * envelope;
    gazeY = anim.gazeY * envelope;
  }

  let openL = anim.eyeOpen;
  let openR = anim.eyeOpen;
  if (anim.blinkAt >= 0) {
    let close = 0;
    for (let blink = 0; blink < anim.blinks; blink++) {
      close = Math.max(close, wrapPulse(phase, anim.blinkAt + blink * 0.16, anim.blinkWidth));
    }
    openL *= 1 - close;
    openR *= 1 - close;
  }
  if (anim.wink === 1) openL *= 1 - wrapPulse(phase, 0.48, 0.14);
  if (anim.wink === 2) openR *= 1 - wrapPulse(phase, 0.48, 0.14);
  if (anim.shy) {
    gazeX = -0.8;
    gazeY = 0.9;
    openL *= 0.48;
    openR *= 0.48;
  }
  if (anim.think) {
    gazeX = -0.55;
    gazeY = -0.7;
    openL *= 0.62;
    openR *= 1;
  }
  if (anim.sleep > 0) {
    const flutter = wrapPulse(phase, 0.68, 0.05) * (1 - anim.sleep) * 0.55;
    openL *= 1 - anim.sleep;
    openR *= 1 - anim.sleep;
    openL += flutter;
    openR += flutter;
  }
  if (anim.wake) {
    const opened = phase * phase * (3 - 2 * phase);
    openL *= opened;
    openR *= opened;
  }
  if (anim.yawn) {
    const yawn = Math.sin(phase * Math.PI);
    openL *= 1 - 0.88 * yawn;
    openR *= 1 - 0.88 * yawn;
    scaleY += yawn * 0.08;
    scaleX -= yawn * 0.04;
  }
  if (anim.peek) {
    openL *= 0.12 + 0.88 * wrapPulse(phase, 0.58, 0.16);
    openR *= 0.22;
  }

  const eyeScale = anim.eyeScale * (1 + anim.eyePulse * (0.5 + 0.5 * pulseWave));
  const startleBoost = anim.startle ? 1 + wrapPulse(phase, 0.18, 0.12) * 0.45 * anim.startle : 1;
  const drawnScale = eyeScale * startleBoost;

  let left = {
    x: -EYE_SPREAD * anim.eyeSpread + gazeX * 14,
    y: EYE_Y + gazeY * 12,
  };
  let right = {
    x: EYE_SPREAD * anim.eyeSpread + gazeX * 14,
    y: EYE_Y + gazeY * 12,
  };
  if (anim.cross) {
    left = { x: left.x + 10, y: left.y };
    right = { x: right.x - 10, y: right.y };
  }
  if (anim.orbit !== 0) {
    const angle = phase * TAU * Math.sign(anim.orbit);
    const radiusX = 20 * anim.orbitRadius;
    const radiusY = 14 * anim.orbitRadius;
    left = { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
    right = { x: Math.cos(angle + Math.PI) * radiusX, y: Math.sin(angle + Math.PI) * radiusY };
  } else {
    const margin = 13 + drawnScale * 2;
    const fitted = containPair(left, right, adjusted, scaleX, scaleY, margin);
    left = { x: left.x * fitted, y: left.y * fitted };
    right = { x: right.x * fitted, y: right.y * fitted };
  }

  const place = (point: { x: number; y: number }, open: number, tilt: number, rxMul: number, ryMul: number): EyeDraw => {
    const sx = point.x * scaleX;
    const sy = point.y * scaleY;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
      cx: sx * cos - sy * sin + originX,
      cy: sx * sin + sy * cos + originY,
      rx: Math.max(2.2, EYE_RX * anim.eyeRx * rxMul * drawnScale * scaleX),
      ry: Math.max(1.15, EYE_RY * anim.eyeRy * ryMul * Math.max(0.04, open) * drawnScale * scaleY),
      rotate: ((rotation + tilt) * 180) / Math.PI,
    };
  };

  const thinkLeft = anim.think ? 0.82 : 1;
  const thinkRight = anim.think ? 1.08 : 1;
  const eyes: [EyeDraw, EyeDraw] = [
    place(left, openL, anim.tiltL, thinkLeft, 1),
    place(right, openR, anim.tiltR, thinkRight, 1),
  ];

  const rings = [];
  if (anim.rings > 0) {
    const count = anim.rings > 1.5 ? 2 : 1;
    for (let index = 0; index < count; index++) {
      rings.push({
        cx: originX,
        cy: originY,
        rx: 96 + index * 16 + Math.sin(phase * TAU + index) * 4,
        ry: 30 + index * 8,
        rotate: ((phase * TAU * (index % 2 === 0 ? 1 : -1)) * 180) / Math.PI,
        opacity: 0.55,
        width: 3,
      });
    }
  }

  const sparks: SparkDraw[] = [];
  if (anim.burst > 0) {
    const count = 10;
    for (let index = 0; index < count; index++) {
      const angle = (index / count) * TAU + phase * 0.6;
      const travel = (phase + index * 0.07) % 1;
      const radius = 78 + travel * 46;
      sparks.push({
        x: Math.cos(angle) * radius + originX,
        y: Math.sin(angle) * radius + originY,
        r: (1 - travel) * 4.5 * anim.burst,
        opacity: (1 - travel) * 0.9,
      });
    }
  }
  if (anim.zz > 0) {
    for (let index = 0; index < 3; index++) {
      const travel = (phase + index / 3) % 1;
      sparks.push({
        x: 40 + index * 12 + originX,
        y: -36 - travel * 52 + originY,
        r: 1.8 + travel * 1.6,
        opacity: (1 - travel) * anim.zz,
      });
    }
  }

  return {
    path: radiiToPath(adjusted, scaleX, scaleY, rotation, originX, originY),
    eyes,
    rings,
    sparks,
    metrics: {
      scaleX,
      scaleY,
      x: originX,
      y: originY,
      rotation,
      meanRadius: mean,
      eyeOpenL: openL,
      eyeOpenR: openR,
    },
  };
}
