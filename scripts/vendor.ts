import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { readManifest, upsertItem, writeManifest } from "./lib/manifest.ts"
import { plan, UPSTREAM, type Fw, type UpstreamItem } from "./lib/vendor.ts"

const args = process.argv.slice(2)
const force = args.includes("--force")
const names = args.filter((a) => a !== "--force")
if (!names.length) {
  console.error("usage: npm run vendor -- <name...> [--force]")
  process.exit(1)
}

const installed = new Set(Object.keys(JSON.parse(readFileSync("package.json", "utf8")).dependencies ?? {}))
const missing = new Set<string>()

for (const fw of ["react", "vue"] as Fw[]) {
  const manifestPath = `registry.${fw}.json`
  let manifest = readManifest(manifestPath)
  for (const name of names) {
    const res = await fetch(`${UPSTREAM[fw]}/${name}.json`)
    if (!res.ok) throw new Error(`upstream ${fw} has no "${name}" (HTTP ${res.status})`)
    const { files, item } = plan((await res.json()) as UpstreamItem, fw, existsSync, force)
    for (const f of files) {
      mkdirSync(dirname(f.path), { recursive: true })
      writeFileSync(f.path, f.content)
    }
    manifest = upsertItem(manifest, item)
    for (const d of (item.dependencies as string[] | undefined) ?? []) if (!installed.has(d)) missing.add(d)
    console.log(`${fw}: ${name} (${files.length} files)`)
  }
  writeManifest(manifestPath, manifest)
}
if (missing.size) console.log(`\nInstall missing dependencies:\n  npm i ${[...missing].join(" ")}`)
