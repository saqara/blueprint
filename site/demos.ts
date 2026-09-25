import type { ComponentType } from "react"
import type { Component } from "vue"
import type { Fw } from "./lib/framework"

const reactDemos = import.meta.glob<{ default: ComponentType }>("../src/react/demos/*.tsx", { eager: true })
const reactDemoSources = import.meta.glob<string>("../src/react/demos/*.tsx", { eager: true, query: "?raw", import: "default" })
const vueDemos = import.meta.glob<{ default: Component }>("../src/vue/demos/*.vue", { eager: true })
const vueDemoSources = import.meta.glob<string>("../src/vue/demos/*.vue", { eager: true, query: "?raw", import: "default" })
const reactExamples = import.meta.glob<{ default: ComponentType }>("../src/examples/react/*.tsx", { eager: true })
const reactExampleSources = import.meta.glob<string>("../src/examples/react/*.tsx", { eager: true, query: "?raw", import: "default" })
const vueExamples = import.meta.glob<{ default: Component }>("../src/examples/vue/*.vue", { eager: true })
const vueExampleSources = import.meta.glob<string>("../src/examples/vue/*.vue", { eager: true, query: "?raw", import: "default" })

const pick = <T,>(glob: Record<string, T>, name: string) => Object.entries(glob).find(([path]) => path.split("/").pop()!.replace(/\.(tsx|vue)$/, "") === name)?.[1]

export type Demo = { fw: "react"; Component: ComponentType; source: string } | { fw: "vue"; Component: Component; source: string }

export function demoFor(kind: "demos" | "examples", fw: Fw, name: string): Demo | undefined {
  if (fw === "react") {
    const mod = pick(kind === "demos" ? reactDemos : reactExamples, name)
    const source = pick(kind === "demos" ? reactDemoSources : reactExampleSources, name)
    return mod && source !== undefined ? { fw, Component: mod.default, source } : undefined
  }
  const mod = pick(kind === "demos" ? vueDemos : vueExamples, name)
  const source = pick(kind === "demos" ? vueDemoSources : vueExampleSources, name)
  return mod && source !== undefined ? { fw, Component: mod.default, source } : undefined
}
