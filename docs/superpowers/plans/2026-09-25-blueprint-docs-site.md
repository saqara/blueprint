# Blueprint — Documentation site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two long showcase pages with a documentation site built with Blueprint (spec §9): routed pages per component/block, React | Vue switch, light/dark/auto theme, Preview/Code tabs with real sources, tokens page, four example screens in both frameworks.

**Architecture:** One Vite entry (`index.html` → `site/main.tsx`). The site shell is React, built from Blueprint's sidebar, tabs, toggle-group and dropdown-menu. Vue demos/examples are mounted in a `VueIsland`. Pure logic (route parsing, theme resolution, framework choice, catalog coverage) lives in `site/lib/*.ts` and is unit-tested; the catalog reads titles/descriptions from the registry manifests.

**Tech Stack:** as before + `shiki` (lazy-loaded code highlighting).

**Spec:** `docs/superpowers/specs/2026-09-25-blueprint-design.md` §9

## Global Constraints

- Work on `main`, push after each task, CI green.
- All site copy in French; code in English.
- Hash routes: `#/`, `#/demarrer/<page>`, `#/composants/<nom>`, `#/blocs/<nom>`, `#/exemples/<nom>`; unknown → « Introuvable ».
- Framework: `?fw=react|vue` in the URL wins, else localStorage `blueprint-framework`, else React.
- Theme: localStorage `blueprint-theme` = `light | dark | auto`, default `auto`; applied before first paint by an inline script.
- Every `localStorage` access is wrapped in try/catch (private windows).
- `react.html` / `vue.html` keep working as redirects.
- Brand: the Blueprint logo `public/logo.svg` (added by the user, commit 328e826) is the site mark — favicon on every page, sidebar header, home hero; `public/banner.png` is the `og:image`. Referenced as `/logo.svg` in HTML (Vite adds the base) and `${import.meta.env.BASE_URL}logo.svg` in code.
- Example data is fictitious.
- **Plan style note:** Tasks 1–5 carry full code. Example screens (Tasks 6–8) are specified by content, components and acceptance tests; their code is written during execution (4 screens × 2 frameworks) — the tests and the checklist are binding.

## Review Focus

1. **Theme flash / auto** — first paint already dark when the OS is dark and choice is `auto`; switching the OS while on `auto` updates the page. Task 1 test for `resolveTheme`, Task 3 manual check.
2. **Framework switch** — switching React→Vue on a component page swaps both Aperçu and Code, updates `?fw=`, survives reload; Vue islands unmount (no duplicated toasts / listeners). Task 3 manual check.
3. **Catalog coverage** — every `registry:ui` item (except theme and hooks) is in exactly one category, every block listed, every item has a description. Task 2 test.
4. **Re-vendoring keeps descriptions** — `npm run vendor -- button --force` must not wipe the French description. Task 2 test.
5. **Example parity** — every example exists in both frameworks and renders under SSR. Task 5 test.

---

### Task 1: Pure site logic (route, theme, framework)

**Files:** Create `site/lib/route.ts`, `site/lib/theme.ts`, `site/lib/framework.ts`, `site/lib/storage.ts`, `tests/site.test.ts`; Modify `tsconfig.react.json` (include `site`, `resolveJsonModule`).

- [ ] **Step 1: Failing test** — `tests/site.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { parseRoute, toHash } from "../site/lib/route"
import { readThemeChoice, resolveTheme } from "../site/lib/theme"
import { readFramework } from "../site/lib/framework"

describe("parseRoute", () => {
  it.each([
    ["", { section: "home" }],
    ["#/", { section: "home" }],
    ["#/composants/button", { section: "composants", slug: "button" }],
    ["#/exemples/annuaire/", { section: "exemples", slug: "annuaire" }],
    ["#/blocs/login", { section: "blocs", slug: "login" }],
    ["#/demarrer/installation", { section: "demarrer", slug: "installation" }],
    ["#/composants", { section: "not-found" }],
    ["#/inconnu/x", { section: "not-found" }],
    ["#/composants/button/extra", { section: "not-found" }],
  ])("%s", (hash, route) => expect(parseRoute(hash)).toEqual(route))
  it("round-trips through toHash", () => {
    expect(toHash({ section: "home" })).toBe("#/")
    expect(toHash(parseRoute("#/composants/data-table"))).toBe("#/composants/data-table")
  })
})

describe("theme", () => {
  it("resolves auto from the OS preference", () => {
    expect([resolveTheme("auto", true), resolveTheme("auto", false), resolveTheme("light", true), resolveTheme("dark", false)]).toEqual(["dark", "light", "light", "dark"])
  })
  it("defaults to auto for missing or unknown stored values", () => {
    expect([readThemeChoice(null), readThemeChoice("bogus"), readThemeChoice("dark")]).toEqual(["auto", "auto", "dark"])
  })
})

describe("framework", () => {
  it("prefers the URL, then storage, then React", () => {
    expect(readFramework("?fw=vue", "react")).toBe("vue")
    expect(readFramework("?fw=angular", "vue")).toBe("vue")
    expect(readFramework("", null)).toBe("react")
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/site.test.ts` → FAIL (modules missing).

- [ ] **Step 3: Implement**

`site/lib/route.ts`:
```ts
export type Section = "home" | "demarrer" | "composants" | "blocs" | "exemples" | "not-found"
export type Route = { section: Section; slug?: string }

const SECTIONS = new Set<Section>(["demarrer", "composants", "blocs", "exemples"])

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").split("?")[0].replace(/\/+$/, "")
  if (!path) return { section: "home" }
  const [section, slug, ...rest] = path.split("/")
  if (!SECTIONS.has(section as Section) || !slug || rest.length) return { section: "not-found" }
  return { section: section as Section, slug: decodeURIComponent(slug) }
}

export const toHash = (route: Route) => (route.section === "home" ? "#/" : `#/${route.section}/${route.slug}`)
```

`site/lib/theme.ts`:
```ts
export type ThemeChoice = "light" | "dark" | "auto"
export const THEME_KEY = "blueprint-theme"

