/**
 * US-WEB-09: the design tokens as the browser resolves them (styles.css is part of the Karma
 * build). Checks WCAG AA for clinical text, the badge semantics and the Material wiring.
 */
const AA_TEXT = 4.5;
const AA_UI = 3;

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** #rgb / #rrggbb -> [r, g, b] */
function rgb(color: string): [number, number, number] {
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error(`Not a hex color: "${color}"`);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(color: string): number {
  const [r, g, b] = rgb(color).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: string, bg: string): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

function hue(color: string): number {
  const [r, g, b] = rgb(color).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

describe('Design tokens (Vitalis DonaVida)', () => {
  const pairs: [string, string, string, number][] = [
    ['text on canvas', '--vd-color-text', '--vd-color-background', AA_TEXT],
    ['text on surface', '--vd-color-text', '--vd-color-surface', AA_TEXT],
    ['text on recessed', '--vd-color-text', '--vd-color-surface-recessed', AA_TEXT],
    ['text in input', '--vd-color-text', '--vd-color-input', AA_TEXT],
    ['muted text on canvas', '--vd-color-text-muted', '--vd-color-background', AA_TEXT],
    ['muted text on surface', '--vd-color-text-muted', '--vd-color-surface', AA_TEXT],
    ['placeholder in input', '--vd-color-text-muted', '--vd-color-input', AA_TEXT],
    ['primary button label', '--vd-color-on-primary', '--vd-color-primary', AA_TEXT],
    ['primary button label (hover)', '--vd-color-on-primary', '--vd-color-primary-hover', AA_TEXT],
    ['red text on canvas', '--vd-color-primary-text', '--vd-color-background', AA_TEXT],
    ['red text on surface', '--vd-color-primary-text', '--vd-color-surface', AA_TEXT],
    ['secondary text on surface', '--vd-color-secondary-text', '--vd-color-surface', AA_TEXT],
    ['secondary button (hover)', '--vd-color-on-secondary', '--vd-color-secondary', AA_TEXT],
    ['error text on surface', '--vd-color-error', '--vd-color-surface', AA_TEXT],
    ['urgent badge', '--vd-tone-urgent-fg', '--vd-tone-urgent-bg', AA_TEXT],
    ['observation badge', '--vd-tone-observation-fg', '--vd-tone-observation-bg', AA_TEXT],
    ['viable badge', '--vd-tone-viable-fg', '--vd-tone-viable-bg', AA_TEXT],
    ['info badge', '--vd-tone-info-fg', '--vd-tone-info-bg', AA_TEXT],
    ['neutral badge', '--vd-tone-neutral-fg', '--vd-tone-neutral-bg', AA_TEXT],
    ['blood badge', '--vd-blood-badge-fg', '--vd-blood-badge-bg', AA_TEXT],
    ['input outline', '--vd-color-border-strong', '--vd-color-surface', AA_UI],
    ['focus ring on surface', '--vd-color-focus', '--vd-color-surface', AA_UI],
    ['focus ring on canvas', '--vd-color-focus', '--vd-color-background', AA_UI],
  ];

  for (const [name, fg, bg, min] of pairs) {
    it(`meets WCAG AA: ${name}`, () => {
      const ratio = contrast(token(fg), token(bg));
      expect(ratio).withContext(`${fg} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(min);
    });
  }

  it('keeps the clinical semantics: viable green, urgent red, observation amber', () => {
    const viable = hue(token('--vd-tone-viable-fg'));
    const urgent = hue(token('--vd-tone-urgent-fg'));
    const observation = hue(token('--vd-tone-observation-fg'));
    expect(viable).toBeGreaterThan(90);
    expect(viable).toBeLessThan(170);
    expect(urgent > 330 || urgent < 15).toBeTrue();
    expect(observation).toBeGreaterThan(20);
    expect(observation).toBeLessThan(50);
  });

  it('uses Plus Jakarta Sans for the page and for Angular Material', () => {
    expect(token('--vd-font-family')).toContain('Plus Jakarta Sans');
    expect(getComputedStyle(document.body).fontFamily).toContain('Plus Jakarta Sans');
    expect(token('--mat-sys-body-medium-font')).toContain('Plus Jakarta Sans');
  });

  it('drives Angular Material from the tokens', () => {
    expect(token('--mat-sys-primary')).toBe(token('--vd-color-primary'));
    expect(token('--mdc-filled-button-container-shape')).toBe(token('--vd-radius-md'));
    expect(token('--mdc-filled-button-container-height')).toBe('48px');
    expect(token('--mat-form-field-container-height')).toBe('52px');
    expect(token('--mdc-outlined-text-field-focus-outline-color')).toBe(token('--vd-color-focus'));
  });

  it('switches the grid to 4 / 8 / 12 columns with the viewport', () => {
    const width = window.innerWidth;
    const expected = width >= 1024 ? '12' : width >= 600 ? '8' : '4';
    expect(token('--vd-grid-columns')).toBe(expected);
  });
});
