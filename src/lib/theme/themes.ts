export const THEME_IDS = ["classic", "comic", "graffiti", "doodle", "punk", "cassette", "vaporwave", "riso", "jazz", "metal", "western", "y2k", "rave", "blueprint", "clean"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeSetting = "auto" | ThemeId;

export const GENRES = ["rap", "pop", "rnb", "rock", "metal", "indie", "folk", "electronic", "techno", "hoerspiel", "jazz", "klassik", "country", "ambient"] as const;
export type Genre = (typeof GENRES)[number];

/** Which drawn style a dominant genre gets in "auto" mode. */
export const GENRE_THEME: Record<Genre, ThemeId> = {
  rap: "graffiti",
  pop: "comic",
  rnb: "y2k",
  rock: "punk",
  metal: "metal",
  indie: "riso",
  folk: "doodle",
  electronic: "vaporwave",
  techno: "rave",
  hoerspiel: "cassette",
  jazz: "jazz",
  klassik: "jazz",
  country: "western",
  ambient: "blueprint",
};

export const THEME_LABEL: Record<ThemeId, { de: string; en: string; blurb: { de: string; en: string } }> = {
  classic: { de: "Klassisch", en: "Classic", blurb: { de: "Dunkel & sauber", en: "Dark & clean" } },
  comic: { de: "Comic / Pop-Art", en: "Comic / Pop-Art", blurb: { de: "Dicke Outlines, Halbton-Raster", en: "Bold outlines, halftone dots" } },
  graffiti: { de: "Graffiti / Street", en: "Graffiti / Street", blurb: { de: "Backstein, Spraytags, Sticker", en: "Brick, spray tags, stickers" } },
  doodle: { de: "Karikatur / Doodle", en: "Caricature / Doodle", blurb: { de: "Kritzel-Linien auf Karopapier", en: "Scribbled lines on grid paper" } },
  punk: { de: "Punk-Collage / Metal", en: "Punk collage / Metal", blurb: { de: "Zine-Schnipsel & Linocut", en: "Zine cut-outs & linocut" } },
  cassette: { de: "Kassette / Hörspiel", en: "Cassette / Audio play", blurb: { de: "Kassettenlabel mit Handschrift", en: "Handwritten tape labels" } },
  vaporwave: { de: "Vaporwave / Synthwave", en: "Vaporwave / Synthwave", blurb: { de: "Neon-Gitter und Sonnenuntergang", en: "Neon grid and sunset" } },
  jazz: { de: "Jazz (Blue Note)", en: "Jazz (Blue Note)", blurb: { de: "Bauhaus-Typo, Blau und Orange", en: "Bauhaus type, blue and orange" } },
  metal: { de: "Metal-Holzschnitt", en: "Metal woodcut", blurb: { de: "Schwarz, Knochen und Blutrot", en: "Black, bone and blood red" } },
  western: { de: "Western / Wanted", en: "Western / Wanted", blurb: { de: "Vergilbtes Poster, Holzlettern", en: "Aged poster, wood type" } },
  y2k: { de: "Y2K / Chrome", en: "Y2K / Chrome", blurb: { de: "Glänzende Bubbles, Aqua-Look", en: "Glossy bubbles, aqua look" } },
  rave: { de: "Rave-Flyer / Xerox", en: "Rave flyer / Xerox", blurb: { de: "Acid-Gelb, Kopierraster", en: "Acid yellow, photocopy grit" } },
  blueprint: { de: "Blueprint", en: "Blueprint", blurb: { de: "Bauzeichnung auf Gitterpapier", en: "Technical drawing on grid paper" } },
  clean: { de: "Clean (hell/dunkel)", en: "Clean (light/dark)", blurb: { de: "Fast nur Weiß oder Schwarz, folgt dem Handy", en: "Almost pure white or black, follows your phone" } },
  riso: { de: "Risograph-Druck", en: "Risograph print", blurb: { de: "Versetzte Farbebenen, Halbton", en: "Misregistered inks, halftone" } },
};

export const isThemeId = (v: unknown): v is ThemeId => THEME_IDS.includes(v as ThemeId);
