# Blueprint — Lot 4 (blocs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship spec §5.2: shared pieces `saqara-logo`, `theme-toggle`, `user-menu` (+ vendored `avatar`), and blocks `app-shell-sidebar`, `app-shell-header`, `login`, in React and Vue.

**Architecture:** Pieces are `registry:ui` items like Lot 3. Blocks are single-file `registry:block` items whose file is `registry:component` (`registry/react/blocks/<name>.tsx`, `registry/vue/blocks/<Name>.vue`). Optional Vue callbacks are declared as `onX` function props so components can tell whether the app provided them. Showcase frames each block in a 600 px box with `transform` so `fixed` sidebars stay inside.

**Tech Stack:** unchanged.

**Spec:** `docs/superpowers/specs/2026-09-25-blueprint-design.md` §5.2

## Global Constraints

- Work on `main`, push after each task, CI green.
- French default copy: « Basculer le thème », « Se déconnecter », « Menu », « Navigation principale », « Connexion », « E-mail », « Mot de passe », « Mot de passe oublié ? », « Se connecter », « Recevoir un lien de connexion », « ou », « Vérifiez votre boîte mail », « Utiliser une autre adresse ».
- Active nav entry carries `aria-current="page"`; nav renders `<a href>` when `href` is set, else `<button>`; with `onNavigate`, clicks call it (and prevent default on links).
- Demo people/data are fictitious (« Camille Martin », `camille.martin@exemple.fr`).
- Every color token pair keeps ≥ 4.5:1 except declared exceptions (`primary`, `identity`, and new `sidebar-primary` — same brand red).

## Review Focus

1. **Sidebar tokens** — `bg-sidebar`, `text-sidebar-foreground`, `sidebar-accent`… exist in the theme in both modes (they were missing in Lot 3). Task 1 test on `tokens/theme.json`.
2. **Block install** — consumers installing `@saqara/app-shell-sidebar` get working imports to `saqara-logo` / `user-menu` / `theme-toggle` / `sidebar` (smoke).
3. **Login method matrix** — password only, magic link only, both, SSO + separator, error `role="alert"`, sent screen: same output in React and Vue. Task 4 tests.
4. **Nav semantics** — exactly one `aria-current="page"` per rendered nav, badges visible, links vs buttons. Tasks 2–3 tests.
5. **Initials** — multi-word, single word, extra spaces, accents, empty name. Task 1 tests.

---

### Task 1: Sidebar tokens + `avatar`, `saqara-logo`, `theme-toggle`, `user-menu`

**Files:**
- Modify: `tokens/theme.json`, `tests/tokens.test.ts`
- Generated: `registry/{react,vue}/ui/avatar*`
- Create: `registry/react/ui/{saqara-logo,theme-toggle,user-menu}.tsx`, `registry/vue/ui/saqara-logo/{SaqaraLogo.vue,index.ts}`, `registry/vue/ui/theme-toggle/{ThemeToggle.vue,index.ts}`, `registry/vue/ui/user-menu/{UserMenu.vue,utils.ts,index.ts}`, `tests/pieces.test.ts`, demos for the 4 items
- Modify: manifests (hand-added items)

**Interfaces:** `initials(name: string): string`; React `SaqaraLogo({ withText?, label?, className })`, `ThemeToggle({ theme, onThemeChange, label?, className })`, `UserMenu({ name, email?, avatarUrl?, onSignOut?, signOutLabel?, compact?, children?, className })`; Vue: same with `v-model:theme`, `onSignOut` prop, default slot for menu entries.

- [ ] **Step 1: Failing token test** — append to `describe("tokenErrors")` in `tests/tokens.test.ts`:

```ts
  it("defines the sidebar palette in both modes", () => {
    const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
    const keys = ["sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"]
    for (const mode of ["light", "dark"] as const) expect(keys.filter((k) => !(k in t[mode]))).toEqual([])
  })
```

- [ ] **Step 2:** `npx vitest run tests/tokens.test.ts` → FAIL (8 missing keys per mode).

- [ ] **Step 3: Add tokens** (stone, same logic as the rest of the theme) — in `tokens/theme.json`:
  - `light`: `"sidebar": "#FAFAF9"`, `"sidebar-foreground": "#292524"`, `"sidebar-primary": "#F04632"`, `"sidebar-primary-foreground": "#FFFFFF"`, `"sidebar-accent": "#F5F5F4"`, `"sidebar-accent-foreground": "#1C1917"`, `"sidebar-border": "#E7E5E4"`, `"sidebar-ring": "#F04632"`
  - `dark`: `"sidebar": "#1C1917"`, `"sidebar-foreground": "#FAFAF9"`, `"sidebar-primary": "#F04632"`, `"sidebar-primary-foreground": "#FFFFFF"`, `"sidebar-accent": "#292524"`, `"sidebar-accent-foreground": "#FAFAF9"`, `"sidebar-border": "#292524"`, `"sidebar-ring": "#F04632"`
  - `contrastExceptions`: add `"sidebar-primary"`.

- [ ] **Step 4:** `npx vitest run tests/tokens.test.ts` → PASS (including "accepts the real tokens").

- [ ] **Step 5: Vendor** — `npm run vendor -- avatar`.

- [ ] **Step 6: Failing test** — `tests/pieces.test.ts`:

```ts
import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { SaqaraLogo as RLogo } from "../registry/react/ui/saqara-logo"
import { ThemeToggle as RToggle } from "../registry/react/ui/theme-toggle"
import { initials as rInitials } from "../registry/react/ui/user-menu"
import { SaqaraLogo as VLogo } from "../registry/vue/ui/saqara-logo"
import { ThemeToggle as VToggle } from "../registry/vue/ui/theme-toggle"
import { initials as vInitials } from "../registry/vue/ui/user-menu"

const vue = (c: any, props: Record<string, unknown> = {}) => renderVue(createSSRApp({ render: () => h(c, props) }))

describe.each([["react", rInitials], ["vue", vInitials]] as const)("%s initials", (_, initials) => {
  it("takes first and last word, uppercased", () => {
    expect(initials("Camille Martin")).toBe("CM")
    expect(initials("Jean-Paul Martin Dupont")).toBe("JD")
    expect(initials("  élodie  ")).toBe("ÉL")
    expect(initials("")).toBe("?")
  })
})

describe("saqara-logo", () => {
  it.each([
    ["react", async (p: object) => renderToString(e(RLogo, p))],
    ["vue", async (p: object) => vue(VLogo, p as Record<string, unknown>)],
  ])("%s paints the mark in identity + currentColor, text optional", async (_, render) => {
    const mark = await render({})
    expect(mark).toContain("fill-identity")
    expect(mark).toContain('fill="currentColor"')
    expect(mark).toContain('aria-label="Saqara"')
    expect(await render({ withText: true })).toMatch(/<span>Saqara<\/span>/)
  })
})

describe("theme-toggle", () => {
  it.each([
    ["react", async (theme: string) => renderToString(e(RToggle, { theme: theme as "light", onThemeChange: () => {} }))],
    ["vue", async (theme: string) => vue(VToggle, { theme })],
  ])("%s exposes its state through aria-pressed", async (_, render) => {
    expect(await render("dark")).toContain('aria-pressed="true"')
    expect(await render("light")).toContain('aria-pressed="false"')
    expect(await render("light")).toContain('aria-label="Basculer le thème"')
  })
})
```

