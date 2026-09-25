import type { Item } from "./manifest.ts"

export type Fw = "react" | "vue"
export type UpstreamItem = {
  name: string
  type: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: { path: string; type: string; content: string; target?: string }[]
}

export const UPSTREAM: Record<Fw, string> = {
  react: "https://ui.shadcn.com/r/styles/new-york-v4",
  vue: "https://www.shadcn-vue.com/r/styles/new-york-v4",
}

export const localize = (text: string, fw: Fw) => text.replaceAll("registry/new-york-v4/", `registry/${fw}/`)

export function saqaraDeps(upstream: string[] | undefined, contents: string[], self?: string): string[] {
  const imported = contents.flatMap((c) => [...c.matchAll(/@\/registry\/new-york-v4\/ui\/([\w-]+)/g)].map((m) => m[1]))
  const names = new Set([...(upstream ?? []), ...imported].filter((n) => n !== "utils" && n !== self && !n.includes("/")))
  return [...names].sort().map((n) => `@saqara/${n}`)
}

const title = (name: string) => name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")

export function plan(upstream: UpstreamItem, fw: Fw, exists: (path: string) => boolean, force: boolean) {
  const files = upstream.files.map((f) => ({ path: localize(f.path, fw), content: localize(f.content, fw), type: f.type, target: f.target }))
  const clash = files.find((f) => exists(f.path))
  if (clash && !force) throw new Error(`${clash.path} already exists (customized?). Re-run with --force to overwrite.`)

  const deps = saqaraDeps(upstream.registryDependencies, upstream.files.map((f) => f.content), upstream.name)
  const item: Item = {
    name: upstream.name,
    type: upstream.type,
    title: title(upstream.name),
    ...(upstream.dependencies?.length ? { dependencies: upstream.dependencies } : {}),
    ...(deps.length ? { registryDependencies: deps } : {}),
    files: files.map(({ path, type, target }) => (target ? { path, type, target } : { path, type })),
  }
  return { files: files.map(({ path, content }) => ({ path, content })), item }
}
