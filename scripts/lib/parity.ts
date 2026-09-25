import type { Manifest } from "./manifest.ts"

type Fw = "react" | "vue"

export function parityErrors(react: Manifest, vue: Manifest, hasDemo: (fw: Fw, name: string) => boolean): string[] {
  const errors: string[] = []
  const manifests: Record<Fw, Manifest> = { react, vue }
  const names = (fw: Fw) => new Set(manifests[fw].items.map((i) => i.name))

  for (const [fw, other] of [["react", "vue"], ["vue", "react"]] as const) {
    for (const name of names(fw)) if (!names(other).has(name)) errors.push(`"${name}" is in ${fw} but not in ${other}`)
  }
  for (const fw of ["react", "vue"] as const) {
    for (const item of manifests[fw].items) {
      const deps = (item.registryDependencies as string[] | undefined) ?? []
      for (const dep of deps) {
        if (dep.startsWith("@saqara/") && !names(fw).has(dep.slice(8))) errors.push(`${fw} "${item.name}" depends on missing "${dep}"`)
      }
      if (item.name !== "saqara-theme" && !hasDemo(fw, item.name)) errors.push(`${fw} "${item.name}" has no demo in src/${fw}/demos/`)
    }
  }
  return errors
}
