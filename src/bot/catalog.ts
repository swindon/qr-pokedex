import { ANIMATIONS } from './animations';
import { GRADIENTS, SOLIDS } from './palette';
import { SHAPES } from './shapes';
import { TEXTURES } from './textures';

export { ANIMATIONS, GRADIENTS, SHAPES, SOLIDS, TEXTURES };

export const CATALOG_COUNTS = {
  shapes: SHAPES.length,
  animations: ANIMATIONS.length,
  solids: SOLIDS.length,
  gradients: GRADIENTS.length,
  textures: TEXTURES.length,
} as const;

export const REQUIREMENTS = {
  shapes: 100,
  animations: 100,
  solids: 100,
  gradients: 100,
  textures: 50,
} as const;
