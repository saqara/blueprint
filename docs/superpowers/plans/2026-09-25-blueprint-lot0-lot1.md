# Blueprint — Lot 0 (socle) + Lot 1 (bases) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public shadcn + shadcn-vue registry serving the Saqara theme and 16 base components, with a React/Vue showcase on GitHub Pages.

**Architecture:** One Vite project. `tokens/theme.json` is the single token source; `scripts/sync-theme.ts` turns it into the `saqara-theme` registry item (both manifests) and into `src/theme.css` (showcase). Components are vendored from the official upstream registries by `scripts/vendor.ts`, which rewrites their paths/imports into `registry/react/` and `registry/vue/` and upserts them into `registry.react.json` / `registry.vue.json`. `shadcn build` and `shadcn-vue build` emit `public/r/{react,vue}/*.json`; `vite build` ships them with the showcase.

**Tech Stack:** Node 24+ (native TS type stripping for scripts), npm, Vite 8, React 19, Vue 3.5, Tailwind v4 (`@tailwindcss/vite`), shadcn CLI 4.x, shadcn-vue CLI 2.x, Vitest, vue-tsc, GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-09-25-blueprint-design.md`

## Global Constraints

- Code, comments, identifiers in English; showcase copy and docs in French.
- npm only (no pnpm). Node ≥ 24 in CI (`node scripts/x.ts` relies on built-in type stripping; imports between scripts use explicit `.ts` extensions).
- Tailwind v4, dark mode via `.dark` class on `<html>`.
- Every color token is `#RRGGBB` hex. Contrast ≥ 4.5:1 for every `X` / `X-foreground` pair, except declared exceptions `primary` and `identity`.
- Same item names in both manifests; items reference each other as `@saqara/<name>`.
- Registry-internal imports use `@/registry/react/...` or `@/registry/vue/...`; `@/lib/utils` for Vue `cn`; React `cn` comes from the npm package `cn` (as upstream does).
- `public/r/` and `dist/` are generated, git-ignored, never edited by hand.
- Published URL: `https://saqara.github.io/blueprint/` (Vite `base: "/blueprint/"`).
- Upstream sources: `https://ui.shadcn.com/r/styles/new-york-v4/<name>.json` (React), `https://www.shadcn-vue.com/r/styles/new-york-v4/<name>.json` (Vue).

## Review Focus

1. **Consumer install of a built item** — a fresh React app and a fresh Vue app run `shadcn add @saqara/…`: imports must be rewritten to the app's aliases (no `@/registry/` left) and the app must typecheck. Pinned by `scripts/smoke.sh` (Task 5).
2. **Re-vendoring a customized component** (e.g. `badge` after adding Saqara variants) must refuse to overwrite without `--force`. Pinned in Task 4 tests.
3. **Dangling inter-item dependency** — an item listing `@saqara/button` when `button` isn't in that manifest must fail `check`. Pinned in Task 3 tests.
4. **Malformed token** (`#FFF`, `oklch(...)`, key present in `light` but missing in `dark`) must fail `check` with a message naming the key. Pinned in Task 2 tests.
5. **Fonts and heading rule reach the consumer** — after installing `saqara-theme`, the consumer CSS contains the `@fontsource` imports and the `--primary: #F04632` variable. Pinned by `scripts/smoke.sh` (Task 5).

---

### Task 1: Project scaffold and empty showcase

**Files:**
- Create: `package.json`, `.gitignore`, `vite.config.ts`, `tsconfig.react.json`, `tsconfig.vue.json`, `lib/utils.ts`, `index.html`, `react.html`, `vue.html`, `src/styles.css`, `src/react/main.tsx`, `src/vue/main.ts`, `src/vue/App.vue`, `src/vue/shims.d.ts`

**Interfaces:**
- Produces: alias `@` → repo root (so `@/registry/react/ui/x`, `@/registry/vue/ui/x`, `@/lib/utils` resolve); demo discovery by glob `src/react/demos/*.tsx` and `src/vue/demos/*.vue` (each file default-exports one component; section id = file name); npm scripts `dev`, `build`, `check`, `sync`, `vendor`, `smoke`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "saqara-blueprint",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "sync": "node scripts/sync-theme.ts",
    "vendor": "node scripts/vendor.ts",
    "registry": "npm run sync && shadcn build registry.react.json -o public/r/react && shadcn-vue build registry.vue.json -o public/r/vue",
    "dev": "npm run sync && vite",
    "build": "npm run registry && vite build",
    "check": "node scripts/check-parity.ts && vitest run && tsc -p tsconfig.react.json && vue-tsc -p tsconfig.vue.json",
    "smoke": "bash scripts/smoke.sh"
  }
}
```

Scripts `sync`, `vendor`, `check-parity`, `smoke` are created in Tasks 2–5; until then only `vite` / `vite build` are run directly.

- [ ] **Step 2: Install dependencies**

```bash
npm i react react-dom vue cn clsx tailwind-merge class-variance-authority tw-animate-css lucide-react @lucide/vue @fontsource/lato @fontsource/poppins
npm i -D vite @vitejs/plugin-react @vitejs/plugin-vue tailwindcss @tailwindcss/vite typescript vue-tsc vitest @types/react @types/react-dom @types/node shadcn shadcn-vue
```

Expected: both commands exit 0.

- [ ] **Step 3: Write config files**

`.gitignore`:
```
node_modules/
dist/
public/r/
```

`vite.config.ts`:
```ts
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  base: "/blueprint/",
  plugins: [react(), vue(), tailwindcss()],
  resolve: { alias: { "@": root } },
  build: {
    rollupOptions: {
      input: { index: `${root}index.html`, react: `${root}react.html`, vue: `${root}vue.html` },
    },
  },
})
```

`tsconfig.react.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "types": ["node", "vite/client"],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["registry/react", "src/react", "scripts", "lib"]
}
```

`tsconfig.vue.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "preserve",
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["registry/vue/**/*.ts", "registry/vue/**/*.vue", "src/vue/**/*.ts", "src/vue/**/*.vue", "lib"]
}
```

`lib/utils.ts` (Vue items import `cn` from `@/lib/utils`, the path every shadcn-vue app already has):
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Write the showcase shell**

`src/styles.css` (`theme.css` is generated in Task 2; create an empty placeholder file now so the build passes: `touch src/theme.css`):
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./theme.css";

@source "../registry";
@custom-variant dark (&:is(.dark *));

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

`index.html`:
```html
<!doctype html>
<html lang="fr">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Saqara Blueprint</title></head>
  <body style="font-family: system-ui; padding: 2rem">
    <h1>Saqara Blueprint</h1>
    <ul>
      <li><a href="./react.html">Composants React</a></li>
      <li><a href="./vue.html">Composants Vue</a></li>
    </ul>
  </body>
</html>
```

`react.html`:
```html
<!doctype html>
<html lang="fr">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Blueprint — React</title></head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/react/main.tsx"></script>
  </body>
</html>
```

`vue.html`: same as `react.html` with title `Blueprint — Vue` and `src="/src/vue/main.ts"`.

`src/react/main.tsx`:
```tsx
import "../styles.css"
import { StrictMode, type ComponentType } from "react"
import { createRoot } from "react-dom/client"

const demos = import.meta.glob<{ default: ComponentType }>("./demos/*.tsx", { eager: true })

function App() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-heading">Blueprint — React</h1>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => document.documentElement.classList.toggle("dark")}>
          Clair / sombre
        </button>
      </header>
      {Object.entries(demos).map(([path, mod]) => {
        const name = path.split("/").pop()!.replace(".tsx", "")
        const Demo = mod.default
        return (
          <section key={name} id={name} className="space-y-3">
            <h2 className="text-lg font-heading"><a href={`#${name}`}>{name}</a></h2>
            <Demo />
          </section>
        )
      })}
    </main>
  )
}

