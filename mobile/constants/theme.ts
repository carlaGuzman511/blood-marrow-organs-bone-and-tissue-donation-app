import { Dimensions } from "react-native";
import { getTheme } from "@/theme";

/**
 * Legacy bridge (US-MOB-08). The old COLORS / SIZES / FONTS keys now point at the Vitalis
 * DonaVida tokens (light scheme), so every screen is on-brand before it is migrated.
 * New code must use `useTheme()` / `makeStyles()` from `@/theme`; screens move off this file
 * one by one and it is deleted when nothing imports it.
 */
const { colors: c, typography: t, spacing, radius } = getTheme("light");
const { height, width } = Dimensions.get("window");

/** @deprecated Use `useTheme().colors`. */
export const COLORS = {
    theme: "sans-serif",
    primary: c.primary,
    secondary: c.secondary,
    white: c.surface,
    secondaryWhite: c.background,
    black: c.text,
    secondaryBlack: c.text,
    gray: c.textMuted, // was #F8F8F8, which made placeholders and icons invisible
    secondaryGray: c.textMuted,
    green: c.tones.viable.foreground,
    primaryDark: c.primaryPressed,
    error: c.error,
    success: c.success,
    warning: c.tones.observation.foreground,
    danger: c.primaryText,
    background: c.background,
    surface: c.surface,
    border: c.border,
    text: c.text,
    textSecondary: c.textMuted,
    disabled: c.textDisabled,
    lightGreen: c.tones.viable.background,
    lightRed: c.tones.urgent.background,
    red: c.primaryText,
};

/** @deprecated Use `useTheme().spacing`, `.radius` and `.typography`. */
export const SIZES = {
    base: spacing.xs,
    font: 14,
    radius: radius.lg,
    padding: spacing.md,
    padding2: spacing.sm,
    padding3: spacing.md,
    //font sizes
    largeTitle: 48,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body1: 18,
    body2: 18,
    body3: 14,
    body4: 14,
    body5: 12,
    //app dimensions
    height,
    width,
    margin: spacing.gutter,
};

/** @deprecated Use `AppText variant=...` or `useTheme().typography`. */
export const FONTS = {
    largeTitle: t.displayLg,
    h1: t.headlineXlMobile,
    h2: t.headlineLg,
    h3: t.headlineMd,
    h4: t.titleSm,
    body1: t.bodyLg,
    body2: t.bodyLg,
    body3: t.bodySm, // was 14px; body-sm keeps card layouts as they were
    body4: t.bodySm, // was 12px regular: below the smallest body size in the design
};

const AppTheme = { COLORS, SIZES, FONTS };
export default AppTheme;
