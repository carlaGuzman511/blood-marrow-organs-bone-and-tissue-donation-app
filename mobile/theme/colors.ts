import { palette, withAlpha } from "./palette";

/** Clinical meaning of a status: color is never the only signal (badges also carry an icon and text). */
export type ClinicalTone = "urgent" | "observation" | "viable" | "info" | "neutral";

export type ToneColors = { background: string; foreground: string };

/** Semantic color roles. Components pick a role, never a raw color. */
export type ColorScheme = {
  background: string; // screen canvas (DESIGN.md level 0)
  surface: string; // cards and sheets (level 1)
  surfaceRecessed: string; // wells, chips, skeletons
  border: string;
  borderSubtle: string; // card perimeter
  scrim: string; // behind modal sheets (level 3)

  text: string;
  textMuted: string;
  textDisabled: string;

  primary: string; // filled primary button
  primaryPressed: string;
  onPrimary: string;
  primaryText: string; // red text and links
  primarySoft: string; // tinted backgrounds (icon containers)

  secondary: string; // filled secondary button (pressed)
  onSecondary: string;
  secondaryText: string;
  secondarySoft: string; // secondary button resting fill

  success: string; // live pulse dot, progress
  error: string;

  inputBackground: string;
  inputBackgroundFocused: string;
  focus: string; // focus outline

  bloodBadge: ToneColors;
  tones: Record<ClinicalTone, ToneColors>;
};

export const lightColors: ColorScheme = {
  background: palette.slate50,
  surface: palette.white,
  surfaceRecessed: palette.slate100,
  border: palette.slate200,
  borderSubtle: withAlpha(palette.slate200, 0.8),
  scrim: withAlpha(palette.slate900, 0.45),

  text: palette.slate900,
  textMuted: palette.slate500,
  textDisabled: palette.slate400,

  primary: palette.crimson500,
  primaryPressed: palette.crimson600,
  onPrimary: palette.white,
  primaryText: palette.crimson600,
  primarySoft: withAlpha(palette.crimson500, 0.1),

  secondary: palette.cyan700,
  onSecondary: palette.white,
  secondaryText: palette.cyan700,
  secondarySoft: withAlpha(palette.cyan500, 0.08),

  success: palette.emerald500,
  error: palette.errorLight,

  inputBackground: palette.slate50,
  inputBackgroundFocused: palette.white,
  focus: palette.cyan500,

  bloodBadge: { background: palette.crimson100, foreground: palette.crimson600 },
  tones: {
    urgent: { background: palette.crimson100, foreground: palette.crimson600 },
    observation: { background: palette.amber100, foreground: palette.amber700 },
    viable: { background: palette.emerald100, foreground: palette.emerald700 },
    info: { background: palette.cyan100, foreground: palette.cyan700 },
    neutral: { background: palette.slate100, foreground: palette.slate600 },
  },
};

/**
 * Stitch has no dark tokens. Built from the same families: surfaces from the M3 "on-surface"
 * navy, text in light slate, and the light tints (inverse-primary, secondary-fixed-dim) for
 * colored text so clinical labels keep AA contrast. Pending designer review.
 */
export const darkColors: ColorScheme = {
  background: palette.navy950,
  surface: palette.navy900,
  surfaceRecessed: palette.slate800,
  border: palette.slate700,
  borderSubtle: withAlpha(palette.slate700, 0.8),
  scrim: withAlpha(palette.navy950, 0.7),

  text: palette.slate100,
  textMuted: palette.slate400,
  textDisabled: palette.slate600,

  primary: palette.crimson500,
  primaryPressed: palette.crimson600,
  onPrimary: palette.white,
  primaryText: palette.crimsonInverse,
  primarySoft: withAlpha(palette.crimson500, 0.2),

  secondary: palette.cyan700,
  onSecondary: palette.white,
  secondaryText: palette.cyan300,
  secondarySoft: withAlpha(palette.cyan500, 0.16),

  success: palette.emerald500,
  error: palette.errorDark,

  inputBackground: palette.slate800,
  inputBackgroundFocused: palette.navy950,
  focus: palette.cyan400,

  bloodBadge: { background: palette.crimson950, foreground: palette.crimsonInverse },
  tones: {
    urgent: { background: palette.crimson950, foreground: palette.crimson300 },
    observation: { background: palette.amber950, foreground: palette.amber300 },
    viable: { background: palette.emerald950, foreground: palette.emerald300 },
    info: { background: palette.cyan950, foreground: palette.cyan300 },
    neutral: { background: palette.slate800, foreground: palette.slate300 },
  },
};
