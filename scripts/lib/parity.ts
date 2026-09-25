import type { Manifest } from "./manifest.ts"

type Fw = "react" | "vue"

export function parityErrors(react: Manifest, vue: Manifest, hasDemo: (fw: Fw, name: string) => boolean): string[] {
  const errors: string[] = []
  const manifests: Record<Fw, Manifest> = { react, vue }
  const names = (fw: Fw) => new Set(manifests[fw].items.map((i) => i.name))

  // Hooks are framework-internal (e.g. React use-mobile): no twin, no demo.
  const shared = (fw: Fw) => new Set(manifests[fw].items.filter((i) => i.type !== "registry:hook").map((i) => i.name))

  for (const [fw, other] of [["react", "vue"], ["vue", "react"]] as const) {
    for (const name of shared(fw)) if (!shared(other).has(name)) errors.push(`"${name}" is in ${fw} but not in ${other}`)
  }
  for (const fw of ["react", "vue"] as const) {
    for (const item of manifests[fw].items) {
      const deps = (item.registryDependencies as string[] | undefined) ?? []
      for (const dep of deps) {
        if (dep.startsWith("@saqara/") && !names(fw).has(dep.slice(8))) errors.push(`${fw} "${item.name}" depends on missing "${dep}"`)
      }
      if (item.name !== "saqara-theme" && item.type !== "registry:hook" && !hasDemo(fw, item.name)) errors.push(`${fw} "${item.name}" has no demo in src/${fw}/demos/`)
    }
  }
  return errors
}

export function exampleErrors(react: string[], vue: string[]): string[] {
  const errors: string[] = []
  for (const [fw, names, other, otherNames] of [["react", react, "vue", vue], ["vue", vue, "react", react]] as const) {
    for (const name of names) if (!otherNames.includes(name)) errors.push(`example "${name}" is in ${fw} but not in ${other}`)
  }
  return errors
}
