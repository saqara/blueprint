import type { Item } from "./manifest.ts"

export type Fw = "react" | "vue"
export type UpstreamItem = {
  name: string
  type: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: { path: string; type: string; content: string; target?: string }[]
}

export type Source = "shadcn" | "ai"

export const UPSTREAM: Record<Source, Record<Fw, string>> = {
  shadcn: { react: "https://ui.shadcn.com/r/styles/new-york-v4", vue: "https://www.shadcn-vue.com/r/styles/new-york-v4" },
  // AI Elements (Vercel) and its Vue port: built on shadcn, imported into the same ui/ folder.
  ai: { react: "https://elements.ai-sdk.dev/api/registry", vue: "https://registry.ai-elements-vue.com" },
}

export const localize = (text: string, fw: Fw) => {
  let out = text
    .replaceAll("registry/new-york-v4/", `registry/${fw}/`)
    .replaceAll("registry/default/ai-elements/", `registry/${fw}/ui/`)
    .replaceAll("@/registry/default/ui/", `@/registry/${fw}/ui/`)
    .replace(/(^|["'])components\/ai-elements\//gm, `$1registry/${fw}/ui/`)
    .replaceAll("@/components/ui/", `@/registry/${fw}/ui/`)
    .replaceAll("@/components/ai-elements/", `@/registry/${fw}/ui/`)
  // React items here use the `cn` package and the radix-ui umbrella.
  if (fw === "react") out = out.replace(/(from\s+)["']@\/lib\/utils["']/g, '$1"cn"').replaceAll("@radix-ui/react-use-controllable-state", "radix-ui/internal")
  return out
}

export function saqaraDeps(upstream: string[] | undefined, contents: string[], self?: string): string[] {
  const imported = contents.flatMap((c) => [...c.matchAll(/@\/registry\/(?:new-york-v4|react|vue)\/ui\/([\w-]+)/g)].map((m) => m[1]))
  // AI Elements list their own items as full URLs (".../shimmer.json").
  const upstreamNames = (upstream ?? []).map((d) => (/^https?:/.test(d) ? d.replace(/^.*\/|\.json$/g, "") : d))
  const names = new Set([...upstreamNames, ...imported].filter((n) => n !== "utils" && n !== self && !n.includes("/")))
  return [...names].sort().map((n) => `@saqara/${n}`)
}

const FRAMEWORKS = new Set(["react", "react-dom", "vue"])

// Upstream items sometimes import packages they don't declare (e.g. button → class-variance-authority).
export function npmDeps(upstream: string[] | undefined, contents: string[]): string[] {
  const specifiers = contents.flatMap((c) => [...c.matchAll(/from ["']([^"'.@][^"']*|@[^/"']+\/[^"']+)["']/g)].map((m) => m[1]))
  const packages = specifiers
    .filter((s) => !s.startsWith("@/"))
    .map((s) => s.split("/").slice(0, s.startsWith("@") ? 2 : 1).join("/"))
    .filter((p) => !FRAMEWORKS.has(p))
  // "pkg@1.2.3" / "@scope/pkg@^2" from upstream win over the bare import of the same package.
  const name = (spec: string) => spec.replace(/(?<=.)@[^@/]*$/, "")
  const pinned = new Set((upstream ?? []).map(name))
  return [...new Set([...(upstream ?? []), ...packages.filter((p) => !pinned.has(p))])].sort()
}

const title = (name: string) => name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")

export function plan(upstream: UpstreamItem, fw: Fw, exists: (path: string) => boolean, force: boolean) {
  // An AI Elements target ("components/ai-elements/…") is dropped: the file installs with the ui items.
  const files = upstream.files.map((f) => ({ path: localize(f.path, fw), content: localize(f.content, fw), type: f.type === "registry:component" ? "registry:ui" : f.type, target: f.target?.startsWith("components/ai-elements/") ? undefined : f.target }))
  const clash = files.find((f) => exists(f.path))
  if (clash && !force) throw new Error(`${clash.path} already exists (customized?). Re-run with --force to overwrite.`)

  const declared = upstream.dependencies?.map((d) => (fw === "react" && d === "@radix-ui/react-use-controllable-state" ? "radix-ui" : d))
  const packages = npmDeps(declared, files.map((f) => f.content))
  const deps = saqaraDeps(upstream.registryDependencies, files.map((f) => f.content), upstream.name)
  const item: Item = {
    name: upstream.name,
    // AI Elements ship as registry:component; here they are listed with the other ui items.
    type: upstream.type === "registry:component" ? "registry:ui" : upstream.type,
    title: title(upstream.name),
    ...(packages.length ? { dependencies: packages } : {}),
    ...(deps.length ? { registryDependencies: deps } : {}),
    files: files.map(({ path, type, target }) => (target ? { path, type, target } : { path, type })),
  }
  return { files: files.map(({ path, content }) => ({ path, content })), item }
}

// Fetch and plan every (framework, name) pair first: a missing item aborts before any file is written.
export async function planAll(
  names: string[],
  fetchItem: (fw: Fw, name: string) => Promise<UpstreamItem>,
  exists: (path: string) => boolean,
  force: boolean,
): Promise<Record<Fw, ReturnType<typeof plan>[]>> {
  const planned: Record<Fw, ReturnType<typeof plan>[]> = { react: [], vue: [] }
  for (const fw of ["react", "vue"] as Fw[]) {
    for (const name of names) planned[fw].push(plan(await fetchItem(fw, name), fw, exists, force))
  }
  return planned
}
