import { darkColors, lightColors } from "@/theme";
import { AA_LARGE_OR_UI, AA_TEXT, contrastRatio } from "@/theme/contrast";
import type { ColorScheme } from "@/theme";

/** Every text color on every background it is used on, plus the focus ring. */
function pairs(c: ColorScheme): [string, string, string, number, string?][] {
  const toneEntries = Object.entries(c.tones) as [string, { background: string; foreground: string }][];
  return [
    ["text on background", c.text, c.background, AA_TEXT],
    ["text on surface", c.text, c.surface, AA_TEXT],
    ["text on recessed", c.text, c.surfaceRecessed, AA_TEXT],
    ["text on input", c.text, c.inputBackground, AA_TEXT],
    ["muted text on background", c.textMuted, c.background, AA_TEXT],
    ["muted text on surface", c.textMuted, c.surface, AA_TEXT],
    ["placeholder on input", c.textMuted, c.inputBackground, AA_TEXT],
    ["primary button label", c.onPrimary, c.primary, AA_TEXT],
    ["primary button label (pressed)", c.onPrimary, c.primaryPressed, AA_TEXT],
    ["red text on surface", c.primaryText, c.surface, AA_TEXT],
    ["red text on background", c.primaryText, c.background, AA_TEXT],
    ["red text on icon box", c.primaryText, c.primarySoft, AA_TEXT, c.surface],
    ["secondary button label", c.secondaryText, c.secondarySoft, AA_TEXT, c.surface],
    ["secondary button label (pressed)", c.onSecondary, c.secondary, AA_TEXT],
    ["secondary text on surface", c.secondaryText, c.surface, AA_TEXT],
    ["error text on surface", c.error, c.surface, AA_TEXT],
    ["blood badge", c.bloodBadge.foreground, c.bloodBadge.background, AA_TEXT],
    ...toneEntries.map(([tone, t]) => [`${tone} badge`, t.foreground, t.background, AA_TEXT] as [string, string, string, number]),
    ["focus ring on surface", c.focus, c.surface, AA_LARGE_OR_UI],
    ["focus ring on input", c.focus, c.inputBackgroundFocused, AA_LARGE_OR_UI],
    ["stepper current node", c.primary, c.surface, AA_LARGE_OR_UI],
  ];
}

describe.each([
  ["light", lightColors],
  ["dark", darkColors],
])("WCAG AA contrast, %s scheme", (_name, colors) => {
  const rows = pairs(colors).map(([label, fg, bg, minimum, canvas]) => ({ label, fg, bg, minimum, canvas: canvas ?? colors.surface }));
  it.each(rows)("$label", ({ fg, bg, minimum, canvas }) => {
    expect(contrastRatio(fg, bg, canvas)).toBeGreaterThanOrEqual(minimum);
  });
});

describe("contrastRatio", () => {
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
    // White on the brand crimson: about 4.7:1 (passes for body text).
    expect(contrastRatio("#FFFFFF", "#E11D48")).toBeCloseTo(4.7, 1);
  });

  it("flags the colors the old urgency badge used (white on amber / green)", () => {
    expect(contrastRatio("#FFFFFF", "#F59E0B")).toBeLessThan(AA_TEXT);
    expect(contrastRatio("#FFFFFF", "#22C55E")).toBeLessThan(AA_TEXT);
  });

  it("reads translucent backgrounds over the canvas", () => {
    expect(contrastRatio("#000000", "rgba(0, 0, 0, 0)", "#FFFFFF")).toBeCloseTo(21, 0);
  });
});
