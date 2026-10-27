import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";

import { buildTypography, darkColors, getTheme, hitSlopFor, lightColors, ThemeProvider, useTheme } from "@/theme";

const mockColorScheme = jest.fn<"light" | "dark" | null, []>(() => "light");
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: () => mockColorScheme(),
}));

function SchemeProbe() {
  const theme = useTheme();
  return <Text testID="probe">{`${theme.scheme}|${theme.colors.background}|${theme.typography.bodyMd.fontFamily ?? "system"}`}</Text>;
}

describe("useTheme", () => {
  it("follows the device: dark mode gives the dark colors", () => {
    mockColorScheme.mockReturnValue("dark");
    render(<SchemeProbe />);
    expect(screen.getByTestId("probe")).toHaveTextContent(`dark|${darkColors.background}|PlusJakartaSans_400Regular`);
  });

  it("uses light when the device has no preference", () => {
    mockColorScheme.mockReturnValue(null);
    render(<SchemeProbe />);
    expect(screen.getByTestId("probe")).toHaveTextContent(`light|${lightColors.background}`, { exact: false });
  });

  it("a ThemeProvider can force a scheme and report a font fallback", () => {
    mockColorScheme.mockReturnValue("dark");
    render(
      <ThemeProvider scheme="light" fontsLoaded={false}>
        <SchemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent(`light|${lightColors.background}|system`);
  });

  it("returns the same theme object for the same inputs (styles are cached per theme)", () => {
    expect(getTheme("dark", true)).toBe(getTheme("dark", true));
    expect(getTheme("dark", true)).not.toBe(getTheme("light", true));
  });
});

describe("typography", () => {
  it("with Plus Jakarta Sans, picks the weight by font file and sets no fontWeight", () => {
    const t = buildTypography(true);
    expect(t.headlineLg).toMatchObject({ fontFamily: "PlusJakartaSans_700Bold", fontSize: 24, lineHeight: 32 });
    expect(t.headlineLg.fontWeight).toBeUndefined();
    expect(t.displayLg.fontFamily).toBe("PlusJakartaSans_800ExtraBold");
  });

  it("if the font didn't load, falls back to the system font with the same weights and sizes", () => {
    const t = buildTypography(false);
    expect(t.headlineLg).toMatchObject({ fontWeight: "700", fontSize: 24, lineHeight: 32 });
    expect(t.headlineLg.fontFamily).toBeUndefined();
  });

  it("converts the em tracking from DESIGN.md to points", () => {
    const t = buildTypography(true);
    expect(t.displayLg.letterSpacing).toBeCloseTo(-1.44); // 48px x -0.03em
    expect(t.badge.letterSpacing).toBeCloseTo(0.44); // 11px x 0.04em
  });
});

describe("hitSlopFor", () => {
  it("grows a 40px control to a 48px touch area", () => {
    expect(hitSlopFor(40)).toEqual({ top: 4, bottom: 4, left: 4, right: 4 });
  });

  it("adds nothing to controls already 48px or larger", () => {
    expect(hitSlopFor(56)).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
  });
});
