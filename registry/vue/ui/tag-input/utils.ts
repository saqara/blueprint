export type TagOptions = { suggestions?: string[]; allowCreate?: boolean; maxTags?: number }

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
const normalize = (s: string) => s.trim().replace(/\s+/g, " ")

// Adds raw entries one by one: trimmed, deduplicated (case and accents), catalogue spelling, maxTags.
export function addTags(values: string[], raws: string[], { suggestions, allowCreate = true, maxTags }: TagOptions): string[] {
  let next = values
  for (const raw of raws) {
    const tag = normalize(raw)
    if (!tag || (maxTags !== undefined && next.length >= maxTags)) continue
    if (next.some((v) => fold(v) === fold(tag))) continue
    const known = suggestions?.find((s) => fold(s) === fold(tag))
    if (!known && !allowCreate) continue
    next = [...next, known ?? tag]
  }
  return next
}

export function filterSuggestions(suggestions: string[], query: string, values: string[], limit = 8): string[] {
  const q = fold(normalize(query))
  const chosen = new Set(values.map(fold))
  return suggestions.filter((s) => !chosen.has(fold(s)) && fold(s).includes(q)).slice(0, limit)
}
