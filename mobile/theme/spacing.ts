/** DESIGN.md 8pt rhythm, with 4pt half-steps for compact badges. */
export const spacing = {
  "2xs": 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  /** Side padding of a screen and gap between columns on phones. */
  gutter: 16,
} as const;

/** DESIGN.md "rounded". Cards use `card` (20px, "Cards: 20px radius"). */
export const radius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  card: 20,
  xl: 24,
  full: 9999,
} as const;

/** Minimum touch target (DESIGN.md "Safe Tap Zones"). */
export const MIN_TOUCH_TARGET = 48;

/** `hitSlop` that grows a smaller control's touch area to at least 48x48. */
export function hitSlopFor(width: number, height: number = width) {
  const x = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - width) / 2));
  const y = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - height) / 2));
  return { top: y, bottom: y, left: x, right: x };
}
