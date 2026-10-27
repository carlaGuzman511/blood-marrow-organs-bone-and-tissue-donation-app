import { TextStyle } from "react-native";

export type FontWeight = "400" | "500" | "600" | "700" | "800";

/**
 * One loaded font file per weight (see `app/_layout.tsx`). With a custom font, Android picks
 * the weight by family name, so `fontWeight` must not be set too or it may fall back to the
 * system font.
 */
export const fontFamilies: Record<FontWeight, string> = {
  "400": "PlusJakartaSans_400Regular",
  "500": "PlusJakartaSans_500Medium",
  "600": "PlusJakartaSans_600SemiBold",
  "700": "PlusJakartaSans_700Bold",
  "800": "PlusJakartaSans_800ExtraBold",
};

/** Font for a weight: the Plus Jakarta Sans file, or the system font with `fontWeight` if it didn't load. */
export function fontFor(weight: FontWeight, fontsLoaded: boolean): TextStyle {
  return fontsLoaded ? { fontFamily: fontFamilies[weight] } : { fontWeight: weight };
}

type Scale = { size: number; lineHeight: number; tracking: number; weight: FontWeight };

// DESIGN.md typography (rem x 16 = px; tracking in em).
const scale = {
  displayLg: { size: 48, lineHeight: 56, tracking: -0.03, weight: "800" },
  headlineXl: { size: 36, lineHeight: 44, tracking: -0.02, weight: "700" },
  headlineXlMobile: { size: 28, lineHeight: 36, tracking: -0.02, weight: "700" },
  headlineLg: { size: 24, lineHeight: 32, tracking: -0.015, weight: "700" },
  headlineMd: { size: 20, lineHeight: 28, tracking: -0.01, weight: "600" },
  titleSm: { size: 18, lineHeight: 24, tracking: 0, weight: "600" },
  bodyLg: { size: 18, lineHeight: 28, tracking: 0, weight: "400" },
  bodyMd: { size: 16, lineHeight: 24, tracking: 0, weight: "400" },
  bodySm: { size: 14, lineHeight: 20, tracking: 0.005, weight: "400" },
  labelMd: { size: 14, lineHeight: 20, tracking: 0.01, weight: "600" },
  labelSm: { size: 12, lineHeight: 16, tracking: 0.02, weight: "600" },
  badge: { size: 11, lineHeight: 14, tracking: 0.04, weight: "700" },
} satisfies Record<string, Scale>;

export type TextVariant = keyof typeof scale;

export type Typography = Record<TextVariant, TextStyle>;

export function buildTypography(fontsLoaded: boolean): Typography {
  const entries = Object.entries(scale).map(([name, s]) => [
    name,
    {
      ...fontFor(s.weight, fontsLoaded),
      fontSize: s.size,
      lineHeight: s.lineHeight,
      letterSpacing: Math.round(s.size * s.tracking * 100) / 100,
    } satisfies TextStyle,
  ]);
  return Object.fromEntries(entries) as Typography;
}

/** Largest text-size multiplier honored from the system setting before layouts break. */
export const MAX_FONT_SCALE = 1.6;