- [ ] **Step 7:** `npx vitest run tests/pieces.test.ts` → FAIL (modules missing).

- [ ] **Step 8: React pieces**

`registry/react/ui/saqara-logo.tsx`:
```tsx
import * as React from "react"
import { cn } from "cn"

type SaqaraLogoProps = React.ComponentProps<"span"> & { withText?: boolean; label?: string }

// Saqara "S" mark (from signature). Red stroke = --identity, dark stroke = currentColor (readable in dark mode).
function SaqaraLogo({ withText = false, label = "Saqara", className, ...props }: SaqaraLogoProps) {
  return (
    <span data-slot="saqara-logo" className={cn("inline-flex items-center gap-2 font-heading font-semibold", className)} {...props}>
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" role={withText ? undefined : "img"} aria-hidden={withText ? true : undefined} aria-label={withText ? undefined : label}>
        <path className="fill-identity" d="M13.1182 7.51609H18.2744C18.6717 6.18319 19.3093 5.11871 21.407 5.11871V0C17.646 0 13.9313 2.04564 13.1182 7.51609Z" />
        <path fill="currentColor" d="M13.1739 9.7938C9.66246 8.55346 9.13575 7.80371 9.18195 6.75775C9.21892 5.85063 10.069 5.07311 11.6862 5.1379V0.00992331C7.73118 -0.165946 4.14583 2.22217 3.94254 6.64667C3.74849 11.0341 7.00117 12.8206 10.3647 13.9314C13.756 15.0329 15.0405 15.653 14.9758 17.06C14.9388 17.9393 14.2735 18.902 11.7878 18.7816C10.0413 18.6983 8.80309 17.6616 8.6922 15.9585H3C3.78545 21.2716 7.1213 23.6875 11.3812 23.8819C16.3526 24.104 20.0027 21.6511 20.1967 17.2266C20.4185 12.3856 16.5837 10.9971 13.1739 9.7938Z" />
      </svg>
      {withText && <span>{label}</span>}
    </span>
  )
}

export { SaqaraLogo }
```

`registry/react/ui/theme-toggle.tsx`:
```tsx
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"

type Theme = "light" | "dark"
type ThemeToggleProps = { theme: Theme; onThemeChange: (theme: Theme) => void; label?: string; className?: string }

// Saqara: presentational only — the app keeps its own theme state/storage.
function ThemeToggle({ theme, onThemeChange, label = "Basculer le thème", className }: ThemeToggleProps) {
  return (
    <Button variant="ghost" size="icon" data-slot="theme-toggle" aria-label={label} aria-pressed={theme === "dark"} className={className}
      onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export { ThemeToggle }
```

`registry/react/ui/user-menu.tsx`:
```tsx
import * as React from "react"
import { LogOutIcon } from "lucide-react"
import { cn } from "cn"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/react/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]
  return letters.toUpperCase()
}

type UserMenuProps = {
  name: string
  email?: string
  avatarUrl?: string
  onSignOut?: () => void
  signOutLabel?: string
  compact?: boolean
  children?: React.ReactNode
  className?: string
}

function UserMenu({ name, email, avatarUrl, onSignOut, signOutLabel = "Se déconnecter", compact = false, children, className }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-slot="user-menu" aria-label={name}
        className={cn("flex items-center gap-2 rounded-md p-1 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}>
        <Avatar className="size-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="grid leading-tight">
            <span className="truncate font-medium">{name}</span>
            {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="grid font-normal">
          <span className="font-medium">{name}</span>
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
        </DropdownMenuLabel>
        {children && (<><DropdownMenuSeparator />{children}</>)}
        {onSignOut && (<><DropdownMenuSeparator /><DropdownMenuItem onSelect={onSignOut}><LogOutIcon />{signOutLabel}</DropdownMenuItem></>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
```

- [ ] **Step 9: Vue pieces**

`registry/vue/ui/saqara-logo/SaqaraLogo.vue`:
```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

// Saqara "S" mark (from signature). Red stroke = --identity, dark stroke = currentColor (readable in dark mode).
const props = withDefaults(defineProps<{ withText?: boolean; label?: string; class?: HTMLAttributes["class"] }>(), { withText: false, label: "Saqara" })
</script>

<template>
  <span data-slot="saqara-logo" :class="cn('inline-flex items-center gap-2 font-heading font-semibold', props.class)">
    <svg viewBox="0 0 24 24" class="size-6 shrink-0" :role="withText ? undefined : 'img'" :aria-hidden="withText ? true : undefined" :aria-label="withText ? undefined : label">
      <path class="fill-identity" d="M13.1182 7.51609H18.2744C18.6717 6.18319 19.3093 5.11871 21.407 5.11871V0C17.646 0 13.9313 2.04564 13.1182 7.51609Z" />
      <path fill="currentColor" d="M13.1739 9.7938C9.66246 8.55346 9.13575 7.80371 9.18195 6.75775C9.21892 5.85063 10.069 5.07311 11.6862 5.1379V0.00992331C7.73118 -0.165946 4.14583 2.22217 3.94254 6.64667C3.74849 11.0341 7.00117 12.8206 10.3647 13.9314C13.756 15.0329 15.0405 15.653 14.9758 17.06C14.9388 17.9393 14.2735 18.902 11.7878 18.7816C10.0413 18.6983 8.80309 17.6616 8.6922 15.9585H3C3.78545 21.2716 7.1213 23.6875 11.3812 23.8819C16.3526 24.104 20.0027 21.6511 20.1967 17.2266C20.4185 12.3856 16.5837 10.9971 13.1739 9.7938Z" />
    </svg>
    <span v-if="withText">{{ label }}</span>
  </span>
</template>
```

`registry/vue/ui/saqara-logo/index.ts`: `export { default as SaqaraLogo } from "./SaqaraLogo.vue"`

`registry/vue/ui/theme-toggle/ThemeToggle.vue`:
```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { MoonIcon, SunIcon } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"

// Saqara: presentational only — the app keeps its own theme state/storage (v-model:theme).
const props = withDefaults(defineProps<{ label?: string; class?: HTMLAttributes["class"] }>(), { label: "Basculer le thème" })
const theme = defineModel<"light" | "dark">("theme", { default: "light" })
</script>

<template>
  <Button variant="ghost" size="icon" data-slot="theme-toggle" :aria-label="label" :aria-pressed="theme === 'dark'" :class="props.class"
    @click="theme = theme === 'dark' ? 'light' : 'dark'">
    <SunIcon v-if="theme === 'dark'" />
    <MoonIcon v-else />
  </Button>
</template>
```

`registry/vue/ui/theme-toggle/index.ts`: `export { default as ThemeToggle } from "./ThemeToggle.vue"`

