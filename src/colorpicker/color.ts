export type ColorFormat = "hex" | "rgb" | "hsb";

export type HsbaColor = {
  h: number;
  s: number;
  b: number;
  a: number;
};

export type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type ColorType = string | Color;

const HEX = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*([0-9.]+%?)\s*[, ]\s*([0-9.]+%?)\s*[, ]\s*([0-9.]+%?)(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/i;
const HSL = /^hsla?\(\s*([0-9.]+)\s*[, ]\s*([0-9.]+)%\s*[, ]\s*([0-9.]+)%(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/i;
const HSB = /^hsba?\(\s*([0-9.]+)\s*[, ]\s*([0-9.]+)%\s*[, ]\s*([0-9.]+)%(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/i;
const HSV = /^hsva?\(\s*([0-9.]+)\s*[, ]\s*([0-9.]+)%\s*[, ]\s*([0-9.]+)%(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/i;

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round(n: number, digits = 0) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function wrapHue(h: number) {
  const n = ((h % 360) + 360) % 360;
  return n;
}

function hexByte(n: number) {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
}

function parseChannel(raw: string, max: number) {
  const t = raw.trim();
  if (t.endsWith("%")) return clamp((parseFloat(t) / 100) * max, 0, max);
  return clamp(parseFloat(t), 0, max);
}

function parseAlpha(raw: string | undefined) {
  if (raw == null || raw === "") return 1;
  const t = raw.trim();
  if (t.endsWith("%")) return clamp(parseFloat(t) / 100, 0, 1);
  const n = parseFloat(t);
  return n > 1 ? clamp(n / 255, 0, 1) : clamp(n, 0, 1);
}

export function hsbaToRgba({ h, s, b, a }: HsbaColor): RgbaColor {
  const hue = wrapHue(h);
  const sat = clamp(s, 0, 1);
  const val = clamp(b, 0, 1);
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  let r = 0;
  let g = 0;
  let bl = 0;
  if (hue < 60) [r, g, bl] = [c, x, 0];
  else if (hue < 120) [r, g, bl] = [x, c, 0];
  else if (hue < 180) [r, g, bl] = [0, c, x];
  else if (hue < 240) [r, g, bl] = [0, x, c];
  else if (hue < 300) [r, g, bl] = [x, 0, c];
  else [r, g, bl] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255),
    a: clamp(a, 0, 1),
  };
}

export function rgbaToHsba({ r, g, b, a }: RgbaColor): HsbaColor {
  const R = clamp(r, 0, 255) / 255;
  const G = clamp(g, 0, 255) / 255;
  const B = clamp(b, 0, 255) / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, b: max, a: clamp(a, 0, 1) };
}

function hslToHsba(h: number, s: number, l: number, a: number): HsbaColor {
  const sat = clamp(s, 0, 1);
  const lit = clamp(l, 0, 1);
  const v = lit + sat * Math.min(lit, 1 - lit);
  const sv = v === 0 ? 0 : 2 * (1 - lit / v);
  return { h: wrapHue(h), s: sv, b: v, a: clamp(a, 0, 1) };
}

function expandHex(hex: string) {
  if (hex.length === 3 || hex.length === 4) {
    return hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return hex;
}

function parseHex(raw: string): HsbaColor | null {
  const m = HEX.exec(raw.trim());
  if (!m) return null;
  const hex = expandHex(m[1]!.toLowerCase());
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return rgbaToHsba({ r, g, b, a });
}

function parseCss(raw: string): HsbaColor | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.toLowerCase() === "transparent") return { h: 0, s: 0, b: 0, a: 0 };
  const hex = parseHex(t);
  if (hex) return hex;
  const rgb = RGB.exec(t);
  if (rgb) {
    return rgbaToHsba({
      r: parseChannel(rgb[1]!, 255),
      g: parseChannel(rgb[2]!, 255),
      b: parseChannel(rgb[3]!, 255),
      a: parseAlpha(rgb[4]),
    });
  }
  const hsl = HSL.exec(t);
  if (hsl) return hslToHsba(parseFloat(hsl[1]!), parseFloat(hsl[2]!) / 100, parseFloat(hsl[3]!) / 100, parseAlpha(hsl[4]));
  const hsb = HSB.exec(t) ?? HSV.exec(t);
  if (hsb) {
    return {
      h: wrapHue(parseFloat(hsb[1]!)),
      s: clamp(parseFloat(hsb[2]!) / 100, 0, 1),
      b: clamp(parseFloat(hsb[3]!) / 100, 0, 1),
      a: parseAlpha(hsb[4]),
    };
  }
  return null;
}

export function isColor(value: unknown): value is Color {
  return value instanceof Color;
}

export class Color {
  private readonly meta: HsbaColor;

  constructor(input?: ColorType | HsbaColor | RgbaColor | null) {
    this.meta = toHsba(input);
  }

  toHsb(): HsbaColor {
    return { h: this.meta.h, s: this.meta.s, b: this.meta.b, a: this.meta.a };
  }

  toRgb(): RgbaColor {
    return hsbaToRgba(this.meta);
  }

  toHex(ignoreAlpha = false): string {
    const { r, g, b, a } = this.toRgb();
    const hex = `${hexByte(r)}${hexByte(g)}${hexByte(b)}`;
    if (ignoreAlpha || a >= 1) return hex;
    return `${hex}${hexByte(a * 255)}`;
  }

  toHexString(ignoreAlpha = false): string {
    return `#${this.toHex(ignoreAlpha)}`;
  }

  toRgbString(): string {
    const { r, g, b, a } = this.toRgb();
    if (a < 1) return `rgba(${r}, ${g}, ${b}, ${round(a, 2)})`;
    return `rgb(${r}, ${g}, ${b})`;
  }

  toHsbString(): string {
    const { h, s, b, a } = this.meta;
    const H = Math.round(wrapHue(h));
    const S = Math.round(s * 100);
    const B = Math.round(b * 100);
    if (a < 1) return `hsba(${H}, ${S}%, ${B}%, ${round(a, 2)})`;
    return `hsb(${H}, ${S}%, ${B}%)`;
  }

  toCssString(): string {
    return this.toRgbString();
  }

  toString(format: ColorFormat = "hex"): string {
    if (format === "rgb") return this.toRgbString();
    if (format === "hsb") return this.toHsbString();
    return this.toHexString();
  }

  static fromHsba(hsba: HsbaColor): Color {
    return new Color(hsba);
  }
}

function isHsbaLike(value: object): value is HsbaColor {
  return "h" in value && "s" in value && "b" in value;
}

function isRgbaLike(value: object): value is RgbaColor {
  return "r" in value && "g" in value && "b" in value;
}

function toHsba(input?: ColorType | HsbaColor | RgbaColor | null): HsbaColor {
  if (input == null || input === "") return { h: 215, s: 0.91, b: 1, a: 1 };
  if (isColor(input)) return input.toHsb();
  if (typeof input === "string") return parseCss(input) ?? { h: 215, s: 0.91, b: 1, a: 1 };
  if (isHsbaLike(input)) {
    return { h: wrapHue(input.h), s: clamp(input.s, 0, 1), b: clamp(input.b, 0, 1), a: clamp(input.a ?? 1, 0, 1) };
  }
  if (isRgbaLike(input)) return rgbaToHsba({ r: input.r, g: input.g, b: input.b, a: input.a ?? 1 });
  return { h: 215, s: 0.91, b: 1, a: 1 };
}

export function parseColor(input?: ColorType | null): Color | null {
  if (input == null || input === "") return null;
  if (isColor(input)) return input;
  if (typeof input === "string") {
    const parsed = parseCss(input);
    return parsed ? Color.fromHsba(parsed) : null;
  }
  return new Color(input);
}

export const DEFAULT_COLOR = new Color("#1677ff");
