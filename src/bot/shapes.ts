import {
  profileFromCircles,
  profileFromPoints,
  samplePolar,
  slug,
  TAU,
  type Point,
} from './geometry';
import type { ShapeDef } from './types';

function shape(name: string, group: string, profile: number[]): ShapeDef {
  return { id: `shape-${slug(name)}`, name, group, profile };
}

function superellipse(n: number, ax: number, ay: number): number[] {
  return samplePolar((theta) => {
    const c = Math.abs(Math.cos(theta));
    const s = Math.abs(Math.sin(theta));
    const value = (c / ax) ** n + (s / ay) ** n;
    return value ** (-1 / n);
  });
}

function star(points: number, inner: number): number[] {
  const sector = TAU / points;
  return samplePolar((theta) => {
    let angle = (theta + Math.PI / 2) % sector;
    if (angle < 0) angle += sector;
    const half = sector / 2;
    const edge = angle < half ? angle / half : (sector - angle) / half;
    return 1 - edge * (1 - inner);
  });
}

function flower(petals: number, amplitude: number, phase = 0): number[] {
  return samplePolar((theta) => 1 + amplitude * Math.cos(petals * (theta + Math.PI / 2) + phase));
}

function gear(teeth: number, depth: number): number[] {
  return samplePolar((theta) => {
    const wave = Math.sin(teeth * (theta + Math.PI / 2));
    const band = 0.5 + 0.5 * Math.tanh(wave * 8);
    return 1 - depth * (1 - band);
  });
}

function spike(points: number, depth: number): number[] {
  return samplePolar((theta) => {
    const wave = Math.cos(points * (theta + Math.PI / 2));
    const band = 0.5 + 0.5 * Math.tanh(wave * 5);
    return 1 - depth * (1 - band);
  });
}

function polygon(sides: number, roundness: number): number[] {
  const sector = TAU / sides;
  return samplePolar((theta) => {
    let angle = (theta + Math.PI / 2) % sector;
    if (angle < 0) angle += sector;
    angle -= sector / 2;
    const flat = Math.cos(Math.PI / sides) / Math.max(0.25, Math.cos(angle));
    return flat * (1 - roundness) + roundness;
  });
}

function harmonic(parts: Array<{ k: number; a: number; p: number }>): number[] {
  return samplePolar((theta) => {
    let radius = 1;
    for (const part of parts) radius += part.a * Math.cos(part.k * theta + part.p);
    return Math.max(0.25, radius);
  });
}

function asymmetric(angle: number, amount: number, harmonicK: number): number[] {
  return samplePolar((theta) => {
    const lobe = Math.max(0, Math.cos(theta - angle));
    return 0.7 + amount * lobe * lobe + 0.07 * Math.cos(harmonicK * theta + angle);
  });
}

function arcPoints(
  start: number,
  end: number,
  rx: number,
  ry: number,
  ox: number,
  oy: number,
  steps: number,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = start + ((end - start) * i) / steps;
    points.push({ x: ox + Math.cos(theta) * rx, y: oy + Math.sin(theta) * ry });
  }
  return points;
}

const rounds: Array<[string, number, number, number]> = [
  ['Circle', 2, 1, 1],
  ['Squircle', 4, 1, 1],
  ['Pillow', 6.5, 1, 1],
  ['Soft diamond', 1.35, 1, 1],
  ['Pebble', 2.7, 1.06, 0.9],
  ['Button', 3.2, 1, 0.96],
  ['Lozenge', 2, 1.42, 0.78],
];

const ellipses: Array<[string, number, number]> = [
  ['Wide oval', 1.62, 0.78],
  ['Tall oval', 0.7, 1.18],
  ['Capsule', 1.78, 0.72],
  ['Lentil', 1.35, 0.58],
  ['Platter', 1.95, 0.66],
  ['Seed', 0.62, 1.22],
  ['Tablet', 1.22, 0.84],
  ['Pill', 1.55, 0.92],
];

const polygons: Array<[string, number, number]> = [
  ['Triangle', 3, 0.08],
  ['Square', 4, 0.12],
  ['Pentagon', 5, 0.1],
  ['Hexagon', 6, 0.1],
  ['Heptagon', 7, 0.12],
  ['Octagon', 8, 0.08],
  ['Nonagon', 9, 0.14],
  ['Decagon', 10, 0.16],
];

