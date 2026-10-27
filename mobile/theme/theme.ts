import { ColorScheme, darkColors, lightColors } from "./colors";
import { elevation } from "./elevation";
import { radius, spacing } from "./spacing";
import { buildTypography, Typography } from "./typography";

export type SchemeName = "light" | "dark";

export type Theme = {
  scheme: SchemeName;
  fontsLoaded: boolean;
  colors: ColorScheme;
  typography: Typography;
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
};

const cache = new Map<string, Theme>();

/** The theme for a color scheme. Cached, so the same inputs always give the same object. */
export function getTheme(scheme: SchemeName, fontsLoaded = true): Theme {
  const key = `${scheme}:${fontsLoaded}`;
  let theme = cache.get(key);
  if (!theme) {
    theme = {
      scheme,
      fontsLoaded,
      colors: scheme === "dark" ? darkColors : lightColors,
      typography: buildTypography(fontsLoaded),
      spacing,
      radius,
      elevation,
    };
    cache.set(key, theme);
  }
  return theme;
}
