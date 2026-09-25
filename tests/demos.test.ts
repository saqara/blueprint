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
