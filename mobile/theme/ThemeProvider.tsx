import React, { createContext, useContext } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { getTheme, SchemeName, Theme } from "./theme";

type ThemeSettings = { fontsLoaded: boolean; scheme?: SchemeName };

const ThemeSettingsContext = createContext<ThemeSettings | null>(null);

type Props = {
  /** False when Plus Jakarta Sans failed to load: text falls back to the system font. */
  fontsLoaded?: boolean;
  /** Forces a scheme (design-system screen, tests). By default the device setting decides. */
  scheme?: SchemeName;
  children: React.ReactNode;
};

export function ThemeProvider({ fontsLoaded = true, scheme, children }: Props) {
  return (
    <ThemeSettingsContext.Provider value={{ fontsLoaded, scheme }}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

/** The current theme: light or dark from the device, unless a `ThemeProvider` forces one. */
export function useTheme(): Theme {
  const deviceScheme = useColorScheme();
  const settings = useContext(ThemeSettingsContext);
  const scheme = settings?.scheme ?? (deviceScheme === "dark" ? "dark" : "light");
  return getTheme(scheme, settings?.fontsLoaded ?? true);
}

/**
 * Themed styles: `const useStyles = makeStyles((t) => ({ ... }))` next to the component, then
 * `const styles = useStyles()` inside it. One StyleSheet per theme, created on first use.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (theme: Theme) => T & StyleSheet.NamedStyles<any>,
): () => T {
  const sheets = new WeakMap<Theme, T>();
  return function useStyles() {
    const theme = useTheme();
    let sheet = sheets.get(theme);
    if (!sheet) {
      sheet = StyleSheet.create(factory(theme)) as T;
      sheets.set(theme, sheet);
    }
    return sheet;
  };
}