export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): "light" | "dark" {
  return choice === "auto" ? (prefersDark ? "dark" : "light") : choice
}

export function readThemeChoice(stored: string | null): ThemeChoice {
  return stored === "light" || stored === "dark" ? stored : "auto"
}
```

`site/lib/framework.ts`:
```ts
export type Fw = "react" | "vue"
export const FW_KEY = "blueprint-framework"

export function readFramework(search: string, stored: string | null): Fw {
  const fromUrl = new URLSearchParams(search).get("fw")
  if (fromUrl === "react" || fromUrl === "vue") return fromUrl
  return stored === "vue" ? "vue" : "react"
}
```

`site/lib/storage.ts`:
```ts
// localStorage can throw (private windows, blocked storage): never let it break the site.
export function safeGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}
```

`tsconfig.react.json`: add `"resolveJsonModule": true` to `compilerOptions` and `"site"` to `include`.

- [ ] **Step 4:** `npx vitest run tests/site.test.ts` → PASS (13 tests). `npm run check` → green.

- [ ] **Step 5: Commit & push** — `feat(site): route, theme and framework logic`.

---

### Task 2: Catalog — descriptions, categories, coverage

**Files:** Create `site/catalog.ts`, `scripts/describe.ts`; Modify `scripts/lib/manifest.ts`, `scripts/vendor.ts`, `tests/theme.test.ts` (upsert), `tests/site.test.ts`, both manifests.

**Interfaces:** `keepDescription(previous: Item | undefined, next: Item): Item`; catalog exports `CATEGORIES: { id: string; label: string; items: string[] }[]`, `BLOCKS: string[]`, `EXAMPLES: { slug: string; title: string; description: string }[]`, `SAQARA_MADE: Set<string>`, `itemInfo(name): { title: string; description: string; type: string } | undefined`, `START_PAGES: { slug: string; title: string }[]`.

- [ ] **Step 1: Failing tests** — append to `tests/theme.test.ts` (imports `keepDescription` from `../scripts/lib/manifest.ts`):

```ts
describe("keepDescription", () => {
  it("keeps a curated description when re-vendoring an item that has none", () => {
    const prev = { name: "button", type: "registry:ui", description: "Bouton." }
    expect(keepDescription(prev, { name: "button", type: "registry:ui" }).description).toBe("Bouton.")
    expect(keepDescription(prev, { name: "button", type: "registry:ui", description: "Nouveau." }).description).toBe("Nouveau.")
    expect(keepDescription(undefined, { name: "x", type: "registry:ui" })).toEqual({ name: "x", type: "registry:ui" })
  })
})
```

Append to `tests/site.test.ts`:

```ts
import reactManifest from "../registry.react.json"
import vueManifest from "../registry.vue.json"
import { BLOCKS, CATEGORIES, itemInfo } from "../site/catalog"