createRoot(document.getElementById("app")!).render(<StrictMode><App /></StrictMode>)
```

`src/vue/main.ts`:
```ts
import "../styles.css"
import { createApp } from "vue"
import App from "./App.vue"

createApp(App).mount("#app")
```

`src/vue/App.vue`:
```vue
<script setup lang="ts">
import type { Component } from "vue"

const modules = import.meta.glob<{ default: Component }>("./demos/*.vue", { eager: true })
const demos = Object.entries(modules).map(([path, mod]) => ({
  name: path.split("/").pop()!.replace(".vue", ""),
  component: mod.default,
}))
const toggle = () => document.documentElement.classList.toggle("dark")
</script>

<template>
  <main class="mx-auto max-w-4xl space-y-10 p-8">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-heading">Blueprint — Vue</h1>
      <button class="rounded-md border px-3 py-1 text-sm" @click="toggle">Clair / sombre</button>
    </header>
    <section v-for="demo in demos" :id="demo.name" :key="demo.name" class="space-y-3">
      <h2 class="text-lg font-heading"><a :href="`#${demo.name}`">{{ demo.name }}</a></h2>
      <component :is="demo.component" />
    </section>
  </main>
</template>
```

`src/vue/shims.d.ts`:
```ts
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<object, object, unknown>
  export default component
}
```

- [ ] **Step 5: Verify the build**

Run: `npx vite build`
Expected: exit 0, `dist/index.html`, `dist/react.html`, `dist/vue.html` exist.

Run: `npx tsc -p tsconfig.react.json && npx vue-tsc -p tsconfig.vue.json`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite showcase for React and Vue"
```

---

### Task 2: Tokens, contrast check, and `sync-theme`

**Files:**
- Create: `tokens/theme.json`, `scripts/lib/contrast.ts`, `scripts/lib/manifest.ts`, `scripts/lib/theme.ts`, `scripts/sync-theme.ts`, `registry.react.json`, `registry.vue.json`, `tests/tokens.test.ts`, `tests/theme.test.ts`
- Modify: `src/theme.css` (from now on generated by `npm run sync`; it stays committed so a plain `vite` works, and every `npm run build` regenerates it)

**Interfaces:**
- Produces:
  - `type Tokens = { light: Record<string, string>; dark: Record<string, string>; theme: Record<string, string>; css: CssTree; contrastExceptions: string[] }` and `type CssTree = { [selector: string]: CssTree | string }` (in `scripts/lib/contrast.ts`)
  - `contrastRatio(a: string, b: string): number`, `tokenErrors(t: Tokens): string[]` (in `scripts/lib/contrast.ts`)
  - `type Item = { name: string; type: string; [k: string]: unknown }`, `type Manifest = { $schema: string; name: string; homepage: string; items: Item[] }`, `readManifest(path: string): Manifest`, `writeManifest(path: string, m: Manifest): void`, `upsertItem(m: Manifest, item: Item): Manifest` (in `scripts/lib/manifest.ts`; `saqara-theme` always sorted first, others alphabetically)
  - `themeItem(t: Tokens): Item`, `toCss(t: Tokens): string` (in `scripts/lib/theme.ts`)

- [ ] **Step 1: Write `tokens/theme.json`** (values copied from spec §4)

```json
{
  "contrastExceptions": ["primary", "identity"],
  "light": {
    "radius": "0.375rem",
    "background": "#FFFFFF", "foreground": "#2D2D2D",
    "card": "#FFFFFF", "card-foreground": "#2D2D2D",
    "popover": "#FFFFFF", "popover-foreground": "#2D2D2D",
    "primary": "#F04632", "primary-foreground": "#FFFFFF",
    "secondary": "#F4F6F8", "secondary-foreground": "#283549",
    "muted": "#F3F3F4", "muted-foreground": "#646671",
    "accent": "#FDECEB", "accent-foreground": "#B32019",
    "destructive": "#C2002C", "destructive-foreground": "#FFFFFF",
    "border": "#E8E8E9", "input": "#E8E8E9", "ring": "#F04632",
    "identity": "#F04632", "identity-foreground": "#FFFFFF",
    "navy": "#283549", "navy-foreground": "#FFFFFF",
    "success": "#6EBD71", "success-foreground": "#161925",
    "warning": "#E59A06", "warning-foreground": "#161925",
    "info": "#0A5CD6", "info-foreground": "#FFFFFF"
  },
  "dark": {
    "radius": "0.375rem",
    "background": "#161925", "foreground": "#F5F8FF",
    "card": "#1F2230", "card-foreground": "#F5F8FF",
    "popover": "#1F2230", "popover-foreground": "#F5F8FF",
    "primary": "#F04632", "primary-foreground": "#FFFFFF",
    "secondary": "#363947", "secondary-foreground": "#F5F8FF",
    "muted": "#363947", "muted-foreground": "#B0B3C3",
    "accent": "#363947", "accent-foreground": "#F5F8FF",
    "destructive": "#C2002C", "destructive-foreground": "#FFFFFF",
    "border": "#363947", "input": "#454751", "ring": "#F04632",
    "identity": "#F04632", "identity-foreground": "#FFFFFF",
    "navy": "#283549", "navy-foreground": "#FFFFFF",
    "success": "#6EBD71", "success-foreground": "#161925",
    "warning": "#E59A06", "warning-foreground": "#161925",
    "info": "#0A5CD6", "info-foreground": "#FFFFFF"
  },
  "theme": {
    "font-sans": "Lato, ui-sans-serif, system-ui, sans-serif",
    "font-heading": "Poppins, ui-sans-serif, system-ui, sans-serif",
    "radius-sm": "calc(var(--radius) - 4px)",
    "radius-md": "calc(var(--radius) - 2px)",
    "radius-lg": "var(--radius)",
    "radius-xl": "calc(var(--radius) + 4px)",
    "shadow-sm": "0 4px 4px rgba(0,0,0,.1)",
    "shadow-md": "0 10px 20px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.04), 0 0 1px rgba(0,0,0,.04)",
    "shadow-lg": "0 10px 72px rgba(155,154,154,.3)"
  },
  "css": {
    "@import \"@fontsource/lato/400.css\"": {},
    "@import \"@fontsource/lato/700.css\"": {},
    "@import \"@fontsource/poppins/400.css\"": {},
    "@import \"@fontsource/poppins/500.css\"": {},
    "@import \"@fontsource/poppins/600.css\"": {},
    "@layer base": { "h1, h2, h3, h4, h5, h6": { "@apply font-heading": {} } }
  }
}
```

- [ ] **Step 2: Write the failing tests** — `tests/tokens.test.ts`

