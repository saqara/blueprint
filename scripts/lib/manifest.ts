import { readFileSync, writeFileSync } from "node:fs"

export type Item = { name: string; type: string; [k: string]: unknown }
export type Manifest = { $schema: string; name: string; homepage: string; items: Item[] }

export const readManifest = (path: string): Manifest => JSON.parse(readFileSync(path, "utf8"))
export const writeManifest = (path: string, m: Manifest) => writeFileSync(path, JSON.stringify(m, null, 2) + "\n")

export function upsertItem(m: Manifest, item: Item): Manifest {
  const items = [...m.items.filter((i) => i.name !== item.name), item].sort((a, b) =>
    a.name === "saqara-theme" ? -1 : b.name === "saqara-theme" ? 1 : a.name.localeCompare(b.name),
  )
  return { ...m, items }
}
