export const THEME_IDS = ["classic", "clean", "paper", "noir", "mono", "poster"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeSetting = "auto" | ThemeId;

export const GENRES = ["rap", "pop", "rnb", "rock", "metal", "indie", "folk", "electronic", "techno", "hoerspiel", "jazz", "klassik", "country", "ambient", "reggae", "latin"] as const;
export type Genre = (typeof GENRES)[number];

/** Which drawn style a dominant genre gets in "auto" mode. */
/** accent colour of each genre, used as the second colour next to the theme accent */
export const GENRE_COLOR: Record<Genre, string> = {
  rap: "#ff3d9a", pop: "#ff7a1a", rnb: "#a855f7", rock: "#e11d2e", metal: "#8e1013", indie: "#14b8a6", folk: "#84cc16",
  electronic: "#22d3ee", techno: "#e8ff1a", hoerspiel: "#f59e0b", jazz: "#f28c28", klassik: "#c9a227", country: "#b45309", ambient: "#60a5fa", reggae: "#22c55e", latin: "#ff5a1f",
};

export const GENRE_THEME: Record<Genre, ThemeId> = {
  rap: "noir",
  rnb: "noir",
  metal: "noir",
  pop: "poster",
  rock: "poster",
  reggae: "poster",
  latin: "poster",
  indie: "paper",
  folk: "paper",
  hoerspiel: "paper",
  jazz: "paper",
  klassik: "paper",
  country: "paper",
  electronic: "mono",
  techno: "mono",
  ambient: "mono",
};

/** light or dark ground, so the genre accent can be tuned to stay readable on it */
export const THEME_TONE: Record<ThemeId, "light" | "dark"> = { classic: "dark", clean: "light", paper: "light", noir: "dark", mono: "dark", poster: "light" };
/** themes that take their accent colour from the listener's top genre */
export const GENRE_ACCENT_THEMES: ThemeId[] = ["paper", "noir", "mono", "poster"];

export const THEME_LABEL: Record<ThemeId, { de: string; en: string; blurb: { de: string; en: string } }> = {
  classic: { de: "Classic", en: "Classic", blurb: { de: "Dunkel, ruhig, grün", en: "Dark, calm, green" } },
  clean: { de: "Clean", en: "Clean", blurb: { de: "Schwarz-Weiß, folgt dem Handy", en: "Black and white, follows your phone" } },
  paper: { de: "Paper", en: "Paper", blurb: { de: "Magazin: Serifen, feine Linien, warmes Papier", en: "Magazine: serif type, fine rules, warm paper" } },
  noir: { de: "Noir", en: "Noir", blurb: { de: "Schwarz, große Schlagzeilen, eine scharfe Farbe", en: "Black, big headlines, one sharp colour" } },
  mono: { de: "Mono", en: "Mono", blurb: { de: "Technisch: Monospace, feines Raster", en: "Technical: monospace, fine grid" } },
  poster: { de: "Poster", en: "Poster", blurb: { de: "Plakat: flache Farbe, dicke Linien, Plakatschrift", en: "Poster: flat colour, thick rules, poster type" } },
};

export const isGenre = (v: unknown): v is Genre => GENRES.includes(v as Genre);
export const isThemeId = (v: unknown): v is ThemeId => THEME_IDS.includes(v as ThemeId);