`registry/vue/ui/user-menu/utils.ts`: the exact `initials` function from Step 8 (verbatim).

`registry/vue/ui/user-menu/UserMenu.vue`:
```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { LogOutIcon } from "@lucide/vue"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/vue/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
import { initials } from "./utils"

// `onSignOut` is a prop (bind with @sign-out) so the entry only shows when the app handles it.
const props = withDefaults(defineProps<{
  name: string
  email?: string
  avatarUrl?: string
  signOutLabel?: string
  compact?: boolean
  onSignOut?: () => void
  class?: HTMLAttributes["class"]
}>(), { signOutLabel: "Se déconnecter", compact: false })
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger data-slot="user-menu" :aria-label="name"
      :class="cn('flex items-center gap-2 rounded-md p-1 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50', props.class)">
      <Avatar class="size-8">
        <AvatarImage v-if="avatarUrl" :src="avatarUrl" alt="" />
        <AvatarFallback>{{ initials(name) }}</AvatarFallback>
      </Avatar>
      <span v-if="!compact" class="grid leading-tight">
        <span class="truncate font-medium">{{ name }}</span>
        <span v-if="email" class="truncate text-xs text-muted-foreground">{{ email }}</span>
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-56">
      <DropdownMenuLabel class="grid font-normal">
        <span class="font-medium">{{ name }}</span>
        <span v-if="email" class="text-xs text-muted-foreground">{{ email }}</span>
      </DropdownMenuLabel>
      <template v-if="$slots.default">
        <DropdownMenuSeparator />
        <slot />
      </template>
      <template v-if="onSignOut">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="onSignOut()"><LogOutIcon />{{ signOutLabel }}</DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

`registry/vue/ui/user-menu/index.ts`:
```ts
export { default as UserMenu } from "./UserMenu.vue"
export { initials } from "./utils"
```

- [ ] **Step 10: Manifest items** (upsert with `scratchpad/upsert.ts` or an equivalent `node -e`)

| name | React deps / files | Vue deps / files | registryDependencies |
|---|---|---|---|
| `saqara-logo` | `["cn"]` / `registry/react/ui/saqara-logo.tsx` | — / `SaqaraLogo.vue`, `index.ts` | — |
| `theme-toggle` | `["lucide-react"]` / `theme-toggle.tsx` | `["@lucide/vue"]` / `ThemeToggle.vue`, `index.ts` | `@saqara/button` |
| `user-menu` | `["cn", "lucide-react"]` / `user-menu.tsx` | `["@lucide/vue"]` / `UserMenu.vue`, `utils.ts`, `index.ts` | `@saqara/avatar`, `@saqara/dropdown-menu` |

All `type: "registry:ui"`, files `type: "registry:ui"`, titles "Saqara Logo", "Theme Toggle", "User Menu", French one-line descriptions ending with "(Saqara)".

- [ ] **Step 11:** `npx vitest run tests/pieces.test.ts` → PASS (6 tests).

- [ ] **Step 12: Demos**

`src/react/demos/avatar.tsx`:
```tsx
import { Avatar, AvatarFallback } from "@/registry/react/ui/avatar"

export default function AvatarDemo() {
  return (
    <div className="flex gap-2">
      <Avatar><AvatarFallback>CM</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>BS</AvatarFallback></Avatar>
    </div>
  )
}
```

`src/react/demos/saqara-logo.tsx`:
```tsx
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"

export default function SaqaraLogoDemo() {
  return (
    <div className="flex items-center gap-6">
      <SaqaraLogo />
      <SaqaraLogo withText />
      <SaqaraLogo withText label="Portail Fournisseur" className="text-lg" />
    </div>
  )
}
```

`src/react/demos/theme-toggle.tsx`:
```tsx
import { useState } from "react"
import { ThemeToggle } from "@/registry/react/ui/theme-toggle"

export default function ThemeToggleDemo() {
  const [theme, setTheme] = useState<"light" | "dark">(() => (document.documentElement.classList.contains("dark") ? "dark" : "light"))
  return <ThemeToggle theme={theme} onThemeChange={(t) => { setTheme(t); document.documentElement.classList.toggle("dark", t === "dark") }} />
}
```

`src/react/demos/user-menu.tsx`:
```tsx
import { Settings } from "lucide-react"
import { DropdownMenuItem } from "@/registry/react/ui/dropdown-menu"
import { UserMenu } from "@/registry/react/ui/user-menu"

export default function UserMenuDemo() {
  return (
    <UserMenu name="Camille Martin" email="camille.martin@exemple.fr" onSignOut={() => {}}>
      <DropdownMenuItem><Settings />Mon profil</DropdownMenuItem>
    </UserMenu>
  )
}
```

Vue demos, same content:

`src/vue/demos/avatar.vue`:
```vue
<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/registry/vue/ui/avatar"
</script>

<template>
  <div class="flex gap-2">
    <Avatar><AvatarFallback>CM</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>BS</AvatarFallback></Avatar>
  </div>
</template>
```

`src/vue/demos/saqara-logo.vue`:
```vue
<script setup lang="ts">
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"
</script>

<template>
  <div class="flex items-center gap-6">
    <SaqaraLogo />
    <SaqaraLogo with-text />
    <SaqaraLogo with-text label="Portail Fournisseur" class="text-lg" />
  </div>
</template>
```

`src/vue/demos/theme-toggle.vue`:
```vue
<script setup lang="ts">
import { ref, watch } from "vue"
import { ThemeToggle } from "@/registry/vue/ui/theme-toggle"