```ts
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { contrastRatio, tokenErrors, type Tokens } from "../scripts/lib/contrast.ts"

const base = { theme: {}, css: {}, contrastExceptions: [] }

describe("contrastRatio", () => {
  it("is 21 for white on black", () => expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 1))
  it("matches the spec value for white on brand red", () => expect(contrastRatio("#FFFFFF", "#F04632")).toBeCloseTo(3.73, 2))
  it("is symmetric", () => expect(contrastRatio("#F04632", "#FFFFFF")).toBe(contrastRatio("#FFFFFF", "#F04632")))
})

describe("tokenErrors", () => {
  it("accepts the real tokens", () => {
    const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
    expect(tokenErrors(t)).toEqual([])
  })

  it("flags a low-contrast pair in each mode", () => {
    const vars = { a: "#FFFFFF", "a-foreground": "#EEEEEE" }
    const errors = tokenErrors({ ...base, light: vars, dark: vars })
    expect(errors).toHaveLength(2)
    expect(errors[0]).toContain("a-foreground on a")
  })

  it("tolerates declared exceptions", () => {
    const vars = { a: "#FFFFFF", "a-foreground": "#EEEEEE" }
    expect(tokenErrors({ ...base, contrastExceptions: ["a"], light: vars, dark: vars })).toEqual([])
  })

  it("rejects non #RRGGBB colors, naming the key", () => {
    const light = { a: "#FFF", b: "oklch(0.5 0 0)" }
    const errors = tokenErrors({ ...base, light, dark: light })
    expect(errors.some((e) => e.includes("light.a"))).toBe(true)
    expect(errors.some((e) => e.includes("light.b"))).toBe(true)
  })

  it("rejects keys missing from one mode", () => {
    const errors = tokenErrors({ ...base, light: { a: "#FFFFFF", b: "#000000" }, dark: { a: "#FFFFFF" } })
    expect(errors).toContain("dark.b: missing (present in light)")
  })

  it("checks muted-foreground on background", () => {
    const vars = { background: "#FFFFFF", "muted-foreground": "#EEEEEE" }
    expect(tokenErrors({ ...base, light: vars, dark: vars })[0]).toContain("muted-foreground on background")
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/tokens.test.ts`
Expected: FAIL — cannot resolve `../scripts/lib/contrast.ts`.

- [ ] **Step 4: Implement `scripts/lib/contrast.ts`**

```ts
export type CssTree = { [selector: string]: CssTree | string }
export type Tokens = {
  light: Record<string, string>
  dark: Record<string, string>
  theme: Record<string, string>
  css: CssTree
  contrastExceptions: string[]
}

const HEX = /^#[0-9A-Fa-f]{6}$/
const NON_COLOR = new Set(["radius"])

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export function tokenErrors(t: Tokens): string[] {
  const errors: string[] = []
  const modes = { light: t.light, dark: t.dark }
  for (const [mode, vars] of Object.entries(modes)) {
    const other = mode === "light" ? t.dark : t.light
    for (const k of Object.keys(other)) {
      if (!(k in vars)) errors.push(`${mode}.${k}: missing (present in ${mode === "light" ? "dark" : "light"})`)
    }
    const bad = Object.entries(vars).filter(([k, v]) => !NON_COLOR.has(k) && !HEX.test(v))
    for (const [k, v] of bad) errors.push(`${mode}.${k}: "${v}" is not #RRGGBB`)
    if (bad.length) continue

    const pairs = Object.keys(vars)
      .filter((k) => vars[`${k}-foreground`])
      .map((k) => [k, `${k}-foreground`])
    for (const bg of ["background", "card"]) {
      if (vars[bg] && vars["muted-foreground"]) pairs.push([bg, "muted-foreground"])
    }
    for (const [bg, fg] of pairs) {
      const ratio = contrastRatio(vars[bg], vars[fg])
      if (ratio < 4.5 && !t.contrastExceptions.includes(bg)) {
        errors.push(`${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (< 4.5)`)
      }
    }
  }
  return errors
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/tokens.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: Write the failing tests** — `tests/theme.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { themeItem, toCss } from "../scripts/lib/theme.ts"
import { upsertItem, type Manifest } from "../scripts/lib/manifest.ts"
import type { Tokens } from "../scripts/lib/contrast.ts"

const tokens: Tokens = {
  light: { radius: "0.375rem", primary: "#F04632" },
  dark: { radius: "0.375rem", primary: "#F04632" },
  theme: { "font-sans": "Lato" },
  css: { '@import "x.css"': {}, "@layer base": { h1: { "@apply font-heading": {} } } },
  contrastExceptions: [],
}

describe("themeItem", () => {
  it("maps every color var to a Tailwind color, but not radius", () => {
    const item = themeItem(tokens) as any
    expect(item.name).toBe("saqara-theme")
    expect(item.cssVars.theme["color-primary"]).toBe("var(--primary)")
    expect(item.cssVars.theme["color-radius"]).toBeUndefined()
    expect(item.cssVars.theme["font-sans"]).toBe("Lato")
    expect(item.cssVars.light.primary).toBe("#F04632")
    expect(item.css).toEqual(tokens.css)
  })
})

describe("toCss", () => {
  it("emits imports first, then :root, .dark and @theme inline", () => {
    const css = toCss(tokens)
    expect(css.indexOf('@import "x.css";')).toBe(0)
    expect(css).toContain(":root {\n  --radius: 0.375rem;\n  --primary: #F04632;\n}")
    expect(css).toContain(".dark {")
    expect(css).toContain("@theme inline {")
    expect(css).toContain("  --color-primary: var(--primary);")
    expect(css).toContain("@layer base {\n  h1 {\n    @apply font-heading;\n  }\n}")
  })
})

describe("upsertItem", () => {
  const m: Manifest = { $schema: "s", name: "saqara", homepage: "h", items: [{ name: "button", type: "registry:ui" }] }
  it("replaces an item by name and keeps saqara-theme first", () => {
    const next = upsertItem(upsertItem(m, { name: "badge", type: "registry:ui" }), { name: "saqara-theme", type: "registry:theme" })
    expect(next.items.map((i) => i.name)).toEqual(["saqara-theme", "badge", "button"])
    const replaced = upsertItem(next, { name: "button", type: "registry:ui", title: "B" })
    expect(replaced.items).toHaveLength(3)
    expect(replaced.items.find((i) => i.name === "button")!.title).toBe("B")
  })
})
```

- [ ] **Step 7: Run tests to verify they fail**

Run: `npx vitest run tests/theme.test.ts`
Expected: FAIL — cannot resolve `../scripts/lib/theme.ts`.

- [ ] **Step 8: Implement `scripts/lib/manifest.ts` and `scripts/lib/theme.ts`**

`scripts/lib/manifest.ts`:
```ts
import { readFileSync, writeFileSync } from "node:fs"

export type Item = { name: string; type: string; [k: string]: unknown }
export type Manifest = { $schema: string; name: string; homepage: string; items: Item[] }

export const readManifest = (path: string): Manifest => JSON.parse(readFileSync(path, "utf8"))
export const writeManifest = (path: string, m: Manifest) => writeFileSync(path, JSON.stringify(m, null, 2) + "\n")

export function upsertItem(m: Manifest, item: Item): Manifest {
  const items = [...m.items.filter((i) => i.name !== item.name), item].sort((a, b) =>
    a.name === "saqara-theme" ? -1 : b.name === "saqara-theme" ? 1 : a.name.localeCompare(b.name),
  )
  return { ...m, items }
}
```

`scripts/lib/theme.ts`:
```ts
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
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS (all tests in `tests/`).

- [ ] **Step 10: Write the manifests and `scripts/sync-theme.ts`**

`registry.react.json`:
```json
{ "$schema": "https://ui.shadcn.com/schema/registry.json", "name": "saqara", "homepage": "https://saqara.github.io/blueprint/", "items": [] }
```

`registry.vue.json`:
```json
{ "$schema": "https://shadcn-vue.com/schema/registry.json", "name": "saqara", "homepage": "https://saqara.github.io/blueprint/", "items": [] }
```

`scripts/sync-theme.ts`:
```ts
import { readFileSync, writeFileSync } from "node:fs"
import { tokenErrors, type Tokens } from "./lib/contrast.ts"
import { readManifest, upsertItem, writeManifest } from "./lib/manifest.ts"
import { themeItem, toCss } from "./lib/theme.ts"

