import { ViewStyle } from "react-native";
import { palette } from "./palette";

export type ElevationLevel = 0 | 1 | 2 | 3;

/**
 * DESIGN.md "Elevation & Depth", translated to React Native: iOS gets one soft shadow close to
 * the CSS ambient shadow, Android gets `elevation`. Level 2 is tinted crimson (urgent alerts,
 * floating navigation). In dark mode shadows are barely visible, so cards also keep a border.
 */
export const elevation: Record<ElevationLevel, ViewStyle> = {
  0: {},
  1: {
    shadowColor: palette.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  2: {
    shadowColor: palette.crimson500,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  3: {
    shadowColor: palette.slate900,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
};
