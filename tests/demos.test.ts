// Every showcase demo must render: a single throwing demo blanks the whole page.
import { createElement, type ComponentType } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, type Component } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"

const react = import.meta.glob<{ default: ComponentType }>("../src/react/demos/*.tsx", { eager: true })
const vue = import.meta.glob<{ default: Component }>("../src/vue/demos/*.vue", { eager: true })

describe("react demos", () => {
  it.each(Object.entries(react))("%s renders", (_, mod) => {
    expect(renderToString(createElement(mod.default)).length).toBeGreaterThan(0)
  })
})

describe("vue demos", () => {
  it.each(Object.entries(vue))("%s renders", async (_, mod) => {
    expect((await renderVue(createSSRApp(mod.default))).length).toBeGreaterThan(0)
  })
})

const reactExamples = import.meta.glob<{ default: ComponentType }>("../src/examples/react/*.tsx", { eager: true })
const vueExamples = import.meta.glob<{ default: Component }>("../src/examples/vue/*.vue", { eager: true })

describe("react examples", () => {
  it.each(Object.entries(reactExamples))("%s renders", (_, mod) => {
    expect(renderToString(createElement(mod.default)).length).toBeGreaterThan(0)
  })
})

describe("vue examples", () => {
  it.each(Object.entries(vueExamples))("%s renders", async (_, mod) => {
    expect((await renderVue(createSSRApp(mod.default))).length).toBeGreaterThan(0)
  })
})

// Sources of every demo and example, for site-wide content rules.
const sources = {
  ...import.meta.glob<string>("../src/react/demos/*.tsx", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../src/vue/demos/*.vue", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../src/examples/react/*.tsx", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../src/examples/vue/*.vue", { eager: true, query: "?raw", import: "default" }),
}

describe("demo and example content", () => {
  it.each(Object.entries(sources))("%s keeps hash links inside the router", (_, src) => {
    expect(src).not.toMatch(/href="#[a-z]/)
  })
  it.each(Object.entries(sources))("%s uses obviously fictitious SIRENs and e-mail domains", (_, src) => {
    for (const siren of src.match(/\b\d{3} \d{3} \d{3}\b/g) ?? []) expect(siren).toMatch(/^9/)
    // e-mail addresses only (a local part before "@", so Vue's @submit.prevent is not one)
    for (const [, domain] of src.matchAll(/[\w.-]+@([a-z0-9-]+\.[a-z.]+)/g)) expect(domain).toBe("exemple.fr")
  })
  it.each(Object.entries(sources).filter(([p]) => p.endsWith(".vue")))("%s mounts a Toaster when it raises toasts", (_, src) => {
    if (/\btoast\./.test(src)) expect(src).toContain("<Toaster")
  })
  it.each(Object.entries(sources).filter(([p]) => p.includes("/react/")))("%s relies on the root Toaster (no duplicate)", (_, src) => {
    expect(src).not.toContain("<Toaster")
  })
})