const tokens: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
const errors = tokenErrors(tokens)
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
for (const path of ["registry.react.json", "registry.vue.json"]) {
  writeManifest(path, upsertItem(readManifest(path), themeItem(tokens)))
}
writeFileSync("src/theme.css", "/* Generated by scripts/sync-theme.ts from tokens/theme.json — do not edit. */\n" + toCss(tokens))
console.log("saqara-theme synced")
```

- [ ] **Step 11: Run sync and both registry builds**

Run: `npm run registry`
Expected: `saqara-theme synced`, then both CLIs exit 0; `public/r/react/saqara-theme.json` and `public/r/vue/saqara-theme.json` exist and contain `"primary": "#F04632"`.

If a CLI rejects `"files": []` on a `registry:theme` item, delete the `files` key from `themeItem` (and from the `themeItem` test expectations if any), rerun `npx vitest run` and `npm run registry`.

- [ ] **Step 12: Visual check**

Run: `npx vite build && npx vite preview --port 4173` and open `http://localhost:4173/blueprint/react.html`.
Expected: the title renders in Poppins, body in Lato; the toggle switches the background to `#161925`. Stop the preview server.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add Saqara tokens, contrast check and theme sync"
```

---

### Task 3: Parity check

**Files:**
- Create: `scripts/lib/parity.ts`, `scripts/check-parity.ts`, `tests/parity.test.ts`

**Interfaces:**
- Consumes: `Manifest`, `readManifest` from `scripts/lib/manifest.ts`
- Produces: `parityErrors(react: Manifest, vue: Manifest, hasDemo: (fw: "react" | "vue", name: string) => boolean): string[]`

- [ ] **Step 1: Write the failing test** — `tests/parity.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { parityErrors } from "../scripts/lib/parity.ts"
import type { Item, Manifest } from "../scripts/lib/manifest.ts"

const m = (...items: Item[]): Manifest => ({ $schema: "", name: "saqara", homepage: "", items })
const theme = { name: "saqara-theme", type: "registry:theme" }
const button = { name: "button", type: "registry:ui" }
const yes = () => true

