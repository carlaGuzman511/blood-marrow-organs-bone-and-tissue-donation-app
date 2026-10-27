/**
 * Raw colors of the Vitalis DonaVida design system (Stitch: vitalis_humanitas/DESIGN.md).
 * This is the only file allowed to contain color literals. Screens and components never
 * import it: they use the semantic roles in `colors.ts` through `useTheme()`.
 */
export const palette = {
  white: "#FFFFFF",

  // Crimson: identity, urgent calls, primary actions (DESIGN.md "Primary").
  crimson50: "#FFF1F2",
  crimson100: "#FEE2E2", // blood badge background
  crimson300: "#FDA4AF",
  crimson500: "#E11D48", // primary fill
  crimson600: "#BE123C", // pressed state and red text
  crimson700: "#B80035", // M3 "primary" token
  crimson950: "#4C0519",
  crimsonInverse: "#FFB3B6", // M3 "inverse-primary"

  // Medical cyan: infrastructure, verified centers, logistics (DESIGN.md "Secondary").
  cyan100: "#E0F2FE",
  cyan300: "#93CCFF", // M3 "secondary-fixed-dim"
  cyan400: "#5BB8FE", // M3 "secondary-container"
  cyan500: "#0284C7", // focus ring
  cyan700: "#0369A1", // text and solid fill (white on #0284C7 is below AA)
  cyan950: "#082F49",

  // Life emerald: matches, viability, impact (DESIGN.md "Tertiary").
  emerald100: "#D1FAE5",
  emerald300: "#6EE7B7",
  emerald500: "#10B981", // live pulse dot (decorative only: too light for text)
  emerald700: "#047857",
  emerald950: "#022C22",

  // Amber: "observation". Not in DESIGN.md; agreed default for both apps.
  amber100: "#FEF3C7",
  amber300: "#FCD34D",
  amber700: "#B45309",
  amber950: "#451A03",

  // Slate: text, canvas and borders.
  slate50: "#F8FAFC", // canvas tint, input background
  slate100: "#F1F5F9", // recessed wells
  slate200: "#E2E8F0", // borders
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B", // secondary text
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A", // primary text
  navy900: "#131B2E", // M3 "on-surface", used as the dark surface
  navy950: "#0B1220",

  errorLight: "#BA1A1A",
  errorDark: "#FFB4AB",
} as const;

/** Adds an alpha channel to a #RRGGBB color. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
