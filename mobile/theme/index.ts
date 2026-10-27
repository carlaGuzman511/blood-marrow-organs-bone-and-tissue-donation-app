// Vitalis DonaVida design system (US-MOB-08). Everything visual comes from here.
export { getTheme } from "./theme";
export type { Theme, SchemeName } from "./theme";
export { ThemeProvider, useTheme, makeStyles } from "./ThemeProvider";
export { lightColors, darkColors } from "./colors";
export type { ColorScheme, ClinicalTone, ToneColors } from "./colors";
export { buildTypography, fontFamilies, fontFor, MAX_FONT_SCALE } from "./typography";
export type { TextVariant, FontWeight } from "./typography";
export { spacing, radius, MIN_TOUCH_TARGET, hitSlopFor } from "./spacing";
export { elevation } from "./elevation";
export type { ElevationLevel } from "./elevation";
