import type { CssTree, Tokens } from "./contrast.ts"
import type { Item } from "./manifest.ts"

const colorMap = (t: Tokens) =>
  Object.fromEntries(Object.keys(t.light).filter((k) => k !== "radius").map((k) => [`color-${k}`, `var(--${k})`]))

export function themeItem(t: Tokens): Item {
  return {
    name: "saqara-theme",
    type: "registry:theme",
    title: "Saqara theme",
    description: "Couleurs, polices et ombres Saqara (clair + sombre).",
    dependencies: ["@fontsource/lato", "@fontsource/poppins"],
    cssVars: { theme: { ...colorMap(t), ...t.theme }, light: t.light, dark: t.dark },
    css: t.css,
    files: [],
  }
}

function rules(tree: CssTree, indent = ""): string {
  return Object.entries(tree)
    .map(([key, value]) => {
      if (typeof value === "string") return `${indent}${key}: ${value};`
      if (Object.keys(value).length === 0) return `${indent}${key};`
      return `${indent}${key} {\n${rules(value, indent + "  ")}\n${indent}}`
    })
    .join("\n")
}

const block = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")}\n}`

export function toCss(t: Tokens): string {
  return [
    rules(t.css),
    block(":root", t.light),
    block(".dark", t.dark),
    block("@theme inline", { ...colorMap(t), ...t.theme }),
  ].join("\n\n") + "\n"
}
