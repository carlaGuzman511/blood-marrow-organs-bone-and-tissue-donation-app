type Rgba = { r: number; g: number; b: number; a: number };

function parse(color: string): Rgba {
  const rgba = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
  const hex = color.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Unsupported color: ${color}`);
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: 1 };
}

/** A translucent color as it looks over an opaque background. */
function flatten(color: string, background: string): Rgba {
  const top = parse(color);
  const bottom = parse(background);
  const mix = (a: number, b: number) => a * top.a + b * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG 2.1 contrast ratio. `background` may be translucent: give the opaque color under it
 * as `canvas`.
 */
export function contrastRatio(foreground: string, background: string, canvas = "#FFFFFF"): number {
  const bg = flatten(background, canvas);
  const bgHex = `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`;
  const fg = flatten(foreground, bgHex);
  const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

/** AA minimums: 4.5 for body text, 3 for large text (18.66px bold / 24px) and UI parts. */
export const AA_TEXT = 4.5;
export const AA_LARGE_OR_UI = 3;
