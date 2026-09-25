import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// Leftover shadcn English copy. Blueprint ships French labels.
const BANNED = [
  /sr-only["']?>\s*Close\s*</,
  />\s*Close\s*</,
  /Toggle Sidebar/,
  /Command Palette/,
  /Search for a command/,
  /aria-label="breadcrumb"/,
  /sr-only["']?>\s*More\s*</,
  /aria-label="progress"/,
  /Displays the mobile sidebar/,
  />\s*Sidebar\s*</,
]

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? files(join(dir, d.name)) : /\.(tsx|vue)$/.test(d.name) ? [join(dir, d.name)] : []
  )
}

describe("registry copy", () => {
  it.each(files("registry"))("%s has no English UI strings", (file) => {
    const src = readFileSync(file, "utf8")
    expect(BANNED.filter((re) => re.test(src)).map(String)).toEqual([])
  })
})
