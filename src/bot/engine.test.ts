import { describe, expect, it } from 'vitest';
import { ANIMATIONS } from './animations';
import { sample } from './engine';
import { SHAPES } from './shapes';

function signature(shapeIndex: number, animIndex: number): string {
  const anim = ANIMATIONS[animIndex];
  const stamps = [0.15, 0.4, 0.7, 1.1, 1.8].map((time) => time);
  stamps.push(anim.duration * 0.25, anim.duration * 0.55);
  return stamps
    .map((time) => {
      const frame = sample(time, shapeIndex, animIndex);
      const eye = frame.eyes[0];
      const metric = frame.metrics;
      return [
        metric.scaleX,
        metric.scaleY,
        metric.x,
        metric.y,
        metric.rotation,
        metric.meanRadius,
        metric.eyeOpenL,
        metric.eyeOpenR,
        eye.cx,
        eye.cy,
        eye.rx,
        eye.ry,
        eye.rotate,
        frame.eyes[1].ry,
        frame.sparks.length,
        frame.rings.length,
      ]
        .map((value) => value.toFixed(3))
        .join(',');
    })
    .join('|');
}

describe('sample(t)', () => {
  it('is a pure function of time', () => {
    const first = sample(1.25, 4, 9);
    const second = sample(1.25, 4, 9);
    expect(second).toEqual(first);
  });

  it('returns a finite silhouette and two eyes', () => {
    for (let shape = 0; shape < SHAPES.length; shape += 7) {
      const frame = sample(0.4, shape, 0);
      expect(frame.path.startsWith('M')).toBe(true);
      expect(frame.path.includes('Z')).toBe(true);
      expect(frame.eyes).toHaveLength(2);
      for (const eye of frame.eyes) {
        for (const value of [eye.cx, eye.cy, eye.rx, eye.ry, eye.rotate]) {
          expect(Number.isFinite(value)).toBe(true);
        }
        expect(eye.rx).toBeGreaterThan(0);
        expect(eye.ry).toBeGreaterThan(0);
      }
    }
  });

  it('plays every animation as motion', () => {
    for (let index = 0; index < ANIMATIONS.length; index++) {
      const anim = ANIMATIONS[index];
      const poses = [0, 0.25, 0.5, 0.75].map((phase) => sample(anim.duration * phase, 0, index));
      const keys = new Set(
        poses.map(
          (frame) =>
            `${frame.metrics.scaleX.toFixed(3)}:${frame.metrics.scaleY.toFixed(3)}:${frame.metrics.x.toFixed(2)}:${frame.metrics.y.toFixed(2)}:${frame.metrics.rotation.toFixed(3)}:${frame.metrics.eyeOpenL.toFixed(3)}:${frame.metrics.eyeOpenR.toFixed(3)}:${frame.eyes[0].cx.toFixed(2)}:${frame.eyes[0].cy.toFixed(2)}:${frame.eyes[0].ry.toFixed(2)}:${frame.sparks.length}:${frame.rings.length}`,
        ),
      );
      expect(keys.size, anim.name).toBeGreaterThan(1);
    }
  });

  it('keeps animation fingerprints unique', () => {
    const seen = new Map<string, string>();
    for (let index = 0; index < ANIMATIONS.length; index++) {
      const print = signature(0, index);
      const previous = seen.get(print);
      expect(previous, `${ANIMATIONS[index].name} matches ${previous}`).toBeUndefined();
      seen.set(print, ANIMATIONS[index].name);
    }
  });
});
