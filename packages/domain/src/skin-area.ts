export const SKIN_AREA_REGIONS = [
  'FACE',
  'NECK',
  'CHEST',
  'BACK',
  'ARM',
  'HAND',
  'LEG',
  'OTHER',
] as const;
export type SkinAreaRegion = (typeof SKIN_AREA_REGIONS)[number];
export const SKIN_AREA_SIDES = ['LEFT', 'RIGHT', 'NOT_APPLICABLE'] as const;
export type SkinAreaSide = (typeof SKIN_AREA_SIDES)[number];
export interface SkinArea {
  readonly region: SkinAreaRegion;
  readonly side: SkinAreaSide;
}

const ALLOWED_SIDES_BY_REGION = {
  FACE: ['LEFT', 'RIGHT', 'NOT_APPLICABLE'],
  NECK: ['LEFT', 'RIGHT', 'NOT_APPLICABLE'],
  CHEST: ['LEFT', 'RIGHT', 'NOT_APPLICABLE'],
  BACK: ['LEFT', 'RIGHT', 'NOT_APPLICABLE'],
  ARM: ['LEFT', 'RIGHT'],
  HAND: ['LEFT', 'RIGHT'],
  LEG: ['LEFT', 'RIGHT'],
  OTHER: ['LEFT', 'RIGHT', 'NOT_APPLICABLE'],
} as const satisfies Record<SkinAreaRegion, readonly SkinAreaSide[]>;

export function isSkinAreaSideAllowed(region: SkinAreaRegion, side: SkinAreaSide): boolean {
  return (ALLOWED_SIDES_BY_REGION[region] as readonly SkinAreaSide[]).includes(side);
}