const stars: Array<[string, number, number]> = [
  ['Three-point star', 3, 0.42],
  ['Sharp tri-star', 3, 0.34],
  ['Four-point star', 4, 0.4],
  ['Compass star', 4, 0.28],
  ['Classic star', 5, 0.42],
  ['Soft star', 5, 0.58],
  ['Six-point star', 6, 0.46],
  ['Hex star', 6, 0.32],
  ['Seven-point star', 7, 0.5],
  ['Nautical star', 8, 0.38],
  ['Eight-point star', 8, 0.52],
  ['Soft octet', 9, 0.55],
];

const flowers: Array<[string, number, number, number]> = [
  ['Trefoil', 3, 0.28, 0],
  ['Quatrefoil', 4, 0.3, 0],
  ['Five-petal', 5, 0.26, 0.2],
  ['Daisy', 6, 0.3, 0],
  ['Seven-petal', 7, 0.24, 0.4],
  ['Eight-petal', 8, 0.22, 0],
  ['Nine-petal', 9, 0.2, 0.3],
  ['Marigold', 10, 0.22, 0],
  ['Wide daisy', 5, 0.48, 0.6],
  ['Clover puff', 4, 0.5, 0.8],
  ['Aster', 12, 0.18, 0.2],
  ['Sunflower', 8, 0.42, 0.5],
];

const gears: Array<[string, number, number]> = [
  ['Cog', 6, 0.16],
  ['Fine cog', 14, 0.12],
  ['Gear', 8, 0.2],
  ['Sprocket', 10, 0.18],
  ['Ratchet', 7, 0.22],
  ['Pinion', 12, 0.14],
  ['Crown gear', 9, 0.24],
  ['Mill wheel', 16, 0.1],
];

const blobNames = [
  'Puddle',
  'Moss',
  'Dumpling',
  'Cloudlet',
  'Ink drop',
  'Jellybean',
  'River stone',
  'Gourd',
  'Acorn',
  'Fig',
  'Plum',
  'Berry',
  'Knob',
  'Nub',
  'Blob',
  'Splat',
  'Drip',
  'Melt',
  'Puff',
  'Wobble mass',
  'Organic',
  'Clay lump',
  'Dough',
  'Pebble pile',
  'Soft rock',
  'Tide pool',
  'Lichen',
  'Spore',
  'Cocoon',
  'Bud',
];

const leans: Array<[string, number, number, number]> = [
  ['Lean left', Math.PI, 0.55, 2],
  ['Lean right', 0, 0.55, 2],
  ['Top heavy', -Math.PI / 2, 0.62, 3],
  ['Bottom heavy', Math.PI / 2, 0.62, 3],
  ['Left bulge', Math.PI * 0.85, 0.48, 4],
  ['Right bulge', Math.PI * 0.15, 0.48, 5],
  ['Shoulder', -Math.PI * 0.72, 0.7, 2],
  ['Hip', Math.PI * 0.62, 0.58, 3],
];

const spikes: Array<[string, number, number]> = [
  ['Burst', 10, 0.42],
  ['Spark', 14, 0.34],
  ['Urchin', 18, 0.28],
  ['Thistle', 7, 0.48],
  ['Nova', 12, 0.4],
  ['Crystal burst', 5, 0.5],
];

function heartProfile(): number[] {
  const points: Point[] = [];
  const count = 180;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({ x, y });
  }
  return profileFromPoints(points);
}

function teardropProfile(): number[] {
  const points = [
    ...arcPoints(Math.PI, TAU, 0.82, 0.7, 0, -0.08, 36),
    { x: 0, y: 1.2 },
  ];
  return profileFromPoints(points);
}

function eggProfile(): number[] {
  return samplePolar((theta) => {
    const c = Math.abs(Math.cos(theta));
    const s = Math.abs(Math.sin(theta));
    const base = (c / 0.86) ** 2.2 + (s / 1.05) ** 2.2;
    const radius = base ** (-1 / 2.2);
    return radius * (1 + 0.16 * Math.sin(theta));
  });
}

function leafProfile(): number[] {
  const points: Point[] = [
    { x: 0, y: -1.15 },
    { x: 0.18, y: -0.72 },
    { x: 0.52, y: -0.18 },
    { x: 0.34, y: 0.42 },
    { x: 0.14, y: 0.86 },
    { x: 0, y: 1.05 },
    { x: -0.14, y: 0.86 },
    { x: -0.34, y: 0.42 },
    { x: -0.52, y: -0.18 },
    { x: -0.18, y: -0.72 },
  ];
  return profileFromPoints(points);
}

