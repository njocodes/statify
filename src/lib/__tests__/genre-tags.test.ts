import { describe, expect, it } from "vitest";
import { genreFromTags, genreOf, setExtraGenre } from "../theme/genres";

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
});