describe("catalog", () => {
  const ui = reactManifest.items.filter((i) => i.type === "registry:ui").map((i) => i.name)
  const listed = CATEGORIES.flatMap((c) => c.items)
  it("lists every UI item in exactly one category", () => {
    expect([...listed].sort()).toEqual([...ui].sort())
    expect(new Set(listed).size).toBe(listed.length)
  })
  it("lists every block", () => {
    expect([...BLOCKS].sort()).toEqual(reactManifest.items.filter((i) => i.type === "registry:block").map((i) => i.name).sort())
  })
  it("gives every UI item and block a description in both manifests", () => {
    for (const m of [reactManifest, vueManifest]) {
      const missing = m.items.filter((i) => ["registry:ui", "registry:block"].includes(i.type) && !("description" in i && i.description)).map((i) => i.name)
      expect(missing).toEqual([])
    }
  })
  it("reads titles from the manifest", () => {
    expect(itemInfo("data-table")?.title).toBe("Data Table")
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/theme.test.ts tests/site.test.ts` → FAIL.

- [ ] **Step 3: `keepDescription` + vendor** — in `scripts/lib/manifest.ts`:

```ts
// Curated descriptions (site + consumers) survive a re-vendor that brings none.
export function keepDescription(previous: Item | undefined, next: Item): Item {
  return previous?.description && !next.description ? { ...next, description: previous.description } : next
}
```

In `scripts/vendor.ts`, replace `manifest = upsertItem(manifest, item)` by
`manifest = upsertItem(manifest, keepDescription(manifest.items.find((i) => i.name === item.name), item))` (import `keepDescription`).

- [ ] **Step 4: Descriptions** — `scripts/describe.ts` writes a French description into both manifests for items that lack one (Saqara items already have theirs):

```ts
import { readManifest, writeManifest } from "./lib/manifest.ts"

const DESCRIPTIONS: Record<string, string> = {
  accordion: "Sections repliables empilées, une ou plusieurs ouvertes.",
  alert: "Message contextuel : information, succès, avertissement, erreur.",
  "alert-dialog": "Fenêtre de confirmation pour les actions importantes ou irréversibles.",
  avatar: "Image ou initiales d'une personne.",
  badge: "Étiquette courte : statut, note, rôle.",
  breadcrumb: "Fil d'Ariane indiquant la position dans l'app.",
  button: "Bouton d'action, en plusieurs variantes et tailles.",
  card: "Conteneur de contenu avec en-tête, corps et pied.",
  checkbox: "Case à cocher.",
  collapsible: "Zone dépliable simple.",
  command: "Liste filtrable au clavier (recherche, palette de commandes).",
  dialog: "Fenêtre modale pour un formulaire ou un contenu.",
  "dropdown-menu": "Menu d'actions déroulant.",
  empty: "État vide avec icône, message et action.",
  field: "Champ de formulaire : libellé, aide et message d'erreur.",
  "hover-card": "Aperçu d'un contenu au survol.",
  input: "Champ de saisie texte.",
  label: "Libellé associé à un champ.",
  pagination: "Navigation entre les pages d'une liste.",
  popover: "Contenu flottant ancré à un déclencheur.",
  progress: "Barre de progression.",
  "radio-group": "Choix unique parmi plusieurs options.",
  "scroll-area": "Zone de défilement aux barres stylées.",
  select: "Liste déroulante à choix unique.",
  separator: "Séparateur horizontal ou vertical.",
  sheet: "Panneau latéral glissant.",
  sidebar: "Barre latérale de navigation repliable.",
  skeleton: "Espace réservé pendant le chargement.",
  slider: "Curseur de valeur ou d'intervalle.",
  sonner: "Notifications (toasts) aux couleurs Saqara.",
  spinner: "Indicateur de chargement.",
  stepper: "Étapes numérotées d'un parcours.",
  switch: "Interrupteur marche / arrêt.",
  table: "Tableau de données simple.",
  tabs: "Onglets pour basculer entre des vues.",
  textarea: "Champ de saisie multiligne.",
  toggle: "Bouton à deux états.",
  "toggle-group": "Groupe de boutons à bascule (choix unique ou multiple).",
  tooltip: "Info-bulle au survol ou au focus.",
}

for (const path of ["registry.react.json", "registry.vue.json"]) {
  const m = readManifest(path)
  m.items = m.items.map((i) => (!i.description && DESCRIPTIONS[i.name] ? { ...i, description: DESCRIPTIONS[i.name] } : i))
  writeManifest(path, m)
}
console.log("descriptions written")
```

Run `node scripts/describe.ts`. (One-off; keep the script for future vendored items.)

- [ ] **Step 5: Catalog** — `site/catalog.ts`:

```ts
import manifest from "../registry.react.json"

export const START_PAGES = [
  { slug: "introduction", title: "Introduction" },
  { slug: "installation", title: "Installation" },
  { slug: "tokens", title: "Thème et tokens" },
]

export const CATEGORIES = [
  { id: "formulaires", label: "Formulaires", items: ["button", "checkbox", "field", "file-dropzone", "input", "label", "multi-select", "radio-group", "select", "slider", "switch", "textarea", "toggle", "toggle-group"] },
  { id: "affichage", label: "Affichage", items: ["alert", "avatar", "badge", "card", "empty", "progress", "scroll-area", "separator", "skeleton", "spinner", "stat-card", "table"] },
  { id: "overlays", label: "Overlays", items: ["alert-dialog", "dialog", "dropdown-menu", "hover-card", "popover", "sheet", "sonner", "tooltip"] },
  { id: "navigation", label: "Navigation", items: ["accordion", "breadcrumb", "collapsible", "command", "pagination", "sidebar", "stepper", "tabs"] },
  { id: "donnees", label: "Données", items: ["data-table"] },
  { id: "saqara", label: "Saqara", items: ["saqara-logo", "theme-toggle", "user-menu"] },
]

export const BLOCKS = ["app-shell-header", "app-shell-sidebar", "login"]

export const EXAMPLES = [
  { slug: "annuaire", title: "Annuaire fournisseurs", description: "Liste filtrable et triable des entreprises, avec indicateurs." },
  { slug: "fiche-entreprise", title: "Fiche entreprise", description: "Informations, contacts et évaluations d'une entreprise." },
  { slug: "inscription", title: "Inscription fournisseur", description: "Parcours en trois étapes avec validation." },
  { slug: "connexion", title: "Connexion", description: "Page de connexion : mot de passe, lien magique, SSO." },
]

// Written for Blueprint (no upstream shadcn page to link to).
export const SAQARA_MADE = new Set(["data-table", "file-dropzone", "multi-select", "saqara-logo", "stat-card", "theme-toggle", "user-menu", ...BLOCKS])

export function itemInfo(name: string) {
  const item = manifest.items.find((i) => i.name === name)
  return item && { title: item.title as string, description: (item as { description?: string }).description ?? "", type: item.type }
}
```

(`stepper` is Saqara-made in React only; it keeps its shadcn-vue link — acceptable.)

- [ ] **Step 6:** tests PASS; `npm run check` green; `npm run registry` (descriptions end up in `public/r/*.json`).

- [ ] **Step 7: Commit & push** — `feat(site): catalog with categories and French descriptions`.

---

### Task 3: Site shell (entry, navigation, header, theme, framework, component pages)

**Files:**
- Create: `site/main.tsx`, `site/App.tsx`, `site/site.css`, `site/hooks.ts`, `site/components/{VueIsland,ThemeMenu,InstallCommand,Preview}.tsx`, `site/pages/{Home,NotFound,ItemPage}.tsx`, `site/demos.ts`
- Modify: `index.html`, `react.html`, `vue.html`, `vite.config.ts`
- Delete: `src/react/main.tsx`, `src/vue/main.ts`, `src/vue/App.vue`, `src/vue/shims.d.ts` → move `shims.d.ts` to `site/shims.d.ts` (Vue demos are still type-checked by `tsconfig.vue.json`: keep `src/vue/shims.d.ts`; add a copy under `site/` for the React program)

**Interfaces:** `useRoute(): Route`, `useFramework(): [Fw, (fw: Fw) => void]`, `useTheme(): { choice, setChoice, resolved }` (in `site/hooks.ts`); `demoFor(kind: "demos" | "examples", fw, name)` → `{ Component, source } | undefined` (in `site/demos.ts`); `Preview({ kind, fw, name, framed? })`.

- [ ] **Step 1: `index.html`** (theme applied before paint):

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Saqara Blueprint</title>
    <link rel="icon" href="/logo.svg" />
    <meta property="og:title" content="Saqara Blueprint" />
    <meta property="og:description" content="Le design system des applications Saqara (React et Vue)." />
    <meta property="og:image" content="https://saqara.github.io/blueprint/banner.png" />
    <script>
      try {
        var c = localStorage.getItem("blueprint-theme")
        if (c === "dark" || (c !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark")
      } catch (e) {}
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/site/main.tsx"></script>
  </body>
</html>
```

`react.html` / `vue.html` (old links):
```html
<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><meta http-equiv="refresh" content="0; url=./?fw=react#/" /><title>Saqara Blueprint</title><link rel="icon" href="/logo.svg" /></head>
<body><a href="./?fw=react#/">Saqara Blueprint</a></body></html>
```
(`vue.html`: same with `fw=vue`.)

- [ ] **Step 2: `site/demos.ts`**

```ts
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
```

Create empty `src/examples/react/.gitkeep` and `src/examples/vue/.gitkeep` so the globs resolve.

- [ ] **Step 3: `site/hooks.ts`**

```ts
import { useEffect, useState, useSyncExternalStore } from "react"
import { FW_KEY, readFramework, type Fw } from "./lib/framework"
import { parseRoute } from "./lib/route"
import { safeGet, safeSet } from "./lib/storage"
import { readThemeChoice, resolveTheme, THEME_KEY, type ThemeChoice } from "./lib/theme"

const subscribeHash = (cb: () => void) => { addEventListener("hashchange", cb); return () => removeEventListener("hashchange", cb) }

export function useRoute() {
  return parseRoute(useSyncExternalStore(subscribeHash, () => location.hash, () => ""))
}

export function useFramework(): [Fw, (fw: Fw) => void] {
  const [fw, setState] = useState<Fw>(() => readFramework(location.search, safeGet(FW_KEY)))
  const setFw = (next: Fw) => {
    setState(next)
    safeSet(FW_KEY, next)
    const url = new URL(location.href)
    url.searchParams.set("fw", next)
    history.replaceState(null, "", url)
  }
  return [fw, setFw]
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(() => readThemeChoice(safeGet(THEME_KEY)))
  const [resolved, setResolved] = useState<"light" | "dark">("light")
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const theme = resolveTheme(choice, media.matches)
      document.documentElement.classList.toggle("dark", theme === "dark")
      setResolved(theme)
    }
    apply()
    safeSet(THEME_KEY, choice)
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [choice])
  return { choice, setChoice, resolved }
}
```

- [ ] **Step 4: Components**

`site/components/VueIsland.tsx`:
```tsx
import { useEffect, useRef } from "react"
import { createApp, type Component } from "vue"

// Mounts a Vue component inside the React site; unmounted on change so listeners/toasts never pile up.
export function VueIsland({ component }: { component: Component }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const app = createApp(component)
    app.mount(ref.current!)
    return () => app.unmount()
  }, [component])
  return <div ref={ref} />
}
```

`site/components/ThemeMenu.tsx`:
```tsx
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"
import type { ThemeChoice } from "../lib/theme"

const icons = { light: Sun, dark: Moon, auto: Monitor }

export function ThemeMenu({ value, onChange }: { value: ThemeChoice; onChange: (choice: ThemeChoice) => void }) {
  const Icon = icons[value]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Thème"><Icon /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as ThemeChoice)}>
          <DropdownMenuRadioItem value="light"><Sun />Clair</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon />Sombre</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto"><Monitor />Auto (système)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

`site/components/InstallCommand.tsx`:
```tsx
import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import type { Fw } from "../lib/framework"

export function InstallCommand({ name, fw }: { name: string; fw: Fw }) {
  const command = `npx ${fw === "react" ? "shadcn" : "shadcn-vue"}@latest add @saqara/${name}`
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5 font-mono text-sm">
      <code className="flex-1 truncate">{command}</code>
      <Button variant="ghost" size="icon" className="size-7" aria-label="Copier la commande"
        onClick={async () => { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
```

`site/components/Preview.tsx` (Code tab added in Task 4; for now it shows the raw source in a `<pre>`):
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"
import { demoFor } from "../demos"
import type { Fw } from "../lib/framework"
import { VueIsland } from "./VueIsland"

export function Preview({ kind, fw, name, framed = false }: { kind: "demos" | "examples"; fw: Fw; name: string; framed?: boolean }) {
  const demo = demoFor(kind, fw, name)
  if (!demo) return <p className="text-sm text-muted-foreground">Pas encore de démo pour ce framework.</p>
  const body = demo.fw === "react" ? <demo.Component /> : <VueIsland component={demo.Component} />
  return (
    <Tabs defaultValue="preview">
      <TabsList><TabsTrigger value="preview">Aperçu</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList>
      <TabsContent value="preview">
        {framed
          ? <div className="h-[720px] overflow-auto rounded-lg border [transform:translateZ(0)]">{body}</div>
          : <div className="flex min-h-48 items-center justify-center rounded-lg border p-8">{body}</div>}
      </TabsContent>
      <TabsContent value="code">
        <pre className="max-h-[600px] overflow-auto rounded-lg border p-4 text-sm"><code>{demo.source}</code></pre>
      </TabsContent>
    </Tabs>
  )
}
```

(`key={`${fw}-${name}`}` on `<Preview>` at call sites resets the tab state and remounts islands when switching.)

- [ ] **Step 5: Pages**

`site/pages/ItemPage.tsx`:
```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/registry/react/ui/breadcrumb"
import { Badge } from "@/registry/react/ui/badge"
import { BLOCKS, CATEGORIES, itemInfo, SAQARA_MADE } from "../catalog"
import { InstallCommand } from "../components/InstallCommand"
import { Preview } from "../components/Preview"
import type { Fw } from "../lib/framework"
import { NotFound } from "./NotFound"

export function ItemPage({ kind, name, fw }: { kind: "composants" | "blocs"; name: string; fw: Fw }) {
  const info = itemInfo(name)
  const category = CATEGORIES.find((c) => c.items.includes(name))
  const listed = kind === "blocs" ? BLOCKS.includes(name) : !!category
  if (!info || !listed) return <NotFound />
  const docs = fw === "react" ? `https://ui.shadcn.com/docs/components/${name}` : `https://www.shadcn-vue.com/docs/components/${name}`
  return (
    <article className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#/">Blueprint</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{kind === "blocs" ? "Blocs" : category!.label}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{info.title}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold">{info.title}</h1>
          {SAQARA_MADE.has(name) && <Badge variant="identity">Saqara</Badge>}
        </div>
        <p className="text-muted-foreground">{info.description.replace(/ \(Saqara\)\.?$/, ".")}</p>
        {!SAQARA_MADE.has(name) && <a className="text-sm text-primary underline-offset-4 hover:underline" href={docs} target="_blank" rel="noreferrer">Documentation officielle ({fw === "react" ? "shadcn/ui" : "shadcn-vue"}) ↗</a>}
      </header>
      <InstallCommand name={name} fw={fw} />
      <Preview key={`${fw}-${name}`} kind="demos" fw={fw} name={name} framed={kind === "blocs"} />
    </article>
  )
}
```

`site/pages/NotFound.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/registry/react/ui/empty"

export function NotFound() {
  return (
    <Empty>
      <EmptyHeader><EmptyTitle>Introuvable</EmptyTitle><EmptyDescription>Cette page n'existe pas (ou plus).</EmptyDescription></EmptyHeader>
      <EmptyContent><Button asChild><a href="#/">Retour à l'accueil</a></Button></EmptyContent>
    </Empty>
  )
}
```

`site/pages/Home.tsx`:
```tsx
import { ArrowRight } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/registry/react/ui/card"
import { BLOCKS, CATEGORIES, EXAMPLES } from "../catalog"

export function Home() {
  const count = CATEGORIES.reduce((n, c) => n + c.items.length, 0)
  const cards = [
    { href: "#/demarrer/installation", title: "Installation", text: "Déclarer le registry et installer le thème en deux commandes." },
    { href: `#/composants/button`, title: `${count} composants`, text: "Formulaires, overlays, navigation, données — en React et en Vue." },
    { href: `#/blocs/${BLOCKS[0]}`, title: `${BLOCKS.length} blocs`, text: "Shells d'application et page de connexion prêts à l'emploi." },
    { href: `#/exemples/${EXAMPLES[0].slug}`, title: `${EXAMPLES.length} exemples`, text: "Écrans complets du portail fournisseur." },
  ]
  return (
    <div className="space-y-10">
      <section className="space-y-4 py-6">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Saqara Blueprint" className="size-16 rounded-2xl" />
        <h1 className="max-w-2xl text-4xl font-semibold">Le design system des applications Saqara.</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Des composants shadcn/ui et shadcn-vue aux couleurs Saqara, installés dans votre app par la CLI : le code vous appartient.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">{c.title}<ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" /></CardTitle>
                <CardDescription>{c.text}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </section>
    </div>
  )
}
```

- [ ] **Step 6: `site/App.tsx`**

```tsx
import { useEffect } from "react"
import { Github } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/registry/react/ui/sidebar"
import { Toaster } from "@/registry/react/ui/sonner"
import { ToggleGroup, ToggleGroupItem } from "@/registry/react/ui/toggle-group"
import { BLOCKS, CATEGORIES, EXAMPLES, itemInfo, START_PAGES } from "./catalog"
import { ThemeMenu } from "./components/ThemeMenu"
import { useFramework, useRoute, useTheme } from "./hooks"
import type { Fw } from "./lib/framework"
import { toHash, type Route } from "./lib/route"
import { Page } from "./pages/Page"

type NavGroup = { label: string; items: { label: string; route: Route }[] }

const NAV: NavGroup[] = [
  { label: "Démarrer", items: START_PAGES.map((p) => ({ label: p.title, route: { section: "demarrer", slug: p.slug } })) },
  ...CATEGORIES.map((c) => ({ label: c.label, items: c.items.map((name) => ({ label: itemInfo(name)?.title ?? name, route: { section: "composants" as const, slug: name } })) })),
  { label: "Blocs", items: BLOCKS.map((name) => ({ label: itemInfo(name)?.title ?? name, route: { section: "blocs" as const, slug: name } })) },
  { label: "Exemples", items: EXAMPLES.map((e) => ({ label: e.title, route: { section: "exemples" as const, slug: e.slug } })) },
]

export function App() {
  const route = useRoute()
  const [fw, setFw] = useFramework()
  const theme = useTheme()
  const current = toHash(route)
  useEffect(() => { window.scrollTo(0, 0) }, [current])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <a href="#/" className="flex h-10 items-center gap-2 px-2 font-heading font-semibold">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="size-7 rounded-md" />
            Blueprint
          </a>
        </SidebarHeader>
        <SidebarContent>
          {NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const href = toHash(item.route)
                    return (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton asChild isActive={href === current} size="sm">
                          <a href={href} aria-current={href === current ? "page" : undefined}>{item.label}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <ToggleGroup type="single" variant="outline" size="sm" value={fw} onValueChange={(v) => v && setFw(v as Fw)} aria-label="Framework">
              <ToggleGroupItem value="react">React</ToggleGroupItem>
              <ToggleGroupItem value="vue">Vue</ToggleGroupItem>
            </ToggleGroup>
            <ThemeMenu value={theme.choice} onChange={theme.setChoice} />
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/saqara/blueprint" target="_blank" rel="noreferrer" aria-label="Code source sur GitHub"><Github /></a>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-6 lg:p-10"><Page route={route} fw={fw} /></main>
      </SidebarInset>
      <Toaster theme={theme.resolved} />
    </SidebarProvider>
  )
}
```

(If `lucide-react` 1.x has no `Github` icon, use `Code2` and keep the label.)

`site/pages/Page.tsx` (router switch; `Installation`, `Tokens`, `ExamplePage` arrive in Tasks 4–5 — until then those routes render `NotFound`):
```tsx
import type { Fw } from "../lib/framework"
import type { Route } from "../lib/route"
import { Home } from "./Home"
import { ItemPage } from "./ItemPage"
import { NotFound } from "./NotFound"

export function Page({ route, fw }: { route: Route; fw: Fw }) {
  switch (route.section) {
    case "home": return <Home />
    case "composants": return <ItemPage kind="composants" name={route.slug!} fw={fw} />
    case "blocs": return <ItemPage kind="blocs" name={route.slug!} fw={fw} />
    default: return <NotFound />
  }
}
```

`site/main.tsx`:
```tsx
import "../src/styles.css"
import "./site.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"

createRoot(document.getElementById("app")!).render(<StrictMode><App /></StrictMode>)
```

`site/site.css`:
```css
/* Shiki dual theme: light colors inline, dark via CSS variables. */
.dark .shiki,
.dark .shiki span { color: var(--shiki-dark) !important; background-color: var(--shiki-dark-bg) !important; }
.shiki { padding: 1rem; overflow: auto; }
```

`src/styles.css`: add `@source "../site";` next to `@source "../registry";`.

`vite.config.ts` inputs stay `index`, `react`, `vue` (the latter two are now redirects).

- [ ] **Step 7: Delete the old showcase entries** — `src/react/main.tsx`, `src/vue/main.ts`, `src/vue/App.vue`. Keep `src/vue/shims.d.ts`; copy it to `site/shims.d.ts`.

- [ ] **Step 8: Verify** — `npm run check && npm run build`; `npx vite preview` and in the browser check:
  - `/blueprint/` shows Home with the Blueprint logo; the favicon is the logo; sidebar header shows the logo + « Blueprint »; sidebar groups Démarrer / 6 categories / Blocs / Exemples.
  - `#/composants/button`: title, description, install command (copy works), Aperçu renders; switch to Vue → command becomes `shadcn-vue`, preview is the Vue demo, URL has `?fw=vue`; reload keeps Vue.
  - Theme menu: Clair / Sombre / Auto; reload on Sombre has no light flash; Auto follows the OS.
  - `#/composants/nope` → Introuvable. `/blueprint/vue.html` → redirects to the site in Vue.

- [ ] **Step 9: Commit & push** — `feat(site): documentation shell with framework and theme switches`.

---

### Task 4: Code highlighting, Installation and Tokens pages

**Files:** Create `site/components/CodeBlock.tsx`, `site/pages/{Introduction,Installation,Tokens}.tsx`; Modify `site/components/Preview.tsx`, `site/pages/Page.tsx`, `package.json` (shiki).

- [ ] **Step 1:** `npm i -D shiki`.

- [ ] **Step 2: `site/components/CodeBlock.tsx`**

```tsx
import { useEffect, useState } from "react"

// Shiki is loaded on demand so the first paint stays light. Sources are our own files (trusted HTML).
export function CodeBlock({ code, lang }: { code: string; lang: "tsx" | "vue" | "bash" | "json" | "css" }) {
  const [html, setHtml] = useState<string>()
  useEffect(() => {
    let alive = true
    import("shiki")
      .then(({ codeToHtml }) => codeToHtml(code.trimEnd(), { lang, themes: { light: "github-light", dark: "github-dark" } }))
      .then((out) => { if (alive) setHtml(out) })
    return () => { alive = false }
  }, [code, lang])
  return html
    ? <div className="max-h-[600px] overflow-auto rounded-lg border text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    : <pre className="max-h-[600px] overflow-auto rounded-lg border p-4 text-sm"><code>{code}</code></pre>
}
```

In `Preview.tsx`, replace the `<pre>` in the Code tab with `<CodeBlock code={demo.source} lang={demo.fw === "react" ? "tsx" : "vue"} />`.

- [ ] **Step 3: Pages**

`site/pages/Introduction.tsx`: one short article — what Blueprint is (shadcn/ui + shadcn-vue registry, Saqara tokens, code copied into the app), the rules (React/Vue parity, Tailwind v4, French defaults), links to Installation, Tokens and the GitHub repo. Headings `h1` « Introduction », `h2` « Principes », « Et ensuite ».

`site/pages/Installation.tsx` (uses `CodeBlock` and the current `fw`):
```tsx
import type { Fw } from "../lib/framework"
import { CodeBlock } from "../components/CodeBlock"

export function Installation({ fw }: { fw: Fw }) {
  const cli = fw === "react" ? "shadcn" : "shadcn-vue"
  const registry = `https://saqara.github.io/blueprint/r/${fw}/{name}.json`
  return (
    <article className="space-y-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-muted-foreground">
      <h1 className="text-3xl font-semibold">Installation ({fw === "react" ? "React" : "Vue"})</h1>
      <p>Prérequis : Tailwind CSS v4 et <code>{cli} init</code> déjà exécuté dans l'app.</p>
      <h2>1. Déclarer le registry</h2>
      <p>Dans <code>components.json</code> :</p>
      <CodeBlock lang="json" code={JSON.stringify({ registries: { "@saqara": registry } }, null, 2)} />
      <h2>2. Installer le thème</h2>
      <CodeBlock lang="bash" code={`npx ${cli}@latest add @saqara/saqara-theme`} />
      <h2>3. Ajouter des composants</h2>
      <CodeBlock lang="bash" code={`npx ${cli}@latest add @saqara/button @saqara/data-table`} />
      <h2>Éléments racine</h2>
      <p>{fw === "react" ? "Placer <TooltipProvider> et <Toaster theme={…} /> une fois à la racine de l'app." : "Monter <Toaster /> une fois à la racine de l'app ; la feuille de style de vue-sonner est importée par le composant."}</p>
      <h2>Mettre à jour</h2>
      <p>Le code appartient à l'app : relancer <code>add</code> avec <code>--overwrite</code> et relire le diff.</p>
    </article>
  )
}
```

`site/pages/Tokens.tsx`:
```tsx
import tokens from "../../tokens/theme.json"
import { Badge } from "@/registry/react/ui/badge"
import { contrastRatio } from "../../scripts/lib/contrast.ts"

type Vars = Record<string, string>
const HEX = /^#[0-9A-Fa-f]{6}$/

function Palette({ mode, vars }: { mode: "Clair" | "Sombre"; vars: Vars }) {
  const pairs = Object.keys(vars).filter((k) => vars[`${k}-foreground`])
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{mode}</h2>
      <div className={mode === "Sombre" ? "dark" : ""}>
        <div className="grid gap-2 rounded-lg border bg-background p-4 text-foreground sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map((k) => {
            const ratio = contrastRatio(vars[k], vars[`${k}-foreground`])
            const exception = tokens.contrastExceptions.includes(k)
            return (
              <div key={k} className="flex items-center gap-3 rounded-md border p-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-medium" style={{ background: vars[k], color: vars[`${k}-foreground`] }}>Aa</div>
                <div className="min-w-0 text-xs">
                  <div className="font-mono font-medium">--{k}</div>
                  <div className="text-muted-foreground">{vars[k]} / {vars[`${k}-foreground`]}</div>
                </div>
                <Badge className="ml-auto" variant={ratio >= 4.5 ? "success" : exception ? "warning" : "destructive"}>{ratio.toFixed(2)}:1</Badge>
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Autres valeurs : {Object.entries(vars).filter(([k, v]) => !pairs.includes(k) && !k.endsWith("-foreground") && HEX.test(v)).map(([k, v]) => `--${k} ${v}`).join(" · ")}</p>
    </section>
  )
}

export function Tokens() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Thème et tokens</h1>
        <p className="text-muted-foreground">
          Source unique : <code>tokens/theme.json</code>. Chaque paire fond / texte doit atteindre 4,5:1 (WCAG AA) ; exceptions assumées : {tokens.contrastExceptions.join(", ")} (rouge de marque).
        </p>
      </header>
      <Palette mode="Clair" vars={tokens.light} />
      <Palette mode="Sombre" vars={tokens.dark} />
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Typographie</h2>
        <p className="font-heading text-2xl">Poppins — titres</p>
        <p>Lato — texte courant, tableaux et formulaires.</p>
      </section>
    </article>
  )
}
```

`Page.tsx`: add `case "demarrer"` → `introduction` → `<Introduction />`, `installation` → `<Installation fw={fw} />`, `tokens` → `<Tokens />`, else `<NotFound />`.

- [ ] **Step 4: Verify** — `npm run check && npm run build`; browser: Code tab highlighted in light and dark; Installation switches commands with the framework; Tokens shows both palettes with ratios (primary / identity / sidebar-primary in warning).

- [ ] **Step 5: Commit & push** — `feat(site): code highlighting, installation and tokens pages`.

---

### Task 5: Examples infrastructure + « Connexion »

**Files:** Create `site/pages/ExamplePage.tsx`, `src/examples/react/connexion.tsx`, `src/examples/vue/connexion.vue`; Modify `scripts/lib/parity.ts`, `scripts/check-parity.ts`, `tests/parity.test.ts`, `tests/demos.test.ts`, `site/pages/Page.tsx`.

- [ ] **Step 1: Failing tests**

`tests/parity.test.ts` — add:
```ts
import { exampleErrors } from "../scripts/lib/parity.ts"

describe("exampleErrors", () => {
  it("requires every example in both frameworks", () => {
    expect(exampleErrors(["annuaire", "connexion"], ["connexion"])).toEqual(['example "annuaire" is in react but not in vue'])
    expect(exampleErrors(["connexion"], ["connexion"])).toEqual([])
  })
})
```

`tests/demos.test.ts` — also render examples:
```ts
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
```

- [ ] **Step 2:** tests FAIL (`exampleErrors` missing; example globs empty is fine).

- [ ] **Step 3: Implement** — `scripts/lib/parity.ts`:
```ts
export function exampleErrors(react: string[], vue: string[]): string[] {
  const errors: string[] = []
  for (const [fw, names, other, otherNames] of [["react", react, "vue", vue], ["vue", vue, "react", react]] as const) {
    for (const name of names) if (!otherNames.includes(name)) errors.push(`example "${name}" is in ${fw} but not in ${other}`)
  }
  return errors
}
```
`scripts/check-parity.ts`: list `src/examples/react/*.tsx` and `src/examples/vue/*.vue` basenames with `readdirSync` and concat `exampleErrors(...)` to the errors.

- [ ] **Step 4: `site/pages/ExamplePage.tsx`**
```tsx
import { EXAMPLES } from "../catalog"
import { Preview } from "../components/Preview"
import type { Fw } from "../lib/framework"
import { NotFound } from "./NotFound"

export function ExamplePage({ slug, fw }: { slug: string; fw: Fw }) {
  const example = EXAMPLES.find((e) => e.slug === slug)
  if (!example) return <NotFound />
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{example.title}</h1>
        <p className="text-muted-foreground">{example.description}</p>
      </header>
      <Preview key={`${fw}-${slug}`} kind="examples" fw={fw} name={slug} framed />
    </article>
  )
}
```
`Page.tsx`: `case "exemples": return <ExamplePage slug={route.slug!} fw={fw} />`.

- [ ] **Step 5: « Connexion » example** (both frameworks) — full-height centered page on `bg-muted/40` using the `login` block with `password`, `magicLink`, `sso` (« Se connecter avec SSO »), title « Portail Fournisseur », description « Connectez-vous pour accéder à votre espace. », simulated `status`/`error` like the login demo, plus a footer line « © Saqara — Mentions légales · Confidentialité » (plain text links `href="#/exemples/connexion"`). Files: `src/examples/react/connexion.tsx`, `src/examples/vue/connexion.vue`.

- [ ] **Step 6: Verify** — `npm run check` (parity incl. examples, SSR renders) && `npm run build`; browser `#/exemples/connexion` in React and Vue.

- [ ] **Step 7: Commit & push** — `feat(site): example pages infrastructure and Connexion example`.

---

### Task 6: « Inscription fournisseur » example (React + Vue)

Files: `src/examples/react/inscription.tsx`, `src/examples/vue/inscription.vue`.

Content (binding):
- Inside a centered `Card` (max-w-2xl) titled « Créer votre compte fournisseur ».
- `stepper` with 3 steps: 1 « Entreprise » (SIREN, raison sociale), 2 « Contacts » (nom, e-mail, téléphone du contact principal), 3 « Validation » (récapitulatif).
- Step 1 fields: `field` + `input` SIREN (9 chiffres, error « Le SIREN doit contenir 9 chiffres. » when invalid on « Suivant »), raison sociale (required), `select` catégorie (Gros œuvre, Second œuvre, Bureau d'études, Fournitures), `file-dropzone` logo (PNG/JPEG/WebP/SVG, 2 Mo max, rejects via `sonner` toast).
- Step 2 fields: nom (required), e-mail (`type="email"`, required), téléphone (optional).
- Step 3: read-only summary (`dl`) of all values + `checkbox` « J'accepte les conditions d'utilisation » required to enable « Créer le compte ».
- Footer buttons « Précédent » / « Suivant » (« Créer le compte » on the last step); submitting shows a success `sonner` toast « Compte créé » and resets to step 1.
- Validation is per step (pure function `stepErrors(step, values)` in the file, same messages in both frameworks).

Acceptance: SSR render test (Task 5) passes for both; browser: invalid SIREN blocks « Suivant » with the message; valid path reaches the summary; checkbox gates the final button.

Commit & push — `feat(site): Inscription fournisseur example`.

---

### Task 7: « Fiche entreprise » example (React + Vue)

Files: `src/examples/react/fiche-entreprise.tsx`, `src/examples/vue/fiche-entreprise.vue`.

Content (binding):
- `app-shell-header` wrapping the page (nav: Mes entreprises [active], Évaluations (badge 3), Demandes RSE (badge 1), Organisation; user Camille Martin).
- `breadcrumb` « Mes entreprises › Bâti Sud SAS ».
- Header: `saqara-logo`-free company block — raison sociale « Bâti Sud SAS », SIREN, ville, badges « Qualifié » (success) and « Note 16/20 », `toggle` étoile « Favori » (`aria-pressed`), `dropdown-menu` « Actions » (Exporter la fiche, Demander une mise à jour).
- `stat-card` row: Note qualité 16/20, Note RSE 14/20, Évaluations 12, Agences 3.
- `tabs`: « Informations » (`accordion` : Informations légales, Données financières, Agences — contents as short `dl`s), « Contacts » (`table` of 3 fictitious contacts + « Ajouter un contact » button opening a `dialog` with a small form; saving adds the row and shows a `sonner` toast « Contact ajouté »), « Évaluations » (list of 3 evaluations with date, note badge, evaluator).

Acceptance: SSR renders; browser: adding a contact appends a row and toasts; favourite toggles.

Commit & push — `feat(site): Fiche entreprise example`.

---

### Task 8: « Annuaire fournisseurs » example (React + Vue)

Files: `src/examples/react/annuaire.tsx`, `src/examples/vue/annuaire.vue`.

Content (binding):
- `app-shell-sidebar` wrapping the page (same nav as Task 7 with Mes entreprises active; theme toggle wired to the document like the demos).
- `stat-card` row: Entreprises 342, Qualifiées 214, À compléter 97, Note moyenne 14,2/20.
- Filters bar: search `input` (raison sociale), `multi-select` départements (8 options), `toggle-group` statut (Toutes / Qualifiées / À compléter), `slider` note minimale (0–20), « Réinitialiser » button.
- `data-table` over ~24 fictitious companies (raison sociale with `hover-card` preview, SIREN, ville, département, statut `badge`, note `badge` success ≥ 15 / warning), controlled sorting done client-side in the example (comment: « une vraie page trierait côté serveur »), `emptyMessage` « Aucune entreprise ne correspond à ces filtres. ».
- `pagination` below the table (8 rows per page) wired to the filtered/sorted list.
- Filtering, sorting and paging are pure functions in the file (`filterCompanies`, `sortCompanies`, `paginate`), identical behaviour in both frameworks.

Acceptance: SSR renders; browser: each filter narrows the list, sorting toggles, pagination pages, empty state appears with impossible filters.

Commit & push — `feat(site): Annuaire fournisseurs example`.

---

### Task 9: Docs and cleanup

- [ ] `README.md`: « Vitrine » line → « Documentation : https://saqara.github.io/blueprint/ » ; « Développer » section: `npm run dev` opens the doc site (`http://localhost:5173/blueprint/`); demos in `src/{react,vue}/demos/`, examples in `src/examples/{react,vue}/`, categories in `site/catalog.ts`.
- [ ] `CHANGELOG.md`: `- 2026-09-25 — Site de documentation : pages par composant (aperçu, code, installation), bascule React / Vue, thème clair / sombre / auto, page tokens, 4 exemples.`
- [ ] `npm run check && npm run build && npm run smoke`; commit & push `docs: point README to the documentation site`; watch CI.
