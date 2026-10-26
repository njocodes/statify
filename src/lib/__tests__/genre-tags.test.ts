import { describe, expect, it } from "vitest";
import { genreFromTags, genreOf, setExtraGenre, subGenreOf } from "../theme/genres";

describe("MusicBrainz genre tags", () => {
  it("votes by tag count and maps to a genre", () => {
    const tags = [{ count: 2, name: "rap" }, { count: 2, name: "german" }, { count: 5, name: "hip hop" }, { count: 3, name: "pop rap" }, { count: -1, name: "deutsch" }];
    expect(genreFromTags(tags)).toBe("rap");
    expect(genreFromTags([{ count: 1, name: "seen live" }])).toBeNull();
  });

  it("extra genres fill gaps but never override the curated lists", () => {
    setExtraGenre("some unknown band", "metal");
    setExtraGenre("taylor swift", "metal");
    expect(genreOf("Some Unknown Band")).toBe("metal");
    expect(genreOf("Taylor Swift")).toBe("pop");
  });

  it("knows the reggae and latin lists", () => {
    expect(genreOf("Bob Marley")).toBe("reggae");
    expect(genreOf("Bad Bunny")).toBe("latin");
    expect(genreOf("Wisin & Yandel")).toBe("latin");
  });

  it("splits reggae and latin into sub-genres", () => {
    expect(subGenreOf("Sean Paul")).toEqual({ genre: "reggae", sub: "reggae_dancehall" });
    expect(subGenreOf("Bob Marley")?.sub).toBe("reggae_roots");
    expect(subGenreOf("Bad Bunny")?.sub).toBe("latin_reggaeton");
    expect(subGenreOf("Marc Anthony")?.sub).toBe("latin_tropical");
  });
});
