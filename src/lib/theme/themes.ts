export const THEME_IDS = ["classic", "comic", "graffiti", "doodle", "punk", "cassette", "vaporwave", "riso", "clean"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeSetting = "auto" | ThemeId;

export const GENRES = ["rap", "pop", "rnb", "rock", "metal", "indie", "folk", "electronic", "techno", "hoerspiel", "jazz", "klassik", "country", "ambient"] as const;
export type Genre = (typeof GENRES)[number];

/** Which drawn style a dominant genre gets in "auto" mode. */
export const GENRE_THEME: Record<Genre, ThemeId> = {
  rap: "graffiti",
  pop: "comic",
  rnb: "comic", // y2k, once that theme exists
  rock: "punk",
  metal: "punk", // metal woodcut, once that theme exists
  indie: "riso",
  folk: "doodle",
  electronic: "vaporwave",
  techno: "vaporwave", // rave flyer, once that theme exists
  hoerspiel: "cassette",
  jazz: "classic", // blue note, once that theme exists
  klassik: "classic", // blue note, once that theme exists
  country: "doodle", // western poster, once that theme exists
  ambient: "classic", // blueprint, once that theme exists
};

export const THEME_LABEL: Record<ThemeId, { de: string; en: string; blurb: { de: string; en: string } }> = {
  classic: { de: "Klassisch", en: "Classic", blurb: { de: "Dunkel & sauber", en: "Dark & clean" } },
  comic: { de: "Comic / Pop-Art", en: "Comic / Pop-Art", blurb: { de: "Dicke Outlines, Halbton-Raster", en: "Bold outlines, halftone dots" } },
  graffiti: { de: "Graffiti / Street", en: "Graffiti / Street", blurb: { de: "Backstein, Spraytags, Sticker", en: "Brick, spray tags, stickers" } },
  doodle: { de: "Karikatur / Doodle", en: "Caricature / Doodle", blurb: { de: "Kritzel-Linien auf Karopapier", en: "Scribbled lines on grid paper" } },
  punk: { de: "Punk-Collage / Metal", en: "Punk collage / Metal", blurb: { de: "Zine-Schnipsel & Linocut", en: "Zine cut-outs & linocut" } },
  cassette: { de: "Kassette / Hörspiel", en: "Cassette / Audio play", blurb: { de: "Kassettenlabel mit Handschrift", en: "Handwritten tape labels" } },
  vaporwave: { de: "Vaporwave / Synthwave", en: "Vaporwave / Synthwave", blurb: { de: "Neon-Gitter und Sonnenuntergang", en: "Neon grid and sunset" } },
  clean: { de: "Clean (hell/dunkel)", en: "Clean (light/dark)", blurb: { de: "Fast nur Weiß oder Schwarz, folgt dem Handy", en: "Almost pure white or black, follows your phone" } },
  riso: { de: "Risograph-Druck", en: "Risograph print", blurb: { de: "Versetzte Farbebenen, Halbton", en: "Misregistered inks, halftone" } },
};

export const isThemeId = (v: unknown): v is ThemeId => THEME_IDS.includes(v as ThemeId);