function bellProfile(): number[] {
  const points: Point[] = [
    { x: 0, y: -0.78 },
    { x: 0.32, y: -0.58 },
    { x: 0.7, y: -0.18 },
    { x: 0.78, y: 0.28 },
    { x: 0.46, y: 0.78 },
    { x: 0, y: 0.98 },
    { x: -0.46, y: 0.78 },
    { x: -0.78, y: 0.28 },
    { x: -0.7, y: -0.18 },
    { x: -0.32, y: -0.58 },
  ];
  return profileFromPoints(points);
}

function shieldProfile(): number[] {
  const points: Point[] = [
    { x: 0, y: -1.02 },
    { x: 0.72, y: -0.58 },
    { x: 0.86, y: 0.08 },
    { x: 0.42, y: 0.7 },
    { x: 0, y: 1.08 },
    { x: -0.42, y: 0.7 },
    { x: -0.86, y: 0.08 },
    { x: -0.72, y: -0.58 },
  ];
  return profileFromPoints(points);
}

function gemProfile(): number[] {
  const points: Point[] = [
    { x: 0, y: -1.05 },
    { x: 0.46, y: -0.62 },
    { x: 0.78, y: -0.08 },
    { x: 0.42, y: 0.72 },
    { x: 0, y: 1.02 },
    { x: -0.42, y: 0.72 },
    { x: -0.78, y: -0.08 },
    { x: -0.46, y: -0.62 },
  ];
  return profileFromPoints(points);
}

function buildShapes(): ShapeDef[] {
  const list: ShapeDef[] = [];
  const add = (entry: ShapeDef) => {
    if (list.some((item) => item.id === entry.id || item.name === entry.name)) {
      throw new Error(`Duplicate shape: ${entry.name}`);
    }
    list.push(entry);
  };

  for (const [name, n, ax, ay] of rounds) add(shape(name, 'Round', superellipse(n, ax, ay)));
  add(shape('Coin', 'Round', gear(18, 0.11)));
  for (const [name, ax, ay] of ellipses) add(shape(name, 'Ellipse', superellipse(2, ax, ay)));
  for (const [name, sides, roundness] of polygons) add(shape(name, 'Polygon', polygon(sides, roundness)));
  for (const [name, points, inner] of stars) add(shape(name, 'Star', star(points, inner)));
  for (const [name, petals, amplitude, phase] of flowers) {
    add(shape(name, 'Flower', flower(petals, amplitude, phase)));
  }
  for (const [name, teeth, depth] of gears) add(shape(name, 'Gear', gear(teeth, depth)));

  blobNames.forEach((name, index) => {
    const k1 = 2 + (index % 5);
    const k2 = 3 + (index % 7);
    const k3 = 1 + (index % 4);
    add(
      shape(
        name,
        'Blob',
        harmonic([
          { k: k1, a: 0.14 + (index % 5) * 0.035, p: index * 0.71 },
          { k: k2, a: 0.08 + (index % 4) * 0.03, p: index * 1.17 },
          { k: k3, a: 0.05 + (index % 3) * 0.02, p: index * 0.43 + 0.6 },
        ]),
      ),
    );
  });

  for (const [name, angle, amount, harmonicK] of leans) {
    add(shape(name, 'Asymmetric', asymmetric(angle, amount, harmonicK)));
  }

  add(shape('Heart', 'Symbol', heartProfile()));
  add(shape('Teardrop', 'Symbol', teardropProfile()));
  add(shape('Egg', 'Symbol', eggProfile()));
  add(shape('Bean', 'Symbol', profileFromCircles([
    { x: -0.22, y: 0.02, r: 0.72 },
    { x: 0.38, y: -0.04, r: 0.46 },
  ])));
  add(shape('Peanut', 'Symbol', profileFromCircles([
    { x: -0.46, y: 0, r: 0.5 },
    { x: 0.46, y: 0, r: 0.5 },
  ])));
  add(shape('Shield', 'Symbol', shieldProfile()));
  add(shape('Cloud', 'Symbol', profileFromCircles([
    { x: 0, y: 0.12, r: 0.52 },
    { x: -0.48, y: 0.16, r: 0.4 },
    { x: 0.5, y: 0.14, r: 0.38 },
    { x: -0.22, y: -0.28, r: 0.36 },
    { x: 0.26, y: -0.24, r: 0.34 },
  ])));
  add(shape('Gem', 'Symbol', gemProfile()));
  add(shape('Leaf', 'Symbol', leafProfile()));
  add(shape('Bell', 'Symbol', bellProfile()));

  for (const [name, points, depth] of spikes) add(shape(name, 'Spike', spike(points, depth)));

  return list;
}

export const SHAPES: ShapeDef[] = buildShapes();
