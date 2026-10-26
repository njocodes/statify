export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const hex = (c: Rgb) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
export const luminance = ({ r, g, b }: Rgb) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** most colourful, reasonably bright colour of an image, or null when it is grey/dark */
export function dominantColor(img: CanvasImageSource): Rgb | null {
  const S = 24;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, S, S);
  const px = ctx.getImageData(0, 0, S, S).data;
  // 12 hue buckets weighted by saturation x value, so vivid areas win over big grey ones
  const buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i < px.length; i += 4) {
    const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const v = max / 255;
    const s = max ? (max - min) / max : 0;
    if (s < 0.3 || v < 0.35) continue;
    const d = max - min;
    const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    const k = buckets[Math.floor((h / 6) * 12) % 12];
    const w = s * v;
    k.w += w;
    k.r += r * w;
    k.g += g * w;
    k.b += b * w;
  }
  const best = buckets.reduce((a, b) => (b.w > a.w ? b : a));
  return best.w > 0 ? { r: best.r / best.w, g: best.g / best.w, b: best.b / best.w } : null;
}

/** loads an image with CORS so its pixels can be read; resolves null when the host does not allow it */
export function loadForPixels(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function toHsl({ r, g, b }: Rgb) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === R ? ((G - B) / d + 6) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: h * 60, s, l };
}

function fromHsl(h: number, s: number, l: number): Rgb {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

/**
 * One accent from several covers: the hue shared by most of them (averaging different hues
 * would give mud), pulled to a vivid, readable saturation and lightness.
 */
export function blend(colors: Rgb[]): Rgb | null {
  if (!colors.length) return null;
  const hsl = colors.map(toHsl);
  const groups = new Map<number, typeof hsl>();
  for (const c of hsl) {
    const k = Math.floor(c.h / 40);
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  const best = [...groups.values()].sort((a, b) => b.length - a.length || b[0].s - a[0].s)[0];
  // circular mean of the hue inside the winning group
  const x = best.reduce((a, c) => a + Math.cos((c.h * Math.PI) / 180), 0);
  const y = best.reduce((a, c) => a + Math.sin((c.h * Math.PI) / 180), 0);
  const h = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const s = Math.max(0.6, best.reduce((a, c) => a + c.s, 0) / best.length);
  const l = Math.min(0.6, Math.max(0.45, best.reduce((a, c) => a + c.l, 0) / best.length));
  return fromHsl(h, Math.min(s, 0.95), l);
}

/** accent tokens for a colour: the colour itself, a darker variant and a readable text colour on top */
export function accentTokens(c: Rgb) {
  return {
    accent: hex(c),
    dim: hex({ r: c.r * 0.78, g: c.g * 0.78, b: c.b * 0.78 }),
    on: luminance(c) > 0.55 ? "#111111" : "#ffffff",
  };
}

/** a genre colour tuned to its ground: darker on light themes, lighter on dark ones, so text in it stays readable */
export function accentOn(c: Rgb, tone: "light" | "dark") {
  const { h, s, l } = toHsl(c);
  const tuned = tone === "light" ? fromHsl(h, Math.max(0.55, s), Math.min(l, 0.38)) : fromHsl(h, Math.max(0.5, s), Math.max(l, 0.58));
  return accentTokens(tuned);
}
