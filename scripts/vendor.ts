import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { keepDescription, readManifest, upsertItem, writeManifest } from "./lib/manifest.ts"
import { planAll, refreshItem, UPSTREAM, type Fw, type UpstreamItem } from "./lib/vendor.ts"

const args = process.argv.slice(2)
const force = args.includes("--force")
const source = args.includes("--ai") ? "ai" : "shadcn"
const names = args.filter((a) => !a.startsWith("--"))
if (!names.length) {
  console.error("usage: npm run vendor -- <name...> [--force] [--ai] | --refresh <name...>")
  process.exit(1)
}

if (args.includes("--refresh")) {
  for (const fw of ["react", "vue"] as Fw[]) {
    const manifestPath = `registry.${fw}.json`
    let manifest = readManifest(manifestPath)
    for (const name of names) {
      const item = manifest.items.find((i) => i.name === name)
      if (!item) throw new Error(`${fw}: no "${name}" in ${manifestPath}`)
      const dir = `registry/${fw}/ui/${name}`
      const paths = fw === "vue" ? readdirSync(dir).sort().map((f) => `${dir}/${f}`) : [`${dir}.tsx`]
      manifest = upsertItem(manifest, refreshItem(item, paths.map((path) => ({ path, content: readFileSync(path, "utf8") }))))
      console.log(`${fw}: ${name} refreshed`)
    }
    writeManifest(manifestPath, manifest)
  }
  process.exit(0)
}

async function fetchItem(fw: Fw, name: string): Promise<UpstreamItem> {
  const res = await fetch(`${UPSTREAM[source][fw]}/${name}.json`)
  if (!res.ok) throw new Error(`upstream ${fw} has no "${name}" (HTTP ${res.status})`)
  return (await res.json()) as UpstreamItem
}

const planned = await planAll(names, fetchItem, existsSync, force)

const installed = new Set(Object.keys(JSON.parse(readFileSync("package.json", "utf8")).dependencies ?? {}))
const missing = new Set<string>()

for (const fw of ["react", "vue"] as Fw[]) {
  const manifestPath = `registry.${fw}.json`
  let manifest = readManifest(manifestPath)
  for (const { files, item } of planned[fw]) {
    for (const f of files) {
      mkdirSync(dirname(f.path), { recursive: true })
      writeFileSync(f.path, f.content)
    }
    manifest = upsertItem(manifest, keepDescription(manifest.items.find((i) => i.name === item.name), item))
    for (const d of (item.dependencies as string[] | undefined) ?? []) if (!installed.has(d)) missing.add(d)
    console.log(`${fw}: ${item.name} (${files.length} files)`)
  }
  writeManifest(manifestPath, manifest)
}
if (missing.size) console.log(`\nInstall missing dependencies:\n  npm i ${[...missing].join(" ")}`)
