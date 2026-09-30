export type FillMode = 'solid' | 'gradient';

export type GazeMode = 'fixed' | 'sway' | 'scan' | 'circle' | 'horizontal' | 'vertical';

export type PulseKind = 'sine' | 'heart';

export interface AnimSpec {
  id: string;
  name: string;
  group: string;
  duration: number;
  pingpong: boolean;
  breath: number;
  sway: number;
  bounce: number;
  hops: number;
  landSquash: number;
  spin: number;
  squash: number;
  wobble: number;
  wobbleHarmonic: number;
  shiver: number;
  lean: number;
  leanBias: number;
  shake: number;
  shakes: number;
  pulse: number;
  pulseKind: PulseKind;
  blinkAt: number;
  blinkWidth: number;
  blinks: number;
  wink: 0 | 1 | 2;
  gazeMode: GazeMode;
  gazeX: number;
  gazeY: number;
  glance: number;
  eyeOpen: number;
  eyeScale: number;
  eyeSpread: number;
  eyeRx: number;
  eyeRy: number;
  eyePulse: number;
  tiltL: number;
  tiltR: number;
  sleep: number;
  wake: boolean;
  yawn: boolean;
  orbit: number;
  orbitRadius: number;
  burst: number;
  rings: number;
  think: boolean;
  shy: boolean;
  peek: boolean;
  cross: boolean;
  startle: number;
  sigh: number;
  zz: number;
  poster: number;
  /** -1 frown, 0 flat, 1 smile. */
  mouthSmile: number;
  /** Width relative to the resting mouth. */
  mouthWidth: number;
  /** 0 is a thin line, 1 is a round open mouth. */
  mouthOpen: number;
  /** Extra openness that pulses through the loop. */
  mouthTalk: number;
}

export interface ShapeDef {
  id: string;
  name: string;
  group: string;
  profile: number[];
}

export interface SolidColor {
  id: string;
  name: string;
  hex: string;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface GradientDef {
  id: string;
  name: string;
  kind: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

export interface TextureMark {
  type: 'circle' | 'rect' | 'line' | 'path';
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  d?: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  opacity?: number;
}

export interface TextureDef {
  id: string;
  name: string;
  group: string;
  tile: number;
  marks: TextureMark[];
}

export interface EyeDraw {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
}

export interface RingDraw {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  opacity: number;
  width: number;
}

export interface SparkDraw {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

export interface FrameMetrics {
  scaleX: number;
  scaleY: number;
  x: number;
  y: number;
  rotation: number;
  meanRadius: number;
  eyeOpenL: number;
  eyeOpenR: number;
  mouthSmile: number;
  mouthOpen: number;
}

export interface Frame {
  path: string;
  eyes: [EyeDraw, EyeDraw];
  /** Mouth hole, in the same coordinates as the body path. */
  mouth: string;
  rings: RingDraw[];
  sparks: SparkDraw[];
  metrics: FrameMetrics;
}

/** What a QR code is allowed to restore. Motion is not part of it. */
export interface Identity {
  shape: number;
  mode: FillMode;
  solid: number;
  gradient: number;
  texture: number;
}

export interface Selection extends Identity {
  anim: number;
}