const theme = ref<"light" | "dark">(typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light")
watch(theme, (t) => document.documentElement.classList.toggle("dark", t === "dark"))
</script>

<template>
  <ThemeToggle v-model:theme="theme" />
</template>
```

`src/vue/demos/user-menu.vue`:
```vue
<script setup lang="ts">
import { Settings } from "@lucide/vue"
import { DropdownMenuItem } from "@/registry/vue/ui/dropdown-menu"
import { UserMenu } from "@/registry/vue/ui/user-menu"
</script>

<template>
  <UserMenu name="Camille Martin" email="camille.martin@exemple.fr" @sign-out="() => {}">
    <DropdownMenuItem><Settings />Mon profil</DropdownMenuItem>
  </UserMenu>
</template>
```

(The React `theme-toggle` demo reads `document` in a state initializer; the SSR render test runs without `document` — guard with `typeof document !== "undefined" &&` exactly like the Vue demo if the demo test fails.)

- [ ] **Step 13: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add sidebar tokens, avatar, saqara-logo, theme-toggle and user-menu (React + Vue)`.

---

### Task 2: `app-shell-sidebar` block

**Files:**
- Create: `registry/react/blocks/app-shell-sidebar.tsx`, `registry/vue/blocks/AppShellSidebar.vue`, `tests/app-shell.test.ts`, `src/react/demos/app-shell-sidebar.tsx`, `src/vue/demos/app-shell-sidebar.vue`
- Modify: manifests

**Interfaces:** `type AppNavItem = { id: string; label: string; icon?: ComponentType | Component; badge?: number; href?: string }`, `type AppUser = { name: string; email?: string; avatarUrl?: string }`. React props: `nav, activeId?, onNavigate?, title?, logo?, user?, onSignOut?, userMenuItems?, theme?, onThemeChange?, defaultOpen = true, className, children`. Vue: same with `v-model:theme`, `onNavigate` / `onSignOut` props, slots `default`, `logo`, `user-menu`.

- [ ] **Step 1: Failing test** — `tests/app-shell.test.ts`:

```ts
import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { AppShellSidebar as RSidebar } from "../registry/react/blocks/app-shell-sidebar"
import VSidebar from "../registry/vue/blocks/AppShellSidebar.vue"

export const nav = [
  { id: "annuaire", label: "Mes entreprises" },
  { id: "evaluations", label: "Évaluations", badge: 3 },
  { id: "organisation", label: "Organisation", href: "#organisation" },
]
export const user = { name: "Camille Martin", email: "camille.martin@exemple.fr" }
export const current = (html: string) => (html.match(/aria-current="page"/g) ?? []).length

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RSidebar as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VSidebar as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-sidebar", (_, render) => {
  it("renders nav, badge, page title, user and content", async () => {
    const html = await render({ nav, activeId: "evaluations", user })
    for (const text of ["Mes entreprises", "Évaluations", "Organisation", "Camille Martin", "Contenu"]) expect(html).toContain(text)
    expect(html).toMatch(/<h1[^>]*>Évaluations<\/h1>/)
    expect(html).toMatch(/>3</)
    expect(current(html)).toBe(1)
    expect(html).toContain('href="#organisation"')
  })
  it("prefers an explicit title and hides the theme toggle without a theme", async () => {
    const html = await render({ nav, activeId: "annuaire", title: "Tableau de bord" })
    expect(html).toMatch(/<h1[^>]*>Tableau de bord<\/h1>/)
    expect(html).not.toContain('data-slot="theme-toggle"')
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/app-shell.test.ts` → FAIL (modules missing).

- [ ] **Step 3: React block** — `registry/react/blocks/app-shell-sidebar.tsx`:

```tsx
"use client"

import * as React from "react"
import { Separator } from "@/registry/react/ui/separator"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/registry/react/ui/sidebar"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"
import { ThemeToggle } from "@/registry/react/ui/theme-toggle"
import { UserMenu } from "@/registry/react/ui/user-menu"

export type AppNavItem = { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }

type AppShellSidebarProps = {
  nav: AppNavItem[]
  activeId?: string
  onNavigate?: (id: string) => void
  title?: React.ReactNode
  logo?: React.ReactNode
  user?: AppUser
  onSignOut?: () => void
  userMenuItems?: React.ReactNode
  theme?: "light" | "dark"
  onThemeChange?: (theme: "light" | "dark") => void
  defaultOpen?: boolean
  className?: string
  children?: React.ReactNode
}

// Saqara block: collapsible sidebar shell. Routing-agnostic — `href` renders links, `onNavigate` handles clicks.
function AppShellSidebar({
  nav, activeId, onNavigate, title, logo, user, onSignOut, userMenuItems, theme, onThemeChange, defaultOpen = true, className, children,
}: AppShellSidebarProps) {
  const active = nav.find((item) => item.id === activeId)
  const PageIcon = active?.icon

  return (
    <SidebarProvider defaultOpen={defaultOpen} className={className}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-8 items-center px-1 group-data-[collapsible=icon]:justify-center">
            {logo ?? <SaqaraLogo withText className="group-data-[collapsible=icon]:[&>span]:hidden" />}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const isActive = item.id === activeId
                  const Icon = item.icon
                  const content = (<>{Icon && <Icon />}<span>{item.label}</span></>)
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        aria-current={isActive ? "page" : undefined}
                        asChild={!!item.href}
                        onClick={(event) => { if (onNavigate) { event.preventDefault(); onNavigate(item.id) } }}
                      >
                        {item.href ? <a href={item.href}>{content}</a> : content}
                      </SidebarMenuButton>
                      {!!item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <UserMenu {...user} onSignOut={onSignOut} className="w-full group-data-[collapsible=icon]:[&>span:last-child]:hidden">
              {userMenuItems}
            </UserMenu>
          </SidebarFooter>
        )}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          {PageIcon && <PageIcon className="size-4 text-primary" />}
          <h1 className="text-sm font-medium">{title ?? active?.label}</h1>
          {theme && onThemeChange && <ThemeToggle theme={theme} onThemeChange={onThemeChange} className="ml-auto" />}
        </header>
        <div className="flex-1 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppShellSidebar }
```

- [ ] **Step 4: Vue block** — `registry/vue/blocks/AppShellSidebar.vue`:

```vue
<script lang="ts">
import type { Component } from "vue"

export type AppNavItem = { id: string; label: string; icon?: Component; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { Separator } from "@/registry/vue/ui/separator"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/registry/vue/ui/sidebar"
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"
import { ThemeToggle } from "@/registry/vue/ui/theme-toggle"
import { UserMenu } from "@/registry/vue/ui/user-menu"

// Saqara block: collapsible sidebar shell. Routing-agnostic — `href` renders links, `onNavigate` (@navigate) handles clicks.
const props = withDefaults(defineProps<{
  nav: AppNavItem[]
  activeId?: string
  title?: string
  user?: AppUser
  onNavigate?: (id: string) => void
  onSignOut?: () => void
  defaultOpen?: boolean
  class?: HTMLAttributes["class"]
}>(), { defaultOpen: true })
const theme = defineModel<"light" | "dark">("theme")
const active = computed(() => props.nav.find((item) => item.id === props.activeId))

function go(event: Event, id: string) {
  if (!props.onNavigate) return
  event.preventDefault()
  props.onNavigate(id)
}
</script>

<template>
  <SidebarProvider :default-open="defaultOpen" :class="props.class">
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div class="flex h-8 items-center px-1 group-data-[collapsible=icon]:justify-center">
          <slot name="logo"><SaqaraLogo with-text class="group-data-[collapsible=icon]:[&>span]:hidden" /></slot>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in nav" :key="item.id">
                <SidebarMenuButton
                  :is-active="item.id === activeId"
                  :tooltip="item.label"
                  :aria-current="item.id === activeId ? 'page' : undefined"
                  :as="item.href ? 'a' : 'button'"
                  :href="item.href"
                  @click="go($event, item.id)"
                >
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.label }}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter v-if="user">
        <UserMenu v-bind="user" :on-sign-out="onSignOut" class="w-full group-data-[collapsible=icon]:[&>span:last-child]:hidden">
          <template v-if="$slots['user-menu']" #default><slot name="user-menu" /></template>
        </UserMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <component :is="active.icon" v-if="active?.icon" class="size-4 text-primary" />
        <h1 class="text-sm font-medium">{{ title ?? active?.label }}</h1>
        <ThemeToggle v-if="theme" v-model:theme="theme" class="ml-auto" />
      </header>
      <div class="flex-1 p-4"><slot /></div>
    </SidebarInset>
  </SidebarProvider>
</template>
```

- [ ] **Step 5: Manifest items** — React: `{ "name": "app-shell-sidebar", "type": "registry:block", "title": "App Shell (sidebar)", "description": "Shell d'application avec sidebar repliable, titre de page, thème et menu utilisateur (Saqara).", "registryDependencies": ["@saqara/saqara-logo", "@saqara/separator", "@saqara/sidebar", "@saqara/theme-toggle", "@saqara/user-menu"], "files": [{ "path": "registry/react/blocks/app-shell-sidebar.tsx", "type": "registry:component" }] }`. Vue: same with file `registry/vue/blocks/AppShellSidebar.vue`.

- [ ] **Step 6:** `npx vitest run tests/app-shell.test.ts` → PASS (4 tests).

- [ ] **Step 7: Demos**

`src/react/demos/app-shell-sidebar.tsx`:
```tsx
import { useState } from "react"
import { Building2, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellSidebar, type AppNavItem } from "@/registry/react/blocks/app-shell-sidebar"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]

export default function AppShellSidebarDemo() {
  const [active, setActive] = useState("annuaire")
  return (
    // transform keeps the fixed sidebar inside the frame (showcase only)
    <div className="h-[600px] overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <AppShellSidebar className="h-full min-h-0" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Camille Martin", email: "camille.martin@exemple.fr" }} onSignOut={() => {}}>
        <p className="text-sm text-muted-foreground">Contenu de la page « {nav.find((n) => n.id === active)?.label} ».</p>
      </AppShellSidebar>
    </div>
  )
}
```

`src/vue/demos/app-shell-sidebar.vue`:
```vue
<script setup lang="ts">
import type { AppNavItem } from "@/registry/vue/blocks/AppShellSidebar.vue"
import { Building2, ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { ref } from "vue"
import AppShellSidebar from "@/registry/vue/blocks/AppShellSidebar.vue"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
const active = ref("annuaire")
</script>

<template>
  <!-- transform keeps the fixed sidebar inside the frame (showcase only) -->
  <div class="h-[600px] overflow-hidden rounded-lg border [transform:translateZ(0)]">
    <AppShellSidebar class="h-full min-h-0" :nav="nav" :active-id="active" :user="{ name: 'Camille Martin', email: 'camille.martin@exemple.fr' }"
      @navigate="(id) => (active = id)" @sign-out="() => {}">
      <p class="text-sm text-muted-foreground">Contenu de la page « {{ nav.find((n) => n.id === active)?.label }} ».</p>
    </AppShellSidebar>
  </div>
</template>
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke`. If smoke shows an unrewritten block import, stop and ledger (block file imports must be `@/registry/<fw>/ui/...` only). Commit & push `feat: add app-shell-sidebar block (React + Vue)`.

---

### Task 3: `app-shell-header` block

**Files:**
- Create: `registry/react/blocks/app-shell-header.tsx`, `registry/vue/blocks/AppShellHeader.vue`, demos
- Modify: `tests/app-shell.test.ts`, manifests

**Interfaces:** same props as `app-shell-sidebar` minus `defaultOpen`, plus `menuLabel = "Menu"`; `AppNavItem` / `AppUser` redeclared in the block (each block is self-contained).

- [ ] **Step 1: Failing test** — append to `tests/app-shell.test.ts`:

```ts
import { AppShellHeader as RHeader } from "../registry/react/blocks/app-shell-header"
import VHeader from "../registry/vue/blocks/AppShellHeader.vue"

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RHeader as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VHeader as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-header", (_, render) => {
  it("renders brand, page title, tabs with badge, user menu and content", async () => {
    const html = await render({ nav, activeId: "evaluations", user, theme: "light", onThemeChange: () => {} })
    for (const text of ["Saqara", "Mes entreprises", "Organisation", "Contenu", 'aria-label="Navigation principale"', 'aria-label="Menu"']) expect(html).toContain(text)
    expect(html).toMatch(/>3</)
    expect(current(html)).toBe(1)
    expect(html).toContain('href="#organisation"')
    expect(html).toContain('data-slot="theme-toggle"')
  })
})
```

(Move these two imports to the top of the file with the others.)

- [ ] **Step 2:** `npx vitest run tests/app-shell.test.ts` → FAIL (module missing).

- [ ] **Step 3: React block** — `registry/react/blocks/app-shell-header.tsx`:

```tsx
"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/registry/react/ui/badge"
import { Button, buttonVariants } from "@/registry/react/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/react/ui/sheet"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"
import { ThemeToggle } from "@/registry/react/ui/theme-toggle"
import { UserMenu } from "@/registry/react/ui/user-menu"

export type AppNavItem = { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }

type AppShellHeaderProps = {
  nav: AppNavItem[]
  activeId?: string
  onNavigate?: (id: string) => void
  title?: React.ReactNode
  logo?: React.ReactNode
  user?: AppUser
  onSignOut?: () => void
  userMenuItems?: React.ReactNode
  theme?: "light" | "dark"
  onThemeChange?: (theme: "light" | "dark") => void
  menuLabel?: string
  className?: string
  children?: React.ReactNode
}

// Saqara block: top-bar shell (pfou-hub structure). Routing-agnostic — `href` renders links, `onNavigate` handles clicks.
function AppShellHeader({
  nav, activeId, onNavigate, title, logo, user, onSignOut, userMenuItems, theme, onThemeChange, menuLabel = "Menu", className, children,
}: AppShellHeaderProps) {
  const [open, setOpen] = React.useState(false)
  const active = nav.find((item) => item.id === activeId)
  const PageIcon = active?.icon
  const brand = logo ?? <SaqaraLogo withText />

  const entry = (item: AppNavItem, mobile: boolean) => {
    const isActive = item.id === activeId
    const Icon = item.icon
    const props = {
      "aria-current": isActive ? ("page" as const) : undefined,
      className: cn(buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }), mobile && "w-full justify-start"),
      onClick: (event: React.MouseEvent) => {
        setOpen(false)
        if (onNavigate) { event.preventDefault(); onNavigate(item.id) }
      },
    }
    const content = (
      <>
        {Icon && <Icon />}
        {item.label}
        {!!item.badge && <Badge variant="identity" className="ml-1 h-5 min-w-5 px-1">{item.badge}</Badge>}
      </>
    )
    return item.href
      ? <a key={item.id} href={item.href} {...props}>{content}</a>
      : <button key={item.id} type="button" {...props}>{content}</button>
  }

  return (
    <div data-slot="app-shell-header" className={cn("flex min-h-svh flex-col bg-background", className)}>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          {brand}
          {(title ?? active) && (
            <div className="hidden items-center gap-2 border-l pl-4 text-sm font-medium md:flex">
              {PageIcon && <PageIcon className="size-4 text-primary" />}
              {title ?? active?.label}
            </div>
          )}
          <nav aria-label="Navigation principale" className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((item) => entry(item, false))}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {theme && onThemeChange && <ThemeToggle theme={theme} onThemeChange={onThemeChange} />}
            {user && <UserMenu {...user} onSignOut={onSignOut} compact>{userMenuItems}</UserMenu>}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><MenuIcon /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader><SheetTitle>{brand}</SheetTitle></SheetHeader>
                <nav aria-label="Navigation principale" className="grid gap-1 px-4">
                  {nav.map((item) => entry(item, true))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  )
}

export { AppShellHeader }
```

- [ ] **Step 4: Vue block** — `registry/vue/blocks/AppShellHeader.vue`:

```vue
<script lang="ts">
import type { Component } from "vue"

export type AppNavItem = { id: string; label: string; icon?: Component; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { MenuIcon } from "@lucide/vue"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { Button, buttonVariants } from "@/registry/vue/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/vue/ui/sheet"
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"
import { ThemeToggle } from "@/registry/vue/ui/theme-toggle"
import { UserMenu } from "@/registry/vue/ui/user-menu"

// Saqara block: top-bar shell (pfou-hub structure). Routing-agnostic — `href` renders links, `onNavigate` (@navigate) handles clicks.
const props = withDefaults(defineProps<{
  nav: AppNavItem[]
  activeId?: string
  title?: string
  user?: AppUser
  menuLabel?: string
  onNavigate?: (id: string) => void
  onSignOut?: () => void
  class?: HTMLAttributes["class"]
}>(), { menuLabel: "Menu" })
const theme = defineModel<"light" | "dark">("theme")
const open = ref(false)
const active = computed(() => props.nav.find((item) => item.id === props.activeId))
const entryClass = (item: AppNavItem, mobile: boolean) =>
  cn(buttonVariants({ variant: item.id === props.activeId ? "secondary" : "ghost", size: "sm" }), mobile && "w-full justify-start")

function go(event: Event, id: string) {
  open.value = false
  if (!props.onNavigate) return
  event.preventDefault()
  props.onNavigate(id)
}
</script>

<template>
  <div data-slot="app-shell-header" :class="cn('flex min-h-svh flex-col bg-background', props.class)">
    <header class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div class="flex h-16 items-center gap-4 px-4 sm:px-6">
        <slot name="logo"><SaqaraLogo with-text /></slot>
        <div v-if="title ?? active" class="hidden items-center gap-2 border-l pl-4 text-sm font-medium md:flex">
          <component :is="active.icon" v-if="active?.icon" class="size-4 text-primary" />
          {{ title ?? active?.label }}
        </div>
        <nav aria-label="Navigation principale" class="ml-auto hidden items-center gap-1 md:flex">
          <component :is="item.href ? 'a' : 'button'" v-for="item in nav" :key="item.id" :href="item.href" :type="item.href ? undefined : 'button'"
            :aria-current="item.id === activeId ? 'page' : undefined" :class="entryClass(item, false)" @click="go($event, item.id)">
            <component :is="item.icon" v-if="item.icon" />
            {{ item.label }}
            <Badge v-if="item.badge" variant="identity" class="ml-1 h-5 min-w-5 px-1">{{ item.badge }}</Badge>
          </component>
        </nav>
        <div class="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle v-if="theme" v-model:theme="theme" />
          <UserMenu v-if="user" v-bind="user" :on-sign-out="onSignOut" compact>
            <template v-if="$slots['user-menu']" #default><slot name="user-menu" /></template>
          </UserMenu>
          <Sheet v-model:open="open">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden" :aria-label="menuLabel"><MenuIcon /></Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <SheetHeader><SheetTitle><slot name="logo"><SaqaraLogo with-text /></slot></SheetTitle></SheetHeader>
              <nav aria-label="Navigation principale" class="grid gap-1 px-4">
                <component :is="item.href ? 'a' : 'button'" v-for="item in nav" :key="item.id" :href="item.href" :type="item.href ? undefined : 'button'"
                  :aria-current="item.id === activeId ? 'page' : undefined" :class="entryClass(item, true)" @click="go($event, item.id)">
                  <component :is="item.icon" v-if="item.icon" />
                  {{ item.label }}
                  <Badge v-if="item.badge" variant="identity" class="ml-1 h-5 min-w-5 px-1">{{ item.badge }}</Badge>
                </component>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <main class="flex-1 p-4 sm:p-6"><slot /></main>
  </div>
</template>
```

The Vue test passes `onThemeChange`, which Vue ignores; `theme: "light"` is what shows the toggle (v-model).

- [ ] **Step 5: Manifest items** — `app-shell-header`, `"type": "registry:block"`, title "App Shell (header)", description "Shell d'application avec barre de navigation horizontale, compteurs, thème et menu utilisateur (Saqara).", React deps `["cn", "lucide-react"]`, Vue deps `["@lucide/vue"]`, registryDependencies `["@saqara/badge", "@saqara/button", "@saqara/saqara-logo", "@saqara/sheet", "@saqara/theme-toggle", "@saqara/user-menu"]`, file `registry/react/blocks/app-shell-header.tsx` / `registry/vue/blocks/AppShellHeader.vue` as `registry:component`.

- [ ] **Step 6:** `npx vitest run tests/app-shell.test.ts` → PASS (6 tests).

- [ ] **Step 7: Demos**

`src/react/demos/app-shell-header.tsx`:
```tsx
import { useState } from "react"
import { Building2, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellHeader, type AppNavItem } from "@/registry/react/blocks/app-shell-header"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]

export default function AppShellHeaderDemo() {
  const [active, setActive] = useState("annuaire")
  return (
    <div className="h-[600px] overflow-auto rounded-lg border [transform:translateZ(0)]">
      <AppShellHeader className="min-h-full" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Camille Martin", email: "camille.martin@exemple.fr" }} onSignOut={() => {}}>
        <p className="text-sm text-muted-foreground">Contenu de la page « {nav.find((n) => n.id === active)?.label} ».</p>
      </AppShellHeader>
    </div>
  )
}
```

`src/vue/demos/app-shell-header.vue`:
```vue
<script setup lang="ts">
import type { AppNavItem } from "@/registry/vue/blocks/AppShellHeader.vue"
import { Building2, ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { ref } from "vue"
import AppShellHeader from "@/registry/vue/blocks/AppShellHeader.vue"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
const active = ref("annuaire")
</script>

<template>
  <div class="h-[600px] overflow-auto rounded-lg border [transform:translateZ(0)]">
    <AppShellHeader class="min-h-full" :nav="nav" :active-id="active" :user="{ name: 'Camille Martin', email: 'camille.martin@exemple.fr' }"
      @navigate="(id) => (active = id)" @sign-out="() => {}">
      <p class="text-sm text-muted-foreground">Contenu de la page « {{ nav.find((n) => n.id === active)?.label }} ».</p>
    </AppShellHeader>
  </div>
</template>
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add app-shell-header block (React + Vue)`.

---

### Task 4: `login` block + docs

**Files:**
- Create: `registry/react/blocks/login.tsx`, `registry/vue/blocks/Login.vue`, `tests/login.test.ts`, demos
- Modify: manifests, `README.md`, `CHANGELOG.md`

**Interfaces:** React props `title = "Connexion"`, `description?`, `logo?`, `password = true`, `magicLink = false`, `sso?: { label: string }`, `status: "idle" | "loading" | "sent" = "idle"`, `error?`, `onPasswordSubmit?({ email, password })`, `onMagicLinkSubmit?(email)`, `onSso?()`, `onForgotPassword?(email)`, `onReset?()`, `className`. Vue: same (callbacks as `onX` props, bound with `@x`).

- [ ] **Step 1: Failing test** — `tests/login.test.ts`:

```ts
import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { Login as RLogin } from "../registry/react/blocks/login"
import VLogin from "../registry/vue/blocks/Login.vue"

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RLogin as any, p))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VLogin as any, p) }))],
])("%s login", (_, render) => {
  it("defaults to email + password", async () => {
    const html = await render({})
    expect(html).toContain("Connexion")
    expect(html).toContain('type="email"')
    expect(html).toContain('type="password"')
    expect(html).toContain("Se connecter")
    expect(html).not.toContain("Recevoir un lien de connexion")
  })
  it("offers the forgot-password link only when handled", async () => {
    expect(await render({})).not.toContain("Mot de passe oublié")
    expect(await render({ onForgotPassword: () => {} })).toContain("Mot de passe oublié")
  })
  it("supports magic link only", async () => {
    const html = await render({ password: false, magicLink: true })
    expect(html).not.toContain('type="password"')
    expect(html).toContain("Recevoir un lien de connexion")
  })
  it("puts SSO first with an « ou » separator when another method exists", async () => {
    const html = await render({ sso: { label: "Se connecter avec SSO" } })
    expect(html.indexOf("Se connecter avec SSO")).toBeLessThan(html.indexOf('type="email"'))
    expect(html).toMatch(/>ou</)
    expect(await render({ password: false, sso: { label: "SSO" } })).not.toMatch(/>ou</)
  })
  it("announces errors", async () => {
    expect(await render({ error: "Identifiants incorrects." })).toMatch(/role="alert"[^>]*>[\s\S]*Identifiants incorrects\./)
  })
  it("shows the check-your-inbox screen once the link is sent", async () => {
    const html = await render({ password: false, magicLink: true, status: "sent", onReset: () => {} })
    expect(html).toContain("Vérifiez votre boîte mail")
    expect(html).toContain("Utiliser une autre adresse")
    expect(html).not.toContain('type="email"')
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/login.test.ts` → FAIL (modules missing).

- [ ] **Step 3: React block** — `registry/react/blocks/login.tsx`:

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"
import { Alert, AlertDescription } from "@/registry/react/ui/alert"
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/react/ui/card"
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"
import { Separator } from "@/registry/react/ui/separator"
import { Spinner } from "@/registry/react/ui/spinner"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"

type LoginProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  logo?: React.ReactNode
  password?: boolean
  magicLink?: boolean
  sso?: { label: string }
  status?: "idle" | "loading" | "sent"
  error?: string
  onPasswordSubmit?: (values: { email: string; password: string }) => void
  onMagicLinkSubmit?: (email: string) => void
  onSso?: () => void
  onForgotPassword?: (email: string) => void
  onReset?: () => void
  className?: string
}

