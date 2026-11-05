// shadcn-vue writes a registry:lib file to `<lib alias>/<path after the alias>`, but it only knows how to
// strip "@/" aliases: with "~/lib" (AdonisJS, Nuxt) it falls back to "lib/" + file name, so
// registry/vue/lib/fluid-hover.ts lands in ~/lib/lib/ while the components import ~/lib/fluid-hover.
// A bare file name lands in the lib folder whatever the alias, so the built items keep only that.
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

const dir = process.argv[2] ?? "public/r/vue"
for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
  const file = join(dir, name)
  const item = JSON.parse(readFileSync(file, "utf8"))
  if (!Array.isArray(item.files) || !item.files.some((f: { type: string }) => f.type === "registry:lib")) continue
  for (const f of item.files) if (f.type === "registry:lib") f.path = basename(f.path)
  writeFileSync(file, JSON.stringify(item, null, 2) + "\n")
}