describe("parityErrors", () => {
  it("passes for identical manifests with demos", () => {
    expect(parityErrors(m(theme, button), m(theme, button), yes)).toEqual([])
  })
  it("flags an item missing from one framework", () => {
    expect(parityErrors(m(theme, button), m(theme), yes)).toEqual(['"button" is in react but not in vue'])
  })
  it("flags a dangling @saqara dependency", () => {
    const dialog = { name: "dialog", type: "registry:ui", registryDependencies: ["@saqara/button"] }
    expect(parityErrors(m(dialog), m(dialog), yes)).toEqual([
      'react "dialog" depends on missing "@saqara/button"',
      'vue "dialog" depends on missing "@saqara/button"',
    ])
  })
  it("flags a missing demo, but never for the theme", () => {
    const hasDemo = (fw: string) => fw === "react"
    expect(parityErrors(m(theme, button), m(theme, button), hasDemo)).toEqual(['vue "button" has no demo in src/vue/demos/'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/parity.test.ts`
Expected: FAIL — cannot resolve `../scripts/lib/parity.ts`.

- [ ] **Step 3: Implement**

`scripts/lib/parity.ts`:
```ts
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
```

`scripts/check-parity.ts`:
```ts
import { existsSync } from "node:fs"
import { readManifest } from "./lib/manifest.ts"
import { parityErrors } from "./lib/parity.ts"

const errors = parityErrors(readManifest("registry.react.json"), readManifest("registry.vue.json"), (fw, name) =>
  existsSync(`src/${fw}/demos/${name}.${fw === "react" ? "tsx" : "vue"}`),
)
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("parity ok")
```

- [ ] **Step 4: Run tests and the full check**

Run: `npx vitest run && npm run check`
Expected: all tests PASS; `parity ok`; tsc and vue-tsc exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add React/Vue registry parity check"
```

---

### Task 4: Vendor script + first component (Button)

**Files:**
- Create: `scripts/lib/vendor.ts`, `scripts/vendor.ts`, `tests/vendor.test.ts`, `src/react/demos/button.tsx`, `src/vue/demos/button.vue`
- Generated by the script: `registry/react/ui/button.tsx`, `registry/vue/ui/button/*`, items in both manifests

**Interfaces:**
- Consumes: `Item`, `readManifest`, `writeManifest`, `upsertItem` from `scripts/lib/manifest.ts`
- Produces:
  - `UPSTREAM: Record<"react" | "vue", string>` (base URLs, see Global Constraints)
  - `localize(text: string, fw: "react" | "vue"): string` — replaces `registry/new-york-v4/` with `registry/<fw>/` (works for both file paths and `@/registry/...` imports)
  - `saqaraDeps(upstream: string[] | undefined, contents: string[]): string[]` — union of upstream `registryDependencies` and `@/registry/new-york-v4/ui/<x>` imports, minus `utils`, as sorted `@saqara/<x>`
  - `plan(upstream: UpstreamItem, fw, exists: (path: string) => boolean, force: boolean): { files: { path: string; content: string }[]; item: Item }` — throws `Error('<path> already exists (customized?). Re-run with --force to overwrite.')` when a target exists and `force` is false
  - CLI: `npm run vendor -- <name...> [--force]`, prints the `npm i` line for missing dependencies

- [ ] **Step 1: Write the failing test** — `tests/vendor.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { localize, plan, saqaraDeps } from "../scripts/lib/vendor.ts"

const upstream = {
  name: "radio-group",
  type: "registry:ui",
  dependencies: ["reka-ui"],
  registryDependencies: ["utils", "label"],
  files: [{ path: "registry/new-york-v4/ui/radio-group/RadioGroup.vue", type: "registry:ui",
    content: 'import { cn } from "@/lib/utils"\nimport { Button } from "@/registry/new-york-v4/ui/button"\n' }],
}

describe("localize", () => {
  it("rewrites paths and imports to the framework folder", () => {
    expect(localize('from "@/registry/new-york-v4/ui/button"', "react")).toBe('from "@/registry/react/ui/button"')
    expect(localize("registry/new-york-v4/ui/button/Button.vue", "vue")).toBe("registry/vue/ui/button/Button.vue")
  })
})

describe("saqaraDeps", () => {
  it("merges upstream deps and imports, drops utils, namespaces and sorts", () => {
    expect(saqaraDeps(["utils", "label"], [upstream.files[0].content])).toEqual(["@saqara/button", "@saqara/label"])
  })
  it("handles missing upstream deps and self-imports", () => {
    expect(saqaraDeps(undefined, ['from "@/registry/new-york-v4/ui/radio-group"'], "radio-group")).toEqual([])
  })
})

describe("plan", () => {
  it("builds localized files and a manifest item", () => {
    const { files, item } = plan(upstream, "vue", () => false, false)
    expect(files[0].path).toBe("registry/vue/ui/radio-group/RadioGroup.vue")
    expect(files[0].content).toContain('"@/registry/vue/ui/button"')
    expect(item).toEqual({
      name: "radio-group",
      type: "registry:ui",
      title: "Radio Group",
      dependencies: ["reka-ui"],
      registryDependencies: ["@saqara/button", "@saqara/label"],
      files: [{ path: "registry/vue/ui/radio-group/RadioGroup.vue", type: "registry:ui" }],
    })
  })
  it("refuses to overwrite an existing (possibly customized) file", () => {
    expect(() => plan(upstream, "vue", () => true, false)).toThrow(/already exists.*--force/)
  })
  it("overwrites with force", () => {
    expect(plan(upstream, "vue", () => true, true).files).toHaveLength(1)
  })
})
```

Note the third `saqaraDeps` argument: an item must never depend on itself. The signature is therefore `saqaraDeps(upstream: string[] | undefined, contents: string[], self?: string): string[]`, and `plan` passes `upstream.name`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/vendor.test.ts`
Expected: FAIL — cannot resolve `../scripts/lib/vendor.ts`.

- [ ] **Step 3: Implement `scripts/lib/vendor.ts`**

```ts
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

  const item: Item = {
    name: upstream.name,
    type: upstream.type,
    title: title(upstream.name),
    ...(upstream.dependencies?.length ? { dependencies: upstream.dependencies } : {}),
    ...(() => {
      const deps = saqaraDeps(upstream.registryDependencies, upstream.files.map((f) => f.content), upstream.name)
      return deps.length ? { registryDependencies: deps } : {}
    })(),
    files: files.map(({ path, type, target }) => (target ? { path, type, target } : { path, type })),
  }
  return { files: files.map(({ path, content }) => ({ path, content })), item }
}
```

Upstream dependencies that are URLs or other namespaces (`!n.includes("/")` filter) are dropped on purpose: Blueprint only depends on its own items.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/vendor.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Write the CLI** — `scripts/vendor.ts`

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { readManifest, upsertItem, writeManifest } from "./lib/manifest.ts"
import { plan, UPSTREAM, type Fw, type UpstreamItem } from "./lib/vendor.ts"

const args = process.argv.slice(2)
const force = args.includes("--force")
const names = args.filter((a) => a !== "--force")
if (!names.length) {
  console.error("usage: npm run vendor -- <name...> [--force]")
  process.exit(1)
}

const installed = new Set(Object.keys(JSON.parse(readFileSync("package.json", "utf8")).dependencies ?? {}))
const missing = new Set<string>()

for (const fw of ["react", "vue"] as Fw[]) {
  const manifestPath = `registry.${fw}.json`
  let manifest = readManifest(manifestPath)
  for (const name of names) {
    const res = await fetch(`${UPSTREAM[fw]}/${name}.json`)
    if (!res.ok) throw new Error(`upstream ${fw} has no "${name}" (HTTP ${res.status})`)
    const { files, item } = plan((await res.json()) as UpstreamItem, fw, existsSync, force)
    for (const f of files) {
      mkdirSync(dirname(f.path), { recursive: true })
      writeFileSync(f.path, f.content)
    }
    manifest = upsertItem(manifest, item)
    for (const d of (item.dependencies as string[] | undefined) ?? []) if (!installed.has(d)) missing.add(d)
    console.log(`${fw}: ${name} (${files.length} files)`)
  }
  writeManifest(manifestPath, manifest)
}
if (missing.size) console.log(`\nInstall missing dependencies:\n  npm i ${[...missing].join(" ")}`)
```

Because both frameworks are processed before the manifest write, a missing upstream item aborts the run before any manifest changes for that framework; files already written for the other framework are overwritten on the next run with `--force`.

- [ ] **Step 6: Vendor Button**

Run: `npm run vendor -- button`
Expected: `react: button (1 files)`, `vue: button (2 files)`, possibly an `npm i ...` line — run it (expected: `radix-ui`, `reka-ui`).

- [ ] **Step 7: Write the demos**

`src/react/demos/button.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Enregistrer</Button>
      <Button variant="secondary">Annuler</Button>
      <Button variant="outline">Exporter</Button>
      <Button variant="ghost">Plus d'options</Button>
      <Button variant="destructive">Supprimer</Button>
      <Button variant="link">Voir le détail</Button>
      <Button disabled>Désactivé</Button>
    </div>
  )
}
```

`src/vue/demos/button.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button>Enregistrer</Button>
    <Button variant="secondary">Annuler</Button>
    <Button variant="outline">Exporter</Button>
    <Button variant="ghost">Plus d'options</Button>
    <Button variant="destructive">Supprimer</Button>
    <Button variant="link">Voir le détail</Button>
    <Button disabled>Désactivé</Button>
  </div>
</template>
```

- [ ] **Step 8: Verify check and build**

Run: `npm run check && npm run build`
Expected: `parity ok`, tests PASS, tsc/vue-tsc exit 0, both registry builds exit 0, `public/r/react/button.json` and `public/r/vue/button.json` exist, vite build exit 0.

- [ ] **Step 9: Verify the refusal to overwrite**

Run: `npm run vendor -- button`
Expected: exits non-zero with `registry/react/ui/button.tsx already exists (customized?). Re-run with --force to overwrite.`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add vendor script and Button (React + Vue)"
```

---

### Task 5: Consumer smoke test

**Files:**
- Create: `scripts/smoke.sh`

**Interfaces:**
- Consumes: built `public/r/{react,vue}/*.json` (run after `npm run build`), manifests for the item list.
- Produces: `npm run smoke` — exit 0 only if both a React and a Vue consumer install every item and typecheck.

- [ ] **Step 1: Write `scripts/smoke.sh`**

```bash
#!/usr/bin/env bash
# Installs every registry item into throwaway React and Vue apps, then typechecks them.
set -euo pipefail

ROOT=$(pwd)
TMP=$(mktemp -d)
PORT=4873
python3 -m http.server "$PORT" -d "$ROOT/public" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER; rm -rf "$TMP"' EXIT
sleep 1

items() { node -e "console.log(require('$ROOT/registry.$1.json').items.map(i => '@saqara/' + i.name).join(' '))"; }

write_common() { # $1 = app dir
  mkdir -p "$1/src"
  echo '{ "name": "smoke", "private": true, "type": "module" }' > "$1/package.json"
  printf '@import "tailwindcss";\n' > "$1/src/index.css"
}

# --- React consumer
R="$TMP/react"; write_common "$R"
cat > "$R/tsconfig.json" <<'EOF'
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
  "strict": true, "noEmit": true, "skipLibCheck": true, "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }, "include": ["src"] }
EOF
cat > "$R/components.json" <<EOF
{ "\$schema": "https://ui.shadcn.com/schema.json", "style": "new-york", "rsc": false, "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
  "iconLibrary": "lucide", "registries": { "@saqara": "http://localhost:$PORT/r/react/{name}.json" } }
EOF
(cd "$R" && npm i -s react react-dom tailwindcss vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  && npx -y shadcn@latest add $(items react) -y \
  && npx tsc -p .)

# --- Vue consumer
V="$TMP/vue"; write_common "$V"
cat > "$V/tsconfig.json" <<'EOF'
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "preserve",
  "strict": true, "noEmit": true, "skipLibCheck": true, "baseUrl": ".", "paths": { "@/*": ["./src/*"] } },
  "include": ["src/**/*.ts", "src/**/*.vue"] }
EOF
printf 'declare module "*.vue" { import type { DefineComponent } from "vue"; const c: DefineComponent<object, object, unknown>; export default c }\n' > "$V/src/shims.d.ts"
mkdir -p "$V/src/lib" && cp "$ROOT/lib/utils.ts" "$V/src/lib/utils.ts"
cat > "$V/components.json" <<EOF
{ "\$schema": "https://shadcn-vue.com/schema.json", "style": "new-york", "typescript": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "composables": "@/composables" },
  "iconLibrary": "lucide", "registries": { "@saqara": "http://localhost:$PORT/r/vue/{name}.json" } }
EOF
(cd "$V" && npm i -s vue tailwindcss vite @vitejs/plugin-vue typescript vue-tsc clsx tailwind-merge \
  && npx -y shadcn-vue@latest add $(items vue) -y \
  && npx vue-tsc -p .)

# --- Assertions shared by both consumers
for APP in "$R" "$V"; do
  if grep -rq "@/registry/" "$APP/src"; then echo "FAIL: unrewritten @/registry/ import in $APP"; exit 1; fi
  grep -q -- "--primary: #F04632" "$APP/src/index.css" || { echo "FAIL: theme vars missing in $APP/src/index.css"; exit 1; }
  grep -q "@fontsource/lato" "$APP/src/index.css" || { echo "FAIL: font imports missing in $APP/src/index.css"; exit 1; }
done
echo "smoke ok"
```

Then `chmod +x scripts/smoke.sh`.

- [ ] **Step 2: Run it**

Run: `npm run build && npm run smoke`
Expected: `smoke ok`.

Known failure modes and the fix for each:
- CLI says the project/framework cannot be detected → add a `vite.config.ts` to the consumer before `add` (React: `import react from "@vitejs/plugin-react"; export default { plugins: [react()] }`, Vue: same with `@vitejs/plugin-vue`) via a heredoc in the script, rerun.
- `FAIL: font imports missing` → the CLI dropped the `@import` entries of `css`. Then remove the five `@import` keys from `tokens/theme.json` `css`, keep them in the showcase by adding the same five `@import "@fontsource/…";` lines at the top of `src/styles.css`, delete the `@fontsource/lato` grep from the script, and add the imports to the README consumer instructions (Task 6). Rerun `npm run check && npm run build && npm run smoke`.
- `FAIL: unrewritten @/registry/ import` → stop and report: the CLI's import transform does not match `@/registry/<fw>/ui/…`; this invalidates the path convention and needs a design decision.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add consumer smoke test for React and Vue installs"
```

---

### Task 6: CI, GitHub Pages, README

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`, `CHANGELOG.md`

**Interfaces:**
- Consumes: npm scripts `check`, `build`, `smoke`.

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: ci
on:
  push: { branches: [main] }
  pull_request:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages-${{ github.ref }}, cancel-in-progress: true }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run check
      - run: npm run build
      - run: npm run smoke
      - if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deploy.outputs.page_url }}" }
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Write `README.md`**

````markdown
# Saqara Blueprint

Design system Saqara : un registry [shadcn/ui](https://ui.shadcn.com) (React) et [shadcn-vue](https://www.shadcn-vue.com) (Vue), aux couleurs Saqara.

Vitrine : https://saqara.github.io/blueprint/

## Utiliser Blueprint dans une app

Prérequis : Tailwind v4 et `shadcn init` (React) ou `shadcn-vue init` (Vue) déjà faits.

1. Déclarer le registry dans `components.json` :

   ```jsonc
   // React
   "registries": { "@saqara": "https://saqara.github.io/blueprint/r/react/{name}.json" }
   // Vue
   "registries": { "@saqara": "https://saqara.github.io/blueprint/r/vue/{name}.json" }
   ```

2. Installer le thème, puis les composants :

   ```bash
   npx shadcn@latest add @saqara/saqara-theme @saqara/button        # React
   npx shadcn-vue@latest add @saqara/saqara-theme @saqara/button    # Vue
   ```

Le code est copié dans l'app : il lui appartient. Pour récupérer une mise à jour, relancer `add` avec `--overwrite` et relire le diff.

## Développer

```bash
npm i
npm run dev            # vitrine sur http://localhost:5173/blueprint/react.html
npm run vendor -- card # importe un composant officiel (React + Vue) dans registry/
npm run check          # parité, tests, types
npm run build          # registry JSON + vitrine dans dist/
npm run smoke          # installe tout dans des apps jetables (après build)
```

- Les couleurs se changent dans `tokens/theme.json`, jamais dans `src/theme.css` (généré).
- Chaque composant doit exister en React **et** en Vue, avec une démo dans `src/react/demos/` et `src/vue/demos/`.
- Un composant personnalisé ne se réimporte qu'avec `--force`, en connaissance de cause.
````

- [ ] **Step 3: Write `CHANGELOG.md`**

```markdown
# Changelog

Une ligne par changement visible par les apps consommatrices, la plus récente en haut.

- 2026-09-25 — Premier registry : thème `saqara-theme` et `button`.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: add checks, smoke test and GitHub Pages deploy"
```

- [ ] **Step 5: Create the GitHub repo and enable Pages — ⚠ ask your human partner first**

This publishes the repo publicly under the `saqara` org. Only after an explicit yes:

```bash
gh repo create saqara/blueprint --public --source . --push
gh api -X POST repos/saqara/blueprint/pages -f build_type=workflow
gh run watch "$(gh run list -R saqara/blueprint -L 1 --json databaseId -q '.[0].databaseId')" -R saqara/blueprint
```

Expected: the `ci` run succeeds; `curl -s https://saqara.github.io/blueprint/r/react/button.json | head -c 100` returns JSON.

---

### Task 7: Lot 1 — form components

**Files:**
- Generated: `registry/{react,vue}/ui/{input,textarea,label,separator,field,checkbox,switch,radio-group,select}*`, manifest items
- Create: `src/react/demos/{input,textarea,label,separator,field,checkbox,switch,radio-group,select}.tsx`, `src/vue/demos/{same}.vue`

`separator` is vendored here because `field` depends on it.

- [ ] **Step 1: Vendor**

Run: `npm run vendor -- input textarea label separator field checkbox switch radio-group select`
Expected: 9 lines per framework; run the printed `npm i ...` line if any.

- [ ] **Step 2: Write the React demos**

`src/react/demos/input.tsx`:
```tsx
import { Input } from "@/registry/react/ui/input"

export default function InputDemo() {
  return (
    <div className="grid max-w-sm gap-2">
      <Input placeholder="Raison sociale" />
      <Input placeholder="SIREN" aria-invalid />
      <Input placeholder="Désactivé" disabled />
    </div>
  )
}
```

`src/react/demos/textarea.tsx`:
```tsx
import { Textarea } from "@/registry/react/ui/textarea"

export default function TextareaDemo() {
  return <Textarea className="max-w-sm" placeholder="Motif du refus" />
}
```

`src/react/demos/label.tsx`:
```tsx
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"

export default function LabelDemo() {
  return (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="label-email">E-mail</Label>
      <Input id="label-email" type="email" />
    </div>
  )
}
```

`src/react/demos/separator.tsx`:
```tsx
import { Separator } from "@/registry/react/ui/separator"

export default function SeparatorDemo() {
  return (
    <div className="max-w-sm space-y-2 text-sm">
      <p>Informations légales</p>
      <Separator />
      <p>Données financières</p>
    </div>
  )
}
```

`src/react/demos/field.tsx`:
```tsx
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/react/ui/field"
import { Input } from "@/registry/react/ui/input"

export default function FieldDemo() {
  return (
    <Field className="max-w-sm" data-invalid>
      <FieldLabel htmlFor="field-siren">SIREN</FieldLabel>
      <Input id="field-siren" aria-invalid defaultValue="12345" />
      <FieldDescription>9 chiffres, sans espace.</FieldDescription>
      <FieldError>Le SIREN doit contenir 9 chiffres.</FieldError>
    </Field>
  )
}
```

`src/react/demos/checkbox.tsx`:
```tsx
import { Checkbox } from "@/registry/react/ui/checkbox"
import { Label } from "@/registry/react/ui/label"

export default function CheckboxDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-cgu" defaultChecked />
      <Label htmlFor="checkbox-cgu">J'accepte les conditions</Label>
    </div>
  )
}
```

`src/react/demos/switch.tsx`:
```tsx
import { Label } from "@/registry/react/ui/label"
import { Switch } from "@/registry/react/ui/switch"

export default function SwitchDemo() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="switch-cron" defaultChecked />
      <Label htmlFor="switch-cron">Synchronisation automatique</Label>
    </div>
  )
}
```

`src/react/demos/radio-group.tsx`:
```tsx
import { Label } from "@/registry/react/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/react/ui/radio-group"

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="conforme">
      {["conforme", "partiel", "non conforme"].map((v) => (
        <div key={v} className="flex items-center gap-2">
          <RadioGroupItem value={v} id={`radio-${v}`} />
          <Label htmlFor={`radio-${v}`}>{v}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}
```

`src/react/demos/select.tsx`:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/react/ui/select"

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-60"><SelectValue placeholder="Département" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="69">69 — Rhône</SelectItem>
        <SelectItem value="75">75 — Paris</SelectItem>
        <SelectItem value="13">13 — Bouches-du-Rhône</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 3: Write the Vue demos**

`src/vue/demos/input.vue`:
```vue
<script setup lang="ts">
import { Input } from "@/registry/vue/ui/input"
</script>

<template>
  <div class="grid max-w-sm gap-2">
    <Input placeholder="Raison sociale" />
    <Input placeholder="SIREN" aria-invalid="true" />
    <Input placeholder="Désactivé" disabled />
  </div>
</template>
```

`src/vue/demos/textarea.vue`:
```vue
<script setup lang="ts">
import { Textarea } from "@/registry/vue/ui/textarea"
</script>

<template>
  <Textarea class="max-w-sm" placeholder="Motif du refus" />
</template>
```

`src/vue/demos/label.vue`:
```vue
<script setup lang="ts">
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
</script>

<template>
  <div class="grid max-w-sm gap-2">
    <Label for="label-email">E-mail</Label>
    <Input id="label-email" type="email" />
  </div>
</template>
```

`src/vue/demos/separator.vue`:
```vue
<script setup lang="ts">
import { Separator } from "@/registry/vue/ui/separator"
</script>

<template>
  <div class="max-w-sm space-y-2 text-sm">
    <p>Informations légales</p>
    <Separator />
    <p>Données financières</p>
  </div>
</template>
```

`src/vue/demos/field.vue`:
```vue
<script setup lang="ts">
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/vue/ui/field"
import { Input } from "@/registry/vue/ui/input"
</script>

<template>
  <Field class="max-w-sm" data-invalid="true">
    <FieldLabel for="field-siren">SIREN</FieldLabel>
    <Input id="field-siren" aria-invalid="true" default-value="12345" />
    <FieldDescription>9 chiffres, sans espace.</FieldDescription>
    <FieldError>Le SIREN doit contenir 9 chiffres.</FieldError>
  </Field>
</template>
```

`src/vue/demos/checkbox.vue`:
```vue
<script setup lang="ts">
import { Checkbox } from "@/registry/vue/ui/checkbox"
import { Label } from "@/registry/vue/ui/label"
</script>

<template>
  <div class="flex items-center gap-2">
    <Checkbox id="checkbox-cgu" :default-value="true" />
    <Label for="checkbox-cgu">J'accepte les conditions</Label>
  </div>
</template>
```

`src/vue/demos/switch.vue`:
```vue
<script setup lang="ts">
import { Label } from "@/registry/vue/ui/label"
import { Switch } from "@/registry/vue/ui/switch"
</script>

<template>
  <div class="flex items-center gap-2">
    <Switch id="switch-cron" :default-value="true" />
    <Label for="switch-cron">Synchronisation automatique</Label>
  </div>
</template>
```

`src/vue/demos/radio-group.vue`:
```vue
<script setup lang="ts">
import { Label } from "@/registry/vue/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/vue/ui/radio-group"
</script>

<template>
  <RadioGroup default-value="conforme">
    <div v-for="v in ['conforme', 'partiel', 'non conforme']" :key="v" class="flex items-center gap-2">
      <RadioGroupItem :id="`radio-${v}`" :value="v" />
      <Label :for="`radio-${v}`">{{ v }}</Label>
    </div>
  </RadioGroup>
</template>
```

`src/vue/demos/select.vue`:
```vue
<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/vue/ui/select"
</script>

<template>
  <Select>
    <SelectTrigger class="w-60"><SelectValue placeholder="Département" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="69">69 — Rhône</SelectItem>
      <SelectItem value="75">75 — Paris</SelectItem>
      <SelectItem value="13">13 — Bouches-du-Rhône</SelectItem>
    </SelectContent>
  </Select>
</template>
```

- [ ] **Step 4: Verify**

Run: `npm run check && npm run build && npm run smoke`
Expected: `parity ok`, all PASS, `smoke ok`.

If tsc / vue-tsc reports an unknown export or prop (upstream names can drift), open the vendored file under `registry/<fw>/ui/<name>` and use the name it actually exports — do not edit the vendored component to match the demo.

- [ ] **Step 5: Visual check**

Run: `npx vite preview --port 4173` after the build; open `/blueprint/react.html` and `/blueprint/vue.html`, toggle dark mode.
Expected: every section renders in both modes; focus ring is red (`--ring`); the invalid SIREN field shows the destructive color.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add form components (React + Vue)"
```

---

### Task 8: Lot 1 — display components

**Files:**
- Generated: `registry/{react,vue}/ui/{card,skeleton,spinner,tooltip}*`, manifest items
- Create: `src/react/demos/{card,skeleton,spinner,tooltip}.tsx`, `src/vue/demos/{same}.vue`

- [ ] **Step 1: Vendor**

Run: `npm run vendor -- card skeleton spinner tooltip`
Expected: 4 lines per framework; run the printed `npm i ...` line if any.

- [ ] **Step 2: Write the React demos**

`src/react/demos/card.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/react/ui/card"

export default function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Bâti Sud SAS</CardTitle>
        <CardDescription>SIREN 552 100 554 — Lyon</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">Note qualité : 16/20</CardContent>
      <CardFooter><Button size="sm">Voir la fiche</Button></CardFooter>
    </Card>
  )
}
```

`src/react/demos/skeleton.tsx`:
```tsx
import { Skeleton } from "@/registry/react/ui/skeleton"

export default function SkeletonDemo() {
  return (
    <div className="max-w-sm space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

`src/react/demos/spinner.tsx`:
```tsx
import { Spinner } from "@/registry/react/ui/spinner"

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Spinner /> Chargement des entreprises…
    </div>
  )
}
```

`src/react/demos/tooltip.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/react/ui/tooltip"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild><Button variant="outline">Score RSE</Button></TooltipTrigger>
      <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
    </Tooltip>
  )
}
```

- [ ] **Step 3: Write the Vue demos**

`src/vue/demos/card.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/vue/ui/card"
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle>Bâti Sud SAS</CardTitle>
      <CardDescription>SIREN 552 100 554 — Lyon</CardDescription>
    </CardHeader>
    <CardContent class="text-sm">Note qualité : 16/20</CardContent>
    <CardFooter><Button size="sm">Voir la fiche</Button></CardFooter>
  </Card>
</template>
```

`src/vue/demos/skeleton.vue`:
```vue
<script setup lang="ts">
import { Skeleton } from "@/registry/vue/ui/skeleton"
</script>

<template>
  <div class="max-w-sm space-y-2">
    <Skeleton class="h-4 w-3/4" />
    <Skeleton class="h-4 w-1/2" />
  </div>
</template>
```

`src/vue/demos/spinner.vue`:
```vue
<script setup lang="ts">
import { Spinner } from "@/registry/vue/ui/spinner"
</script>

<template>
  <div class="flex items-center gap-2 text-sm">
    <Spinner /> Chargement des entreprises…
  </div>
</template>
```

`src/vue/demos/tooltip.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/vue/ui/tooltip"
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child><Button variant="outline">Score RSE</Button></TooltipTrigger>
      <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
```

- [ ] **Step 4: Verify**

Run: `npm run check && npm run build && npm run smoke`
Expected: `parity ok`, all PASS, `smoke ok`. Same export-name rule as Task 7 Step 4.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add display components (React + Vue)"
```

---

### Task 9: Lot 1 — Badge and Alert with Saqara variants

**Files:**
- Generated then modified: `registry/react/ui/badge.tsx`, `registry/react/ui/alert.tsx`, `registry/vue/ui/badge/index.ts`, `registry/vue/ui/alert/index.ts`
- Create: `tests/variants.test.ts`, `src/react/demos/{badge,alert}.tsx`, `src/vue/demos/{badge,alert}.vue`

**Interfaces:**
- Produces: `badgeVariants({ variant: "success" | "warning" | "info" | "identity" })` and `alertVariants({ variant: "success" | "warning" | "info" })` in both frameworks, on top of the upstream variants.

- [ ] **Step 1: Vendor**

Run: `npm run vendor -- badge alert`
Expected: 2 lines per framework.

- [ ] **Step 2: Write the failing test** — `tests/variants.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { badgeVariants as reactBadge } from "../registry/react/ui/badge"
import { alertVariants as reactAlert } from "../registry/react/ui/alert"
import { badgeVariants as vueBadge } from "../registry/vue/ui/badge"
import { alertVariants as vueAlert } from "../registry/vue/ui/alert"

const fws = { react: { badge: reactBadge, alert: reactAlert }, vue: { badge: vueBadge, alert: vueAlert } }

describe.each(Object.entries(fws))("%s", (_, { badge, alert }) => {
  it.each(["success", "warning", "info", "identity"] as const)("badge %s uses its token", (v) => {
    expect(badge({ variant: v })).toContain(`bg-${v}`)
    expect(badge({ variant: v })).toContain(`text-${v}-foreground`)
  })
  it.each(["success", "warning", "info"] as const)("alert %s uses its token", (v) => {
    expect(alert({ variant: v })).toContain(`border-${v}`)
    expect(alert({ variant: v })).toContain(`[&>svg]:text-${v}`)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/variants.test.ts`
Expected: FAIL — `alertVariants` is not exported by `registry/react/ui/alert` (upstream keeps it private), and the new variants don't exist yet.

- [ ] **Step 4: Add the variants**

In **both** `registry/react/ui/badge.tsx` and `registry/vue/ui/badge/index.ts`, inside `variants: { variant: { … } }` of the `cva(...)` call, after the last upstream variant, add:

```ts
        success: "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning: "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info: "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
        identity: "border-transparent bg-identity text-identity-foreground [a&]:hover:bg-identity/90",
```

In **both** `registry/react/ui/alert.tsx` and `registry/vue/ui/alert/index.ts`, same place in the alert `cva(...)`:

```ts
        success: "border-success/50 bg-success/10 text-foreground [&>svg]:text-success",
        warning: "border-warning/50 bg-warning/10 text-foreground [&>svg]:text-warning",
        info: "border-info/50 bg-info/10 text-foreground [&>svg]:text-info",
```

(Text stays `text-foreground`: `success`/`warning` as text on white are below 4.5:1; only the icon takes the color.)

In `registry/react/ui/alert.tsx`, add `alertVariants` to the final export line, e.g. `export { Alert, AlertTitle, AlertDescription, alertVariants }` (keep whatever upstream already exports).

Add one line to `CHANGELOG.md` under the heading:
```
- 2026-09-25 — `badge` : variantes `success`, `warning`, `info`, `identity`. `alert` : variantes `success`, `warning`, `info`.
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/variants.test.ts`
Expected: PASS (14 tests).

- [ ] **Step 6: Write the demos**

`src/react/demos/badge.tsx`:
```tsx
import { Badge } from "@/registry/react/ui/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Défaut</Badge>
      <Badge variant="secondary">Brouillon</Badge>
      <Badge variant="outline">Admin</Badge>
      <Badge variant="success">Qualifié</Badge>
      <Badge variant="warning">À compléter</Badge>
      <Badge variant="info">En cours</Badge>
      <Badge variant="identity">Saqara</Badge>
      <Badge variant="destructive">Refusé</Badge>
    </div>
  )
}
```

`src/react/demos/alert.tsx`:
```tsx
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/registry/react/ui/alert"

export default function AlertDemo() {
  return (
    <div className="grid max-w-lg gap-3">
      <Alert variant="info"><Info /><AlertTitle>Import en cours</AlertTitle><AlertDescription>1 250 lignes sur 3 000.</AlertDescription></Alert>
      <Alert variant="success"><CircleCheck /><AlertTitle>Import terminé</AlertTitle><AlertDescription>3 000 entreprises mises à jour.</AlertDescription></Alert>
      <Alert variant="warning"><TriangleAlert /><AlertTitle>Données incomplètes</AlertTitle><AlertDescription>12 SIRET sans adresse.</AlertDescription></Alert>
      <Alert variant="destructive"><CircleAlert /><AlertTitle>Échec de l'import</AlertTitle><AlertDescription>Colonne « SIREN » introuvable.</AlertDescription></Alert>
    </div>
  )
}
```

`src/vue/demos/badge.vue`:
```vue
<script setup lang="ts">
import { Badge } from "@/registry/vue/ui/badge"
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Badge>Défaut</Badge>
    <Badge variant="secondary">Brouillon</Badge>
    <Badge variant="outline">Admin</Badge>
    <Badge variant="success">Qualifié</Badge>
    <Badge variant="warning">À compléter</Badge>
    <Badge variant="info">En cours</Badge>
    <Badge variant="identity">Saqara</Badge>
    <Badge variant="destructive">Refusé</Badge>
  </div>
</template>
```

`src/vue/demos/alert.vue`:
```vue
<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "@lucide/vue"
import { Alert, AlertDescription, AlertTitle } from "@/registry/vue/ui/alert"
</script>

<template>
  <div class="grid max-w-lg gap-3">
    <Alert variant="info"><Info /><AlertTitle>Import en cours</AlertTitle><AlertDescription>1 250 lignes sur 3 000.</AlertDescription></Alert>
    <Alert variant="success"><CircleCheck /><AlertTitle>Import terminé</AlertTitle><AlertDescription>3 000 entreprises mises à jour.</AlertDescription></Alert>
    <Alert variant="warning"><TriangleAlert /><AlertTitle>Données incomplètes</AlertTitle><AlertDescription>12 SIRET sans adresse.</AlertDescription></Alert>
    <Alert variant="destructive"><CircleAlert /><AlertTitle>Échec de l'import</AlertTitle><AlertDescription>Colonne « SIREN » introuvable.</AlertDescription></Alert>
  </div>
</template>
```

- [ ] **Step 7: Verify everything**

Run: `npm run check && npm run build && npm run smoke`
Expected: `parity ok`, all PASS, `smoke ok`.

Run: `npm run vendor -- badge`
Expected: refuses with `… already exists (customized?) …` — the Saqara variants are protected.

- [ ] **Step 8: Visual check**

`npx vite preview --port 4173`, open both showcase pages, toggle dark mode.
Expected: 8 badges and 4 alerts render identically in React and Vue; alert text stays readable in both modes.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Badge and Alert with Saqara variants (React + Vue)"
```

---

## Not in this plan

- Lots 2 (overlays & navigation) and 3 (Saqara composites): next plan, once this one is merged — Lot 3 has real logic (MultiSelect, Stepper React, DataTable) that deserves its own design pass.
