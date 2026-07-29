import {
  ColorFormats,
  ComplementaryColor,
  ExportSnippets,
  HslColor,
  HsvColor,
  OklchColor,
  RgbColor,
  WcagResult
} from './types';

// ─── HEX → RGB ───────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): RgbColor | null {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  };
}

// ─── RGB → HEX ───────────────────────────────────────────────────────────────

export function rgbToHex({ r, g, b }: RgbColor): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.min(255, Math.max(0, v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

// ─── RGB → HSL ───────────────────────────────────────────────────────────────

export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + 6) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      case bn:
        h = (rn - gn) / delta + 4;
        break;
    }
    h = h * 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// ─── HSL → RGB ───────────────────────────────────────────────────────────────

export function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const sn = s / 100,
    ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

// ─── RGB → HSV ───────────────────────────────────────────────────────────────

export function rgbToHsv({ r, g, b }: RgbColor): HsvColor {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + 6) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      case bn:
        h = (rn - gn) / delta + 4;
        break;
    }
    h = h * 60;
  }

  return {
    h: Math.round(h),
    s: max === 0 ? 0 : Math.round((delta / max) * 100),
    v: Math.round(max * 100)
  };
}

// ─── RGB → OKLCH (via OKLab) ────────────────────────────────────────────────

export function rgbToOklch({ r, g, b }: RgbColor): OklchColor {
  // linearize sRGB
  const lin = (v: number) => {
    const n = v / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const rl = lin(r),
    gl = lin(g),
    bl = lin(b);

  // sRGB → LMS (D65)
  const lms_l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const lms_m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const lms_s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l_ = Math.cbrt(lms_l);
  const m_ = Math.cbrt(lms_m);
  const s_ = Math.cbrt(lms_s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bk * bk);
  let H = Math.atan2(bk, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return {
    l: parseFloat(L.toFixed(4)),
    c: parseFloat(C.toFixed(4)),
    h: Math.round(H)
  };
}

// ─── Complementary palette (6 colors) ────────────────────────────────────────

export function getComplementaryColors(hex: string): ComplementaryColor[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb);

  const offsets = [30, 60, 120, 180, 240, 300];
  return offsets.map((offset) => {
    const h = (hsl.h + offset) % 360;
    const newHsl = { h, s: hsl.s, l: hsl.l };
    const newRgb = hslToRgb(newHsl);
    return { hex: rgbToHex(newRgb), hsl: newHsl };
  });
}

// ─── WCAG contrast ───────────────────────────────────────────────────────────

function relativeLuminance({ r, g, b }: RgbColor): number {
  const lin = (v: number) => {
    const n = v / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function wcagLevel(ratio: number): 'AAA' | 'AA' | 'AA Large' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export function getWcagResult(hex: string): WcagResult | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const lColor = relativeLuminance(rgb);
  const lWhite = 1;
  const lBlack = 0;
  const ratioWhite = contrastRatio(lColor, lWhite);
  const ratioBlack = contrastRatio(lColor, lBlack);
  return {
    ratio: Math.min(ratioWhite, ratioBlack),
    onWhite: wcagLevel(ratioWhite),
    onBlack: wcagLevel(ratioBlack)
  };
}

// ─── Export snippets ──────────────────────────────────────────────────────────

export function getExportSnippets(
  hex: string,
  name: string,
  formats: ColorFormats
): ExportSnippets {
  const safeName = name.trim() || 'color';
  const { rgb, hsl, oklch } = formats;

  const css = `/* ${safeName} */
--color-${safeName}: ${hex};
--color-${safeName}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
--color-${safeName}-hsl: ${hsl.h}deg ${hsl.s}% ${hsl.l}%;
--color-${safeName}-oklch: oklch(${oklch.l} ${oklch.c} ${oklch.h}deg);`;

  const tailwind = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${safeName}': {
          DEFAULT: '${hex}',
          hsl: 'hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)',
        }
      }
    }
  }
}`;

  const scss = `// ${safeName}
$${safeName}: ${hex};
$${safeName}-rgb: rgb(${rgb.r}, ${rgb.g}, ${rgb.b});
$${safeName}-hsl: hsl(${hsl.h}deg, ${hsl.s}%, ${hsl.l}%);
$${safeName}-oklch: oklch(${oklch.l} ${oklch.c} ${oklch.h}deg);`;

  return { css, tailwind, scss };
}

// ─── Main function: HEX to all formats ───────────────────────────────────────

export function parseColor(hex: string): ColorFormats | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
    hsv: rgbToHsv(rgb),
    oklch: rgbToOklch(rgb)
  };
}
