import type { ComponentType } from "react"
import type { Component } from "vue"
import type { Fw } from "./lib/framework"

// Loaded on demand: each page only fetches its own demo and source.
const reactDemos = import.meta.glob<{ default: ComponentType }>("../src/react/demos/*.tsx", {})
const reactDemoSources = import.meta.glob<string>("../src/react/demos/*.tsx", { query: "?raw", import: "default" })
const vueDemos = import.meta.glob<{ default: Component }>("../src/vue/demos/*.vue", {})
const vueDemoSources = import.meta.glob<string>("../src/vue/demos/*.vue", { query: "?raw", import: "default" })
const reactExamples = import.meta.glob<{ default: ComponentType }>("../src/examples/react/*.tsx", {})
const reactExampleSources = import.meta.glob<string>("../src/examples/react/*.tsx", { query: "?raw", import: "default" })
const vueExamples = import.meta.glob<{ default: Component }>("../src/examples/vue/*.vue", {})
const vueExampleSources = import.meta.glob<string>("../src/examples/vue/*.vue", { query: "?raw", import: "default" })

const pick = <T,>(glob: Record<string, T>, name: string) => Object.entries(glob).find(([path]) => path.split("/").pop()!.replace(/\.(tsx|vue)$/, "") === name)?.[1]

export type Demo = { fw: "react"; Component: ComponentType; source: string } | { fw: "vue"; Component: Component; source: string }

export async function loadDemo(kind: "demos" | "examples", fw: Fw, name: string): Promise<Demo | undefined> {
  if (fw === "react") {
    const mod = pick(kind === "demos" ? reactDemos : reactExamples, name)
    const source = pick(kind === "demos" ? reactDemoSources : reactExampleSources, name)
    if (!mod || !source) return undefined
    const [m, src] = await Promise.all([mod(), source()])
    return { fw, Component: m.default, source: src }
  }
  const mod = pick(kind === "demos" ? vueDemos : vueExamples, name)
  const source = pick(kind === "demos" ? vueDemoSources : vueExampleSources, name)
  if (!mod || !source) return undefined
  const [m, src] = await Promise.all([mod(), source()])
  return { fw, Component: m.default, source: src }
}