// Saqara block: presentational login. The app runs the auth and drives `status` / `error`.
function Login({
  title = "Connexion", description, logo, password = true, magicLink = false, sso, status = "idle", error,
  onPasswordSubmit, onMagicLinkSubmit, onSso, onForgotPassword, onReset, className,
}: LoginProps) {
  const id = React.useId()
  const [email, setEmail] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const loading = status === "loading"
  const brand = logo ?? <SaqaraLogo className="text-foreground" />

  if (status === "sent") {
    return (
      <Card data-slot="login" className={cn("w-full max-w-sm", className)}>
        <CardHeader className="items-center gap-3 text-center">
          {brand}
          <CardTitle className="font-heading text-xl">Vérifiez votre boîte mail</CardTitle>
          <CardDescription>Un lien de connexion a été envoyé à <strong>{email || "votre adresse"}</strong>.</CardDescription>
        </CardHeader>
        {onReset && (
          <CardFooter><Button variant="outline" className="w-full" onClick={onReset}>Utiliser une autre adresse</Button></CardFooter>
        )}
      </Card>
    )
  }

  const hasForm = password || magicLink
  const sendLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    const input = event.currentTarget.form?.elements.namedItem("email") as HTMLInputElement | null
    if (input && !input.reportValidity()) return
    onMagicLinkSubmit?.(email)
  }

  return (
    <Card data-slot="login" className={cn("w-full max-w-sm", className)}>
      <CardHeader className="items-center gap-3 text-center">
        {brand}
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
        {sso && <Button variant="outline" className="w-full" disabled={loading} onClick={onSso}>{sso.label}</Button>}
        {sso && hasForm && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Separator className="flex-1" /><span>ou</span><Separator className="flex-1" /></div>
        )}
        {hasForm && (
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault()
            if (password) onPasswordSubmit?.({ email, password: secret })
            else onMagicLinkSubmit?.(email)
          }}>
            <div className="grid gap-2">
              <Label htmlFor={`${id}-email`}>E-mail</Label>
              <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            {password && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${id}-password`}>Mot de passe</Label>
                  {onForgotPassword && (
                    <button type="button" className="text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => onForgotPassword(email)}>
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <Input id={`${id}-password`} name="password" type="password" autoComplete="current-password" required value={secret} onChange={(event) => setSecret(event.target.value)} />
              </div>
            )}
            {password && <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner />}Se connecter</Button>}
            {magicLink && (password
              ? <Button type="button" variant="ghost" className="w-full" disabled={loading} onClick={sendLink}>Recevoir un lien de connexion</Button>
              : <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner />}Recevoir un lien de connexion</Button>)}
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export { Login }
```

- [ ] **Step 4: Vue block** — `registry/vue/blocks/Login.vue`:

```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref, useId } from "vue"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/registry/vue/ui/alert"
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/vue/ui/card"
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
import { Separator } from "@/registry/vue/ui/separator"
import { Spinner } from "@/registry/vue/ui/spinner"
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"

// Saqara block: presentational login. The app runs the auth and drives `status` / `error`.
// Callbacks are props (bind with @password-submit, @sso…) so optional entries only show when handled.
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  password?: boolean
  magicLink?: boolean
  sso?: { label: string }
  status?: "idle" | "loading" | "sent"
  error?: string
  onPasswordSubmit?: (values: { email: string; password: string }) => void
  onMagicLinkSubmit?: (email: string) => void
  onSso?: () => void
  onForgotPassword?: (email: string) => void
  onReset?: () => void
  class?: HTMLAttributes["class"]
}>(), { title: "Connexion", password: true, magicLink: false, status: "idle" })

const id = useId()
const email = ref("")
const secret = ref("")

function submit() {
  if (props.password) props.onPasswordSubmit?.({ email: email.value, password: secret.value })
  else props.onMagicLinkSubmit?.(email.value)
}
function sendLink(event: MouseEvent) {
  const input = (event.currentTarget as HTMLButtonElement).form?.elements.namedItem("email") as HTMLInputElement | null
  if (input && !input.reportValidity()) return
  props.onMagicLinkSubmit?.(email.value)
}
</script>

<template>
  <Card v-if="status === 'sent'" data-slot="login" :class="cn('w-full max-w-sm', props.class)">
    <CardHeader class="items-center gap-3 text-center">
      <slot name="logo"><SaqaraLogo class="text-foreground" /></slot>
      <CardTitle class="font-heading text-xl">Vérifiez votre boîte mail</CardTitle>
      <CardDescription>Un lien de connexion a été envoyé à <strong>{{ email || "votre adresse" }}</strong>.</CardDescription>
    </CardHeader>
    <CardFooter v-if="onReset">
      <Button variant="outline" class="w-full" @click="onReset()">Utiliser une autre adresse</Button>
    </CardFooter>
  </Card>
  <Card v-else data-slot="login" :class="cn('w-full max-w-sm', props.class)">
    <CardHeader class="items-center gap-3 text-center">
      <slot name="logo"><SaqaraLogo class="text-foreground" /></slot>
      <CardTitle class="font-heading text-xl">{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <Alert v-if="error" variant="destructive" role="alert"><AlertDescription>{{ error }}</AlertDescription></Alert>
      <Button v-if="sso" variant="outline" class="w-full" :disabled="status === 'loading'" @click="onSso?.()">{{ sso.label }}</Button>
      <div v-if="sso && (password || magicLink)" class="flex items-center gap-2 text-xs text-muted-foreground">
        <Separator class="flex-1" /><span>ou</span><Separator class="flex-1" />
      </div>
      <form v-if="password || magicLink" class="grid gap-3" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label :for="`${id}-email`">E-mail</Label>
          <Input :id="`${id}-email`" v-model="email" name="email" type="email" autocomplete="email" required />
        </div>
        <div v-if="password" class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label :for="`${id}-password`">Mot de passe</Label>
            <button v-if="onForgotPassword" type="button" class="text-xs text-muted-foreground underline-offset-4 hover:underline" @click="onForgotPassword(email)">
              Mot de passe oublié ?
            </button>
          </div>
          <Input :id="`${id}-password`" v-model="secret" name="password" type="password" autocomplete="current-password" required />
        </div>
        <Button v-if="password" type="submit" class="w-full" :disabled="status === 'loading'"><Spinner v-if="status === 'loading'" />Se connecter</Button>
        <template v-if="magicLink">
          <Button v-if="password" type="button" variant="ghost" class="w-full" :disabled="status === 'loading'" @click="sendLink">Recevoir un lien de connexion</Button>
          <Button v-else type="submit" class="w-full" :disabled="status === 'loading'"><Spinner v-if="status === 'loading'" />Recevoir un lien de connexion</Button>
        </template>
      </form>
    </CardContent>
  </Card>
</template>
```

- [ ] **Step 5: Manifest items** — `login`, `"type": "registry:block"`, title "Login", description "Page de connexion : mot de passe, lien magique et SSO activables (Saqara).", React deps `["cn"]`, registryDependencies `["@saqara/alert", "@saqara/button", "@saqara/card", "@saqara/input", "@saqara/label", "@saqara/saqara-logo", "@saqara/separator", "@saqara/spinner"]`, files `registry/react/blocks/login.tsx` / `registry/vue/blocks/Login.vue` as `registry:component`.

- [ ] **Step 6:** `npx vitest run tests/login.test.ts` → PASS (12 tests).

- [ ] **Step 7: Demos**

`src/react/demos/login.tsx`:
```tsx
import { useState } from "react"
import { Login } from "@/registry/react/blocks/login"

export default function LoginDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [error, setError] = useState<string>()
  const wait = (then: () => void) => { setStatus("loading"); setError(undefined); setTimeout(then, 800) }
  return (
    <div className="flex justify-center rounded-lg border bg-muted/40 p-8">
      <Login title="Portail Fournisseur" description="Connectez-vous pour accéder à votre espace." magicLink sso={{ label: "Se connecter avec SSO" }}
        status={status} error={error}
        onPasswordSubmit={() => wait(() => { setStatus("idle"); setError("Identifiants incorrects.") })}
        onMagicLinkSubmit={() => wait(() => setStatus("sent"))}
        onSso={() => wait(() => { setStatus("idle"); setError("La connexion SSO a échoué. Réessayez.") })}
        onForgotPassword={() => {}} onReset={() => setStatus("idle")} />
    </div>
  )
}
```

`src/vue/demos/login.vue`:
```vue
<script setup lang="ts">
import { ref } from "vue"
import Login from "@/registry/vue/blocks/Login.vue"

const status = ref<"idle" | "loading" | "sent">("idle")
const error = ref<string>()
function wait(then: () => void) {
  status.value = "loading"
  error.value = undefined
  setTimeout(then, 800)
}
</script>

<template>
  <div class="flex justify-center rounded-lg border bg-muted/40 p-8">
    <Login title="Portail Fournisseur" description="Connectez-vous pour accéder à votre espace." magic-link :sso="{ label: 'Se connecter avec SSO' }"
      :status="status" :error="error"
      @password-submit="wait(() => { status = 'idle'; error = 'Identifiants incorrects.' })"
      @magic-link-submit="wait(() => (status = 'sent'))"
      @sso="wait(() => { status = 'idle'; error = 'La connexion SSO a échoué. Réessayez.' })"
      @forgot-password="() => {}" @reset="status = 'idle'" />
  </div>
</template>
```

- [ ] **Step 8: Docs** — `CHANGELOG.md` (top): `- 2026-09-25 — Lot 4 : tokens sidebar, \`avatar\`, \`saqara-logo\`, \`theme-toggle\`, \`user-menu\`, blocs \`app-shell-sidebar\`, \`app-shell-header\`, \`login\`.`

`README.md`, after the Lot 3 list:
```markdown
Blocs (lot 4) — `npx shadcn add @saqara/app-shell-sidebar` (ou `app-shell-header`, `login`) :
- Les shells ne dépendent d'aucun routeur : `nav` (`{ id, label, icon?, badge?, href? }`), `activeId`, `onNavigate` (Vue `@navigate`).
- Thème : passer `theme` + `onThemeChange` (Vue `v-model:theme`) pour afficher la bascule ; l'app garde son stockage.
- `login` est purement visuel : l'app fait l'authentification et pilote `status` (`idle`, `loading`, `sent`) et `error`.
- En Vue, les callbacks facultatifs (`@sign-out`, `@sso`, `@forgot-password`…) n'affichent leur entrée que s'ils sont fournis.
```

- [ ] **Step 9: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add login block (React + Vue); document lot 4`; watch CI.
