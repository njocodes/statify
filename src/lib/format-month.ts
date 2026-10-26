/** "2021-06" -> "Jun 2021" in the given language */
export const fmtMonth = (m: string, lang: string) => new Date(`${m}-01T12:00:00`).toLocaleDateString(lang, { month: "short", year: "numeric" });
