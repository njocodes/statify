export const THEME_IDS = ["classic", "comic", "graffiti", "doodle", "punk"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeSetting = "auto" | ThemeId;

export const GENRES = ["rap", "pop", "rock", "indie", "electronic", "hoerspiel"] as const;
export type Genre = (typeof GENRES)[number];

/** Which drawn style a dominant genre gets in "auto" mode. */
export const GENRE_THEME: Record<Genre, ThemeId> = {
  rap: "graffiti",
  pop: "comic",
  electronic: "comic",
  rock: "punk",
  indie: "doodle",
  hoerspiel: "doodle",
};

export const THEME_LABEL: Record<ThemeId, { de: string; en: string; blurb: { de: string; en: string } }> = {
  classic: { de: "Klassisch", en: "Classic", blurb: { de: "Dunkel & sauber", en: "Dark & clean" } },
  comic: { de: "Comic / Pop-Art", en: "Comic / Pop-Art", blurb: { de: "Dicke Outlines, Halbton-Raster", en: "Bold outlines, halftone dots" } },
  graffiti: { de: "Graffiti / Street", en: "Graffiti / Street", blurb: { de: "Backstein, Spraytags, Sticker", en: "Brick, spray tags, stickers" } },
  doodle: { de: "Karikatur / Doodle", en: "Caricature / Doodle", blurb: { de: "Kritzel-Linien auf Karopapier", en: "Scribbled lines on grid paper" } },
  punk: { de: "Punk-Collage / Metal", en: "Punk collage / Metal", blurb: { de: "Zine-Schnipsel & Linocut", en: "Zine cut-outs & linocut" } },
};

export const isThemeId = (v: unknown): v is ThemeId => THEME_IDS.includes(v as ThemeId);
