# Blueprint — Lot 3 (composés Saqara) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Lot 3 (spec §5.1): vendored `table`, `pagination`, `slider`, `sidebar`, Vue `stepper`, plus five Saqara components in React and Vue — `data-table`, `multi-select`, `stepper` (React), `file-dropzone`, `stat-card`.

**Architecture:** Vendored items go through `npm run vendor`. Saqara components are hand-written in `registry/react/ui/<name>.tsx` and `registry/vue/ui/<name>/` with their pure logic exported from the component module (React) or `utils.ts` (Vue), and hand-added manifest items. Pure logic is tested with identical cases for both frameworks; rendering is tested by SSR.

**Tech Stack:** as before, plus `@tanstack/react-table`, `@tanstack/vue-table`.

**Spec:** `docs/superpowers/specs/2026-09-25-blueprint-design.md` §5.1

## Global Constraints

- Work on `main`, push after each task; CI must stay green.
- Same item names in both manifests, except `registry:hook` items (framework-internal, e.g. React `use-mobile`).
- Default copy in French, overridable by props: « Aucun résultat. », « Sélectionner… », « Rechercher… », « Tout effacer », « Glissez un fichier ici ou cliquez pour parcourir », « Retirer ».
- DataTable sorting is always controlled (`manualSorting`); clicking a sortable header toggles asc ↔ desc.
- Stepper values are 1-based step numbers; `linear` (default `true`) disables triggers of steps after the current one.
- No new test libraries (no jsdom / Testing Library).

## Review Focus

1. **React sidebar pulls `use-mobile`** (hook, React-only) — parity must accept hooks without a Vue twin, but still flag a missing UI item. Task 1 test.
2. **DataTable states** — `loading` renders exactly `loadingRows` skeleton rows, empty data renders `emptyMessage`, a sorted column carries `aria-sort`; same in React and Vue. Task 2 SSR tests.
3. **File type matching** — `accept` with extensions (`.XLSX` case), wildcards (`image/*`) and exact MIME, plus size limits: same verdicts in both frameworks. Task 5 tests.
4. **Stepper state parity** — for `value = 2` over 3 steps, React and Vue render `completed, active, inactive`. Task 4 SSR test.
5. **MultiSelect "+N"** — 5 selected with `maxBadges = 3` shows 3 badges and "+2"; order follows `options`. Task 3 tests.

---

### Task 1: Vendored items (table, pagination, slider, sidebar) + hook-aware parity

**Files:**
- Modify: `scripts/lib/parity.ts`, `tests/parity.test.ts`
- Generated: `registry/{react,vue}/ui/{table,pagination,slider,sidebar}*`, `registry/react/hooks/use-mobile.ts`
- Create: `src/{react,vue}/demos/{table,pagination,slider,sidebar}.{tsx,vue}`

- [ ] **Step 1: Failing test** — append to `tests/parity.test.ts` inside `describe("parityErrors")`:

```ts
  it("accepts framework-only hooks, which need no twin and no demo", () => {
    const hook = { name: "use-mobile", type: "registry:hook" }
    const sidebar = { name: "sidebar", type: "registry:ui", registryDependencies: ["@saqara/use-mobile"] }
    expect(parityErrors(m(sidebar, hook), m(sidebar), yes)).toEqual([])
  })
```

- [ ] **Step 2:** `npx vitest run tests/parity.test.ts` → FAIL (`"use-mobile" is in react but not in vue`, plus a missing demo).

- [ ] **Step 3: Implement** — in `scripts/lib/parity.ts`, replace the `names` helper and the demo condition:

```ts
  const names = (fw: Fw) => new Set(manifests[fw].items.map((i) => i.name))
  const shared = (fw: Fw) => new Set(manifests[fw].items.filter((i) => i.type !== "registry:hook").map((i) => i.name))

  for (const [fw, other] of [["react", "vue"], ["vue", "react"]] as const) {
    for (const name of shared(fw)) if (!shared(other).has(name)) errors.push(`"${name}" is in ${fw} but not in ${other}`)
  }
```
and change the demo check to `if (item.name !== "saqara-theme" && item.type !== "registry:hook" && !hasDemo(fw, item.name))`. Dependency checks keep using `names(fw)`.

- [ ] **Step 4:** `npx vitest run tests/parity.test.ts` → PASS.

- [ ] **Step 5: Vendor** — `npm run vendor -- table pagination slider sidebar use-mobile` fails for Vue (`use-mobile` is React-only). Instead run `npm run vendor -- table pagination slider sidebar`, then vendor the hook for React only with:

```bash
node -e '
import("./scripts/lib/vendor.ts").then(async ({ plan, UPSTREAM }) => {
  const { readManifest, upsertItem, writeManifest } = await import("./scripts/lib/manifest.ts")
  const fs = await import("node:fs"), path = await import("node:path")
  const up = await (await fetch(UPSTREAM.react + "/use-mobile.json")).json()
  const { files, item } = plan(up, "react", fs.existsSync, false)
  for (const f of files) { fs.mkdirSync(path.dirname(f.path), { recursive: true }); fs.writeFileSync(f.path, f.content) }
  writeManifest("registry.react.json", upsertItem(readManifest("registry.react.json"), item))
  console.log(item)
})'
```
Expected: item `{ name: "use-mobile", type: "registry:hook", files: [{ path: "registry/react/hooks/use-mobile.ts", ... }] }`. Install printed deps if any.

- [ ] **Step 6: React demos**

`src/react/demos/table.tsx`:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

const rows = [
  { siren: "552 100 554", name: "Bâti Sud SAS", city: "Lyon" },
  { siren: "402 812 377", name: "Élec Rhône", city: "Villeurbanne" },
]

export default function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow><TableHead>SIREN</TableHead><TableHead>Raison sociale</TableHead><TableHead>Ville</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.siren}><TableCell>{r.siren}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.city}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

`src/react/demos/pagination.tsx`:
```tsx
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/registry/react/ui/pagination"

export default function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#pagination" /></PaginationItem>
        <PaginationItem><PaginationLink href="#pagination">1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#pagination" isActive>2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationNext href="#pagination" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

`src/react/demos/slider.tsx`:
```tsx
import { Slider } from "@/registry/react/ui/slider"

export default function SliderDemo() {
  return (
    <div className="max-w-sm space-y-2 text-sm">
      <p>Note qualité minimale</p>
      <Slider defaultValue={[8, 16]} min={0} max={20} step={1} />
    </div>
  )
}
```

`src/react/demos/sidebar.tsx`:
```tsx
import { Building2, ClipboardCheck, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/registry/react/ui/sidebar"

const items = [
  { label: "Mes entreprises", icon: Building2, active: true },
  { label: "Évaluations", icon: ClipboardCheck },
  { label: "Organisation", icon: Users },
]

export default function SidebarDemo() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="h-64 rounded-md border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Portail fournisseur</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.label}>
                  <SidebarMenuButton isActive={it.active}><it.icon />{it.label}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

- [ ] **Step 7: Vue demos**

`src/vue/demos/table.vue`:
```vue
<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"

const rows = [
  { siren: "552 100 554", name: "Bâti Sud SAS", city: "Lyon" },
  { siren: "402 812 377", name: "Élec Rhône", city: "Villeurbanne" },
]
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow><TableHead>SIREN</TableHead><TableHead>Raison sociale</TableHead><TableHead>Ville</TableHead></TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="r in rows" :key="r.siren"><TableCell>{{ r.siren }}</TableCell><TableCell>{{ r.name }}</TableCell><TableCell>{{ r.city }}</TableCell></TableRow>
    </TableBody>
  </Table>
</template>
```

`src/vue/demos/pagination.vue`:
```vue
<script setup lang="ts">
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/registry/vue/ui/pagination"
</script>

<template>
  <Pagination v-slot="{ page }" :items-per-page="20" :total="120" :default-page="2">
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious />
      <template v-for="(item, index) in items" :key="index">
        <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">{{ item.value }}</PaginationItem>
        <PaginationEllipsis v-else :index="index" />
      </template>
      <PaginationNext />
    </PaginationContent>
  </Pagination>
</template>
```

`src/vue/demos/slider.vue`:
```vue
<script setup lang="ts">
import { Slider } from "@/registry/vue/ui/slider"
</script>

<template>
  <div class="max-w-sm space-y-2 text-sm">
    <p>Note qualité minimale</p>
    <Slider :default-value="[8, 16]" :min="0" :max="20" :step="1" />
  </div>
</template>
```

`src/vue/demos/sidebar.vue`:
```vue
<script setup lang="ts">
import { Building2, ClipboardCheck, Users } from "@lucide/vue"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/registry/vue/ui/sidebar"

const items = [
  { label: "Mes entreprises", icon: Building2, active: true },
  { label: "Évaluations", icon: ClipboardCheck, active: false },
  { label: "Organisation", icon: Users, active: false },
]
</script>

<template>
  <SidebarProvider class="min-h-0">
    <Sidebar collapsible="none" class="h-64 rounded-md border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portail fournisseur</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="it in items" :key="it.label">
              <SidebarMenuButton :is-active="it.active"><component :is="it.icon" />{{ it.label }}</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
</template>
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke` → `parity ok`, all pass, `smoke ok`. Export-name rule as in Lot 1: follow the vendored file, never edit it to fit a demo.

- [ ] **Step 9: Commit & push** — `feat: add table, pagination, slider and sidebar (React + Vue)`.

---

### Task 2: `data-table` (React + Vue)

**Files:**
- Create: `registry/react/ui/data-table.tsx`, `registry/vue/ui/data-table/{DataTable.vue,DataTableColumnHeader.vue,utils.ts,index.ts}`, `tests/data-table.test.ts`, `src/react/demos/data-table.tsx`, `src/vue/demos/data-table.vue`
- Modify: `registry.react.json`, `registry.vue.json` (hand-added items)

**Interfaces:**
- React: `DataTable<TData, TValue>(props: { columns: ColumnDef<TData, TValue>[]; data: TData[]; getRowId?; sorting?: SortingState; onSortingChange?: (s: SortingState) => void; loading?: boolean; loadingRows?: number; emptyMessage?: ReactNode; stickyHeader?: boolean; stickyFirstColumn?: boolean; className?: string })`, `DataTableColumnHeader({ column, title })`, `resolveUpdater<T>(u: Updater<T>, current: T): T`, `ariaSort(s: false | "asc" | "desc"): "ascending" | "descending" | undefined`.
- Vue: same props, `v-model:sorting`; `DataTableColumnHeader` props `{ column, title }`; `utils.ts` exports `resolveUpdater`, `ariaSort`.
- Loading rows carry `data-loading`.

- [ ] **Step 1: Install** — `npm i @tanstack/react-table @tanstack/vue-table`.

- [ ] **Step 2: Failing test** — `tests/data-table.test.ts`:

```ts
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { DataTable as ReactDataTable, ariaSort as reactAriaSort, resolveUpdater as reactResolve } from "../registry/react/ui/data-table"
import { DataTable as VueDataTable, ariaSort as vueAriaSort, resolveUpdater as vueResolve } from "../registry/vue/ui/data-table"

type Row = { id: string; name: string }
const columns = [{ accessorKey: "name", header: "Raison sociale" }]
const data: Row[] = [{ id: "a", name: "Bâti Sud" }, { id: "b", name: "Élec Rhône" }]

const render = {
  react: async (props: Record<string, unknown>) => renderToString(createElement(ReactDataTable as any, { columns, ...props })),
  vue: async (props: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VueDataTable as any, { columns, ...props }) })),
}
const helpers = { react: { ariaSort: reactAriaSort, resolveUpdater: reactResolve }, vue: { ariaSort: vueAriaSort, resolveUpdater: vueResolve } }

describe.each(["react", "vue"] as const)("%s data-table", (fw) => {
  it("resolves TanStack updaters (value or function)", () => {
    expect(helpers[fw].resolveUpdater([{ id: "x", desc: true }], [])).toEqual([{ id: "x", desc: true }])
    expect(helpers[fw].resolveUpdater((old: number[]) => [...old, 2], [1])).toEqual([1, 2])
  })
  it("maps sort state to aria-sort", () => {
    expect([helpers[fw].ariaSort("asc"), helpers[fw].ariaSort("desc"), helpers[fw].ariaSort(false)]).toEqual(["ascending", "descending", undefined])
  })
  it("renders loadingRows skeleton rows while loading", async () => {
    const html = await render[fw]({ data, loading: true, loadingRows: 4 })
    expect(html.match(/data-loading/g)).toHaveLength(4)
    expect(html).not.toContain("Bâti Sud")
  })
  it("renders the empty message without data", async () => {
    expect(await render[fw]({ data: [], emptyMessage: "Aucune entreprise." })).toContain("Aucune entreprise.")
  })
  it("renders rows and marks the sorted column", async () => {
    const html = await render[fw]({ data, sorting: [{ id: "name", desc: false }] })
    expect(html).toContain("Élec Rhône")
    expect(html).toContain('aria-sort="ascending"')
  })
})
```

- [ ] **Step 3:** `npx vitest run tests/data-table.test.ts` → FAIL (modules missing).

- [ ] **Step 4: React implementation** — `registry/react/ui/data-table.tsx`:

```tsx
"use client"

import * as React from "react"
import { type Column, type ColumnDef, type SortingState, type Updater, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"
import { Skeleton } from "@/registry/react/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

export function resolveUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(current) : updater
}

export function ariaSort(sorted: false | "asc" | "desc"): "ascending" | "descending" | undefined {
  return sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  loading?: boolean
  loadingRows?: number
  emptyMessage?: React.ReactNode
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
  className?: string
}

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back.
function DataTable<TData, TValue>({
  columns, data, getRowId, sorting = [], onSortingChange, loading = false, loadingRows = 5,
  emptyMessage = "Aucun résultat.", stickyHeader = false, stickyFirstColumn = false, className,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting },
    onSortingChange: (updater) => onSortingChange?.(resolveUpdater(updater, sorting)),
  })
  const colCount = table.getVisibleLeafColumns().length
  const sticky = (index: number) => stickyFirstColumn && index === 0 && "sticky left-0 z-[1] bg-background"
  const rows = table.getRowModel().rows

  return (
    <div
      data-slot="data-table"
      className={cn(stickyHeader && "[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto", className)}
    >
      <Table>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-[2] bg-background")}>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header, i) => (
                <TableHead key={header.id} aria-sort={ariaSort(header.column.getIsSorted())} className={cn(sticky(i))}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: loadingRows }, (_, r) => (
              <TableRow key={`loading-${r}`} data-loading>
                {Array.from({ length: colCount }, (_, c) => (
                  <TableCell key={c} className={cn(sticky(c))}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell key={cell.id} className={cn(sticky(i))}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">{emptyMessage}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function DataTableColumnHeader<TData, TValue>({ column, title }: { column: Column<TData, TValue>; title: string }) {
  if (!column.getCanSort()) return <>{title}</>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(sorted === "asc")}>
      {title}
      <Icon />
    </Button>
  )
}

export { DataTable, DataTableColumnHeader }
```

- [ ] **Step 5: Vue implementation**

`registry/vue/ui/data-table/utils.ts`:
```ts
import type { Updater } from "@tanstack/vue-table"

export function resolveUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(current) : updater
}

export function ariaSort(sorted: false | "asc" | "desc"): "ascending" | "descending" | undefined {
  return sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
}
```

`registry/vue/ui/data-table/DataTable.vue`:
```vue
<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, SortingState } from "@tanstack/vue-table"
import type { HTMLAttributes } from "vue"
import { FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/registry/vue/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"
import { ariaSort, resolveUpdater } from "./utils"

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back (v-model:sorting).
const props = withDefaults(defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  loading?: boolean
  loadingRows?: number
  emptyMessage?: string
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  sorting: () => [],
  loading: false,
  loadingRows: 5,
  emptyMessage: "Aucun résultat.",
  stickyHeader: false,
  stickyFirstColumn: false,
})
const emit = defineEmits<{ "update:sorting": [sorting: SortingState] }>()

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getRowId: props.getRowId,
  getCoreRowModel: getCoreRowModel(),
  manualSorting: true,
  state: { get sorting() { return props.sorting } },
  onSortingChange: (updater) => emit("update:sorting", resolveUpdater(updater, props.sorting)),
})
const colCount = computed(() => table.getVisibleLeafColumns().length)
const sticky = (index: number) => (props.stickyFirstColumn && index === 0 ? "sticky left-0 z-[1] bg-background" : "")
</script>

<template>
  <div
    data-slot="data-table"
    :class="cn(stickyHeader && '[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto', props.class)"
  >
    <Table>
      <TableHeader :class="cn(stickyHeader && 'sticky top-0 z-[2] bg-background')">
        <TableRow v-for="group in table.getHeaderGroups()" :key="group.id">
          <TableHead v-for="(header, i) in group.headers" :key="header.id" :aria-sort="ariaSort(header.column.getIsSorted())" :class="sticky(i)">
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="r in loadingRows" :key="`loading-${r}`" data-loading>
            <TableCell v-for="c in colCount" :key="c" :class="sticky(c - 1)"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="(cell, i) in row.getVisibleCells()" :key="cell.id" :class="sticky(i)">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="colCount" class="h-24 text-center text-muted-foreground">{{ emptyMessage }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
```

`registry/vue/ui/data-table/DataTableColumnHeader.vue`:
```vue
<script setup lang="ts" generic="TData, TValue">
import type { Column } from "@tanstack/vue-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "@lucide/vue"
import { computed } from "vue"
import { Button } from "@/registry/vue/ui/button"

const props = defineProps<{ column: Column<TData, TValue>; title: string }>()
const icon = computed(() => {
  const sorted = props.column.getIsSorted()
  return sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
})
</script>

<template>
  <Button v-if="column.getCanSort()" variant="ghost" size="sm" class="-ml-3 h-8" @click="column.toggleSorting(column.getIsSorted() === 'asc')">
    {{ title }}
    <component :is="icon" />
  </Button>
  <template v-else>{{ title }}</template>
</template>
```

`registry/vue/ui/data-table/index.ts`:
```ts
export { default as DataTable } from "./DataTable.vue"
export { default as DataTableColumnHeader } from "./DataTableColumnHeader.vue"
export { ariaSort, resolveUpdater } from "./utils"
```

- [ ] **Step 6: Manifest items** — upsert (keep alphabetical order via `upsertItem`) with a one-off `node -e` using `scripts/lib/manifest.ts`:

React item:
```json
{ "name": "data-table", "type": "registry:ui", "title": "Data Table",
  "description": "Table TanStack à tri contrôlé, chargement et état vide (Saqara).",
  "dependencies": ["@tanstack/react-table", "cn", "lucide-react"],
  "registryDependencies": ["@saqara/button", "@saqara/skeleton", "@saqara/table"],
  "files": [{ "path": "registry/react/ui/data-table.tsx", "type": "registry:ui" }] }
```
Vue item:
```json
{ "name": "data-table", "type": "registry:ui", "title": "Data Table",
  "description": "Table TanStack à tri contrôlé, chargement et état vide (Saqara).",
  "dependencies": ["@tanstack/vue-table", "@lucide/vue"],
  "registryDependencies": ["@saqara/button", "@saqara/skeleton", "@saqara/table"],
  "files": [
    { "path": "registry/vue/ui/data-table/DataTable.vue", "type": "registry:ui" },
    { "path": "registry/vue/ui/data-table/DataTableColumnHeader.vue", "type": "registry:ui" },
    { "path": "registry/vue/ui/data-table/utils.ts", "type": "registry:ui" },
    { "path": "registry/vue/ui/data-table/index.ts", "type": "registry:ui" }
  ] }
```

- [ ] **Step 7:** `npx vitest run tests/data-table.test.ts` → PASS (10 tests).

- [ ] **Step 8: Demos**

`src/react/demos/data-table.tsx`:
```tsx
import { useMemo, useState } from "react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { DataTable, DataTableColumnHeader } from "@/registry/react/ui/data-table"

type Company = { siren: string; name: string; city: string; score: number }
const companies: Company[] = [
  { siren: "552 100 554", name: "Bâti Sud SAS", city: "Lyon", score: 16 },
  { siren: "402 812 377", name: "Élec Rhône", city: "Villeurbanne", score: 12 },
  { siren: "318 455 902", name: "Plomberie Dupuis", city: "Vienne", score: 18 },
]
const columns: ColumnDef<Company>[] = [
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Raison sociale" /> },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => <DataTableColumnHeader column={column} title="Ville" /> },
  { accessorKey: "score", header: ({ column }) => <DataTableColumnHeader column={column} title="Note" />,
    cell: ({ row }) => <Badge variant={row.original.score >= 15 ? "success" : "warning"}>{row.original.score}/20</Badge> },
]

export default function DataTableDemo() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [loading, setLoading] = useState(false)
  // The demo sorts client-side; a real page would pass `sorting` to its API.
  const data = useMemo(() => {
    const [s] = sorting
    if (!s) return companies
    const key = s.id as keyof Company
    return [...companies].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "fr", { numeric: true }) * (s.desc ? -1 : 1))
  }, [sorting])
  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={() => setLoading((l) => !l)}>{loading ? "Afficher les données" : "Simuler le chargement"}</Button>
      <DataTable columns={columns} data={data} getRowId={(c) => c.siren} sorting={sorting} onSortingChange={setSorting}
        loading={loading} stickyHeader stickyFirstColumn className="max-h-72 rounded-md border" />
    </div>
  )
}
```

`src/vue/demos/data-table.vue`:
```vue
<script setup lang="ts">
import type { ColumnDef, SortingState } from "@tanstack/vue-table"
import { computed, h, ref } from "vue"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { DataTable, DataTableColumnHeader } from "@/registry/vue/ui/data-table"

type Company = { siren: string; name: string; city: string; score: number }
const companies: Company[] = [
  { siren: "552 100 554", name: "Bâti Sud SAS", city: "Lyon", score: 16 },
  { siren: "402 812 377", name: "Élec Rhône", city: "Villeurbanne", score: 12 },
  { siren: "318 455 902", name: "Plomberie Dupuis", city: "Vienne", score: 18 },
]
const columns: ColumnDef<Company>[] = [
  { accessorKey: "name", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Raison sociale" }) },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Ville" }) },
  { accessorKey: "score", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Note" }),
    cell: ({ row }) => h(Badge, { variant: row.original.score >= 15 ? "success" : "warning" }, () => `${row.original.score}/20`) },
]
const sorting = ref<SortingState>([{ id: "name", desc: false }])
const loading = ref(false)
// The demo sorts client-side; a real page would pass `sorting` to its API.
const data = computed(() => {
  const [s] = sorting.value
  if (!s) return companies
  const key = s.id as keyof Company
  return [...companies].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "fr", { numeric: true }) * (s.desc ? -1 : 1))
})
</script>

<template>
  <div class="space-y-2">
    <Button variant="outline" size="sm" @click="loading = !loading">{{ loading ? "Afficher les données" : "Simuler le chargement" }}</Button>
    <DataTable v-model:sorting="sorting" :columns="columns" :data="data" :get-row-id="(c) => c.siren" :loading="loading"
      sticky-header sticky-first-column class="max-h-72 rounded-md border" />
  </div>
</template>
```

- [ ] **Step 9: Verify** — `npm run check && npm run build && npm run smoke`. Check that `registry/vue/ui/table/Table.vue`'s container also carries `data-slot="table-container"` (the sticky-header selector depends on it); if it uses another slot name, use that name in both DataTables and ledger the ruling.

- [ ] **Step 10: Commit & push** — `feat: add Saqara data-table (React + Vue)`.

---

### Task 3: `multi-select` (React + Vue)

**Files:**
- Create: `registry/react/ui/multi-select.tsx`, `registry/vue/ui/multi-select/{MultiSelect.vue,utils.ts,index.ts}`, `tests/multi-select.test.ts`, demos
- Modify: manifests

**Interfaces:** `type MultiSelectOption = { value: string; label: string }`; `toggleValue(values: string[], value: string): string[]`; `splitBadges<T>(selected: T[], max: number): { shown: T[]; hidden: number }`. React props: `options, value, onValueChange, placeholder, searchPlaceholder, emptyMessage, clearLabel, maxBadges, disabled, className`. Vue: same with `v-model` (`string[]`) and `class`.

- [ ] **Step 1: Failing test** — `tests/multi-select.test.ts`:

```ts
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { MultiSelect as ReactMultiSelect, splitBadges as reactSplit, toggleValue as reactToggle } from "../registry/react/ui/multi-select"
import { MultiSelect as VueMultiSelect, splitBadges as vueSplit, toggleValue as vueToggle } from "../registry/vue/ui/multi-select"

const options = ["69", "75", "13", "33", "59"].map((v) => ({ value: v, label: `Dép. ${v}` }))
const helpers = { react: { toggleValue: reactToggle, splitBadges: reactSplit }, vue: { toggleValue: vueToggle, splitBadges: vueSplit } }
const render = {
  react: async (value: string[]) => renderToString(createElement(ReactMultiSelect, { options, value, onValueChange: () => {}, maxBadges: 3 })),
  vue: async (value: string[]) => renderVue(createSSRApp({ render: () => h(VueMultiSelect, { options, modelValue: value, maxBadges: 3 }) })),
}

describe.each(["react", "vue"] as const)("%s multi-select", (fw) => {
  it("toggles a value in and out, keeping the others", () => {
    expect(helpers[fw].toggleValue(["69"], "75")).toEqual(["69", "75"])
    expect(helpers[fw].toggleValue(["69", "75"], "69")).toEqual(["75"])
  })
  it("splits badges into shown and a +N count", () => {
    expect(helpers[fw].splitBadges([1, 2, 3, 4, 5], 3)).toEqual({ shown: [1, 2, 3], hidden: 2 })
    expect(helpers[fw].splitBadges([1], 3)).toEqual({ shown: [1], hidden: 0 })
  })
  it("shows the placeholder when nothing is selected", async () => {
    expect(await render[fw]([])).toContain("Sélectionner…")
  })
  it("shows 3 badges in options order and +2", async () => {
    const html = await render[fw](["59", "13", "69", "33", "75"])
    expect(html).toContain("+2")
    const order = ["Dép. 69", "Dép. 75", "Dép. 13"].map((l) => html.indexOf(l))
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(html).not.toContain("Dép. 33")
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/multi-select.test.ts` → FAIL (modules missing).

- [ ] **Step 3: React** — `registry/react/ui/multi-select.tsx`:

```tsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDown, XIcon } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/react/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/react/ui/popover"

export type MultiSelectOption = { value: string; label: string }

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

export function splitBadges<T>(selected: T[], max: number): { shown: T[]; hidden: number } {
  return { shown: selected.slice(0, max), hidden: Math.max(0, selected.length - max) }
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
  maxBadges?: number
  disabled?: boolean
  className?: string
}

function MultiSelect({
  options, value, onValueChange, placeholder = "Sélectionner…", searchPlaceholder = "Rechercher…",
  emptyMessage = "Aucun résultat.", clearLabel = "Tout effacer", maxBadges = 3, disabled = false, className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.filter((o) => value.includes(o.value))
  const { shown, hidden } = splitBadges(selected, maxBadges)
  const toggle = (v: string) => onValueChange(toggleValue(value, v))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} data-slot="multi-select"
          className={cn("h-auto min-h-9 w-full justify-between font-normal", className)}>
          <span className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {shown.map((o) => (
              <Badge key={o.value} variant="secondary">
                {o.label}
                <XIcon aria-hidden className="size-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggle(o.value) }} />
              </Badge>
            ))}
            {hidden > 0 && <Badge variant="outline">+{hidden}</Badge>}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                  <CheckIcon className={cn(value.includes(o.value) ? "opacity-100" : "opacity-0")} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {value.length > 0 && (
            <div className="border-t p-1">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => onValueChange([])}>{clearLabel}</Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
```

- [ ] **Step 4: Vue**

`registry/vue/ui/multi-select/utils.ts`:
```ts
export type MultiSelectOption = { value: string; label: string }

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

export function splitBadges<T>(selected: T[], max: number): { shown: T[]; hidden: number } {
  return { shown: selected.slice(0, max), hidden: Math.max(0, selected.length - max) }
}
```

`registry/vue/ui/multi-select/MultiSelect.vue`:
```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { MultiSelectOption } from "./utils"
import { CheckIcon, ChevronsUpDown, XIcon } from "@lucide/vue"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/vue/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/vue/ui/popover"
import { splitBadges, toggleValue } from "./utils"

const props = withDefaults(defineProps<{
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
  maxBadges?: number
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  placeholder: "Sélectionner…",
  searchPlaceholder: "Rechercher…",
  emptyMessage: "Aucun résultat.",
  clearLabel: "Tout effacer",
  maxBadges: 3,
  disabled: false,
})
const model = defineModel<string[]>({ default: () => [] })
const open = ref(false)
const selected = computed(() => props.options.filter((o) => model.value.includes(o.value)))
const badges = computed(() => splitBadges(selected.value, props.maxBadges))
const toggle = (value: string) => { model.value = toggleValue(model.value, value) }
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" role="combobox" :aria-expanded="open" :disabled="disabled" data-slot="multi-select"
        :class="cn('h-auto min-h-9 w-full justify-between font-normal', props.class)">
        <span class="flex flex-wrap gap-1">
          <span v-if="selected.length === 0" class="text-muted-foreground">{{ placeholder }}</span>
          <Badge v-for="o in badges.shown" :key="o.value" variant="secondary">
            {{ o.label }}
            <XIcon aria-hidden="true" class="size-3 cursor-pointer" @click.stop="toggle(o.value)" />
          </Badge>
          <Badge v-if="badges.hidden > 0" variant="outline">+{{ badges.hidden }}</Badge>
        </span>
        <ChevronsUpDown class="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-(--reka-popover-trigger-width) p-0" align="start">
      <Command>
        <CommandInput :placeholder="searchPlaceholder" />
        <CommandList>
          <CommandEmpty>{{ emptyMessage }}</CommandEmpty>
          <CommandGroup>
            <CommandItem v-for="o in options" :key="o.value" :value="o.label" @select="toggle(o.value)">
              <CheckIcon :class="model.includes(o.value) ? 'opacity-100' : 'opacity-0'" />
              {{ o.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <div v-if="model.length" class="border-t p-1">
          <Button variant="ghost" size="sm" class="w-full" @click="model = []">{{ clearLabel }}</Button>
        </div>
      </Command>
    </PopoverContent>
  </Popover>
</template>
```

`registry/vue/ui/multi-select/index.ts`:
```ts
export { default as MultiSelect } from "./MultiSelect.vue"
export { splitBadges, toggleValue, type MultiSelectOption } from "./utils"
```

- [ ] **Step 5: Manifest items**

React: `{ "name": "multi-select", "type": "registry:ui", "title": "Multi Select", "description": "Sélection multiple dans une liste fermée, avec recherche et badges (Saqara).", "dependencies": ["cn", "lucide-react"], "registryDependencies": ["@saqara/badge", "@saqara/button", "@saqara/command", "@saqara/popover"], "files": [{ "path": "registry/react/ui/multi-select.tsx", "type": "registry:ui" }] }`

Vue: same name/title/description, `"dependencies": ["@lucide/vue"]`, same registryDependencies, files `MultiSelect.vue`, `utils.ts`, `index.ts` under `registry/vue/ui/multi-select/`.

- [ ] **Step 6:** `npx vitest run tests/multi-select.test.ts` → PASS (8 tests).

- [ ] **Step 7: Demos**

`src/react/demos/multi-select.tsx`:
```tsx
import { useState } from "react"
import { MultiSelect } from "@/registry/react/ui/multi-select"

const departments = [
  ["01", "Ain"], ["13", "Bouches-du-Rhône"], ["33", "Gironde"], ["38", "Isère"], ["42", "Loire"],
  ["59", "Nord"], ["69", "Rhône"], ["75", "Paris"],
].map(([value, name]) => ({ value, label: `${value} — ${name}` }))

export default function MultiSelectDemo() {
  const [value, setValue] = useState(["69", "38"])
  return <MultiSelect className="max-w-sm" options={departments} value={value} onValueChange={setValue} placeholder="Départements" />
}
```

`src/vue/demos/multi-select.vue`:
```vue
<script setup lang="ts">
import { ref } from "vue"
import { MultiSelect } from "@/registry/vue/ui/multi-select"

const departments = [
  ["01", "Ain"], ["13", "Bouches-du-Rhône"], ["33", "Gironde"], ["38", "Isère"], ["42", "Loire"],
  ["59", "Nord"], ["69", "Rhône"], ["75", "Paris"],
].map(([value, name]) => ({ value, label: `${value} — ${name}` }))
const value = ref(["69", "38"])
</script>

<template>
  <MultiSelect v-model="value" class="max-w-sm" :options="departments" placeholder="Départements" />
</template>
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add Saqara multi-select (React + Vue)`.

---

### Task 4: `stepper` (React Saqara + Vue vendored)

**Files:**
- Generated: `registry/vue/ui/stepper/*` (vendor Vue only)
- Create: `registry/react/ui/stepper.tsx`, `tests/stepper.test.ts`, demos
- Modify: `registry.react.json` (hand-added item)

**Interfaces (React):** `stepState(step: number, value: number, completed?: boolean): "completed" | "active" | "inactive"`; `moveIndex(current: number, delta: number, count: number): number`; components `Stepper` (`value?`, `defaultValue = 1`, `onValueChange?`, `orientation = "horizontal"`, `linear = true`), `StepperItem` (`step`, `completed?`, `disabled?`), `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperDescription`, `StepperSeparator`. Attributes: item `data-state`, `data-disabled`; trigger `data-slot="stepper-trigger"`, `aria-current="step"` when active.

- [ ] **Step 1: Vendor Vue only**

```bash
node -e '
import("./scripts/lib/vendor.ts").then(async ({ plan, UPSTREAM }) => {
  const { readManifest, upsertItem, writeManifest } = await import("./scripts/lib/manifest.ts")
  const fs = await import("node:fs"), path = await import("node:path")
  const up = await (await fetch(UPSTREAM.vue + "/stepper.json")).json()
  const { files, item } = plan(up, "vue", fs.existsSync, false)
  for (const f of files) { fs.mkdirSync(path.dirname(f.path), { recursive: true }); fs.writeFileSync(f.path, f.content) }
  writeManifest("registry.vue.json", upsertItem(readManifest("registry.vue.json"), item))
  console.log(item.name, files.length)
})'
```
Expected: `stepper 8`.

- [ ] **Step 2: Failing test** — `tests/stepper.test.ts`:

```ts
import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/stepper"
import * as V from "../registry/vue/ui/stepper"

describe("react stepper logic", () => {
  it("derives the state of a step from the current value", () => {
    expect([1, 2, 3].map((s) => R.stepState(s, 2))).toEqual(["completed", "active", "inactive"])
    expect(R.stepState(3, 2, true)).toBe("completed")
  })
  it("wraps keyboard focus around the triggers", () => {
    expect([R.moveIndex(0, 1, 3), R.moveIndex(2, 1, 3), R.moveIndex(0, -1, 3)]).toEqual([1, 0, 2])
  })
})

const states = (html: string) => [...html.matchAll(/data-state="(\w+)"/g)].map((m) => m[1])

describe("stepper parity", () => {
  it("renders completed, active, inactive for value 2 in both frameworks", async () => {
    const react = renderToString(
      e(R.Stepper, { value: 2 }, [1, 2, 3].map((step) =>
        e(R.StepperItem, { key: step, step }, e(R.StepperTrigger, null, e(R.StepperIndicator, null, step))))),
    )
    const vue = await renderVue(createSSRApp({
      render: () => h(V.Stepper, { modelValue: 2 }, () => [1, 2, 3].map((step) =>
        h(V.StepperItem, { key: step, step }, () => h(V.StepperTrigger, null, () => h(V.StepperIndicator, null, () => String(step)))))),
    }))
    expect(states(react)).toEqual(["completed", "active", "inactive"])
    expect(states(vue).filter((_, i, all) => all.length === 3 || i % 2 === 0).slice(0, 3)).toEqual(["completed", "active", "inactive"])
  })
})
```

(The Vue filter tolerates Reka putting `data-state` on both item and trigger: if more than three states render, it keeps the item ones. If the Vue assertion fails with a different layout, print `states(vue)`, adjust only the extraction — never the expected states — and ledger it.)

- [ ] **Step 3:** `npx vitest run tests/stepper.test.ts` → FAIL (React module missing).

- [ ] **Step 4: React** — `registry/react/ui/stepper.tsx`:

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"

// Saqara: React port of the shadcn-vue (Reka UI) Stepper API. Steps are 1-based.
export type StepState = "completed" | "active" | "inactive"

export function stepState(step: number, value: number, completed?: boolean): StepState {
  if (completed || step < value) return "completed"
  return step === value ? "active" : "inactive"
}

export function moveIndex(current: number, delta: number, count: number): number {
  return (current + delta + count) % count
}

type StepperContextValue = { value: number; setValue: (value: number) => void; orientation: "horizontal" | "vertical"; linear: boolean }
type StepperItemContextValue = { step: number; state: StepState; disabled: boolean }

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext = React.createContext<StepperItemContextValue | null>(null)

function useRequired<T>(context: React.Context<T | null>, name: string): T {
  const value = React.useContext(context)
  if (!value) throw new Error(`${name} must be used within <Stepper> / <StepperItem>`)
  return value
}

type StepperProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  linear?: boolean
}

function Stepper({ value: valueProp, defaultValue = 1, onValueChange, orientation = "horizontal", linear = true, className, onKeyDown, ...props }: StepperProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const setValue = (next: number) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const keys: Record<string, number> = orientation === "horizontal" ? { ArrowRight: 1, ArrowLeft: -1 } : { ArrowDown: 1, ArrowUp: -1 }

  return (
    <StepperContext.Provider value={{ value, setValue, orientation, linear }}>
      <div
        data-slot="stepper"
        data-orientation={orientation}
        className={cn("flex gap-2", orientation === "vertical" && "flex-col", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          const delta = keys[event.key]
          if (!delta) return
          const triggers = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-slot="stepper-trigger"]:not(:disabled)')]
          const index = triggers.indexOf(document.activeElement as HTMLButtonElement)
          if (index === -1) return
          event.preventDefault()
          triggers[moveIndex(index, delta, triggers.length)]?.focus()
        }}
        {...props}
      />
    </StepperContext.Provider>
  )
}

type StepperItemProps = React.ComponentProps<"div"> & { step: number; completed?: boolean; disabled?: boolean }

function StepperItem({ step, completed, disabled = false, className, ...props }: StepperItemProps) {
  const { value } = useRequired(StepperContext, "StepperItem")
  const state = stepState(step, value, completed)
  return (
    <StepperItemContext.Provider value={{ step, state, disabled }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled ? "" : undefined}
        className={cn("group flex items-center gap-2 data-[disabled]:pointer-events-none", className)}
        {...props}
      />
    </StepperItemContext.Provider>
  )
}

function StepperTrigger({ className, ...props }: React.ComponentProps<"button">) {
  const { value, setValue, linear } = useRequired(StepperContext, "StepperTrigger")
  const { step, state, disabled } = useRequired(StepperItemContext, "StepperTrigger")
  return (
    <button
      type="button"
      data-slot="stepper-trigger"
      aria-current={state === "active" ? "step" : undefined}
      disabled={disabled || (linear && step > value)}
      onClick={() => setValue(step)}
      className={cn("flex flex-col items-center gap-1 rounded-md p-1 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
      {...props}
    />
  )
}

function StepperIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-indicator"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/50",
        "group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50",
        "group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground",
        "group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return <h4 data-slot="stepper-title" className={cn("text-md font-semibold whitespace-nowrap", className)} {...props} />
}

function StepperDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="stepper-description" className={cn("text-xs text-muted-foreground", className)} {...props} />
}

function StepperSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-separator"
      aria-hidden
      className={cn(
        "bg-muted group-data-[disabled]:bg-muted group-data-[disabled]:opacity-50 group-data-[state=completed]:bg-accent",
        className,
      )}
      {...props}
    />
  )
}

export { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger }
```

- [ ] **Step 5: Manifest item (React)** — `{ "name": "stepper", "type": "registry:ui", "title": "Stepper", "description": "Étapes numérotées, API identique au Stepper shadcn-vue (Saqara).", "dependencies": ["cn"], "files": [{ "path": "registry/react/ui/stepper.tsx", "type": "registry:ui" }] }`

- [ ] **Step 6:** `npx vitest run tests/stepper.test.ts` → PASS (3 tests).

- [ ] **Step 7: Demos**

`src/react/demos/stepper.tsx`:
```tsx
import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/react/ui/stepper"

const steps = [
  { step: 1, title: "Entreprise", description: "SIREN et raison sociale" },
  { step: 2, title: "Contacts", description: "Interlocuteurs" },
  { step: 3, title: "Validation", description: "Récapitulatif" },
]

export default function StepperDemo() {
  const [value, setValue] = useState(2)
  return (
    <div className="space-y-4">
      <Stepper value={value} onValueChange={setValue} className="w-full max-w-xl items-start">
        {steps.map((s) => (
          <StepperItem key={s.step} step={s.step} className="relative flex-1 flex-col">
            <StepperTrigger>
              <StepperIndicator>{s.step < value ? <Check className="size-4" /> : s.step}</StepperIndicator>
              <StepperTitle>{s.title}</StepperTitle>
              <StepperDescription>{s.description}</StepperDescription>
            </StepperTrigger>
            {s.step < steps.length && <StepperSeparator className="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />}
          </StepperItem>
        ))}
      </Stepper>
      <div className="flex gap-2">
        <Button variant="outline" disabled={value === 1} onClick={() => setValue(value - 1)}>Précédent</Button>
        <Button disabled={value === steps.length} onClick={() => setValue(value + 1)}>Suivant</Button>
      </div>
    </div>
  )
}
```

`src/vue/demos/stepper.vue`:
```vue
<script setup lang="ts">
import { Check } from "@lucide/vue"
import { ref } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/vue/ui/stepper"

const steps = [
  { step: 1, title: "Entreprise", description: "SIREN et raison sociale" },
  { step: 2, title: "Contacts", description: "Interlocuteurs" },
  { step: 3, title: "Validation", description: "Récapitulatif" },
]
const value = ref(2)
</script>

<template>
  <div class="space-y-4">
    <Stepper v-model="value" class="w-full max-w-xl items-start">
      <StepperItem v-for="s in steps" :key="s.step" :step="s.step" class="relative flex-1 flex-col">
        <StepperTrigger>
          <StepperIndicator><Check v-if="s.step < value" class="size-4" /><template v-else>{{ s.step }}</template></StepperIndicator>
          <StepperTitle>{{ s.title }}</StepperTitle>
          <StepperDescription>{{ s.description }}</StepperDescription>
        </StepperTrigger>
        <StepperSeparator v-if="s.step < steps.length" class="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />
      </StepperItem>
    </Stepper>
    <div class="flex gap-2">
      <Button variant="outline" :disabled="value === 1" @click="value--">Précédent</Button>
      <Button :disabled="value === steps.length" @click="value++">Suivant</Button>
    </div>
  </div>
</template>
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add stepper (React port + Vue)`.

---

### Task 5: `file-dropzone` (React + Vue)

**Files:**
- Create: `registry/react/ui/file-dropzone.tsx`, `registry/vue/ui/file-dropzone/{FileDropzone.vue,utils.ts,index.ts}`, `tests/file-dropzone.test.ts`, demos
- Modify: manifests

**Interfaces:** `type FileRejection = { file: File; reason: "type" | "size" }`; `matchesAccept(file: { name: string; type: string }, accept?: string): boolean`; `partitionFiles(files: File[], opts: { accept?: string; maxSize?: number }): { accepted: File[]; rejected: FileRejection[] }`. React props: `accept, maxSize, multiple = false, files, onFilesChange, onReject, disabled, label, removeLabel, className`. Vue: `v-model:files`, `@reject`, same other props.

- [ ] **Step 1: Failing test** — `tests/file-dropzone.test.ts`:

```ts
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/file-dropzone"
import * as V from "../registry/vue/ui/file-dropzone"

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type })
const xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

describe.each([["react", R], ["vue", V]] as const)("%s file-dropzone", (fw, m) => {
  it("matches extensions case-insensitively, wildcards and exact MIME types", () => {
    expect(m.matchesAccept({ name: "IMPORT.XLSX", type: xlsx }, ".xlsx")).toBe(true)
    expect(m.matchesAccept({ name: "logo.png", type: "image/png" }, "image/*")).toBe(true)
    expect(m.matchesAccept({ name: "logo.svg", type: "image/svg+xml" }, "image/png, image/svg+xml")).toBe(true)
    expect(m.matchesAccept({ name: "notes.txt", type: "text/plain" }, ".xlsx,image/*")).toBe(false)
    expect(m.matchesAccept({ name: "anything.bin", type: "" }, undefined)).toBe(true)
  })
  it("partitions files by type first, then size", () => {
    const ok = file("logo.png", "image/png", 100)
    const big = file("photo.jpg", "image/jpeg", 3000)
    const wrong = file("cv.pdf", "application/pdf", 100)
    const { accepted, rejected } = m.partitionFiles([ok, big, wrong], { accept: "image/*", maxSize: 2000 })
    expect(accepted).toEqual([ok])
    expect(rejected).toEqual([{ file: big, reason: "size" }, { file: wrong, reason: "type" }])
  })
  it("renders the label and the chosen files", async () => {
    const files = [file("fournisseurs.xlsx", xlsx)]
    const html = fw === "react"
      ? renderToString(createElement(R.FileDropzone, { files, onFilesChange: () => {} }))
      : await renderVue(createSSRApp({ render: () => h(V.FileDropzone, { files }) }))
    expect(html).toContain("Glissez un fichier ici ou cliquez pour parcourir")
    expect(html).toContain("fournisseurs.xlsx")
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/file-dropzone.test.ts` → FAIL.

- [ ] **Step 3: React** — `registry/react/ui/file-dropzone.tsx`:

```tsx
"use client"

import * as React from "react"
import { UploadIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"

export type FileRejection = { file: File; reason: "type" | "size" }

// `accept` follows the <input accept> syntax: extensions (.xlsx), wildcards (image/*) and exact MIME types.
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean).some((rule) =>
    rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule,
  )
}

export function partitionFiles(files: File[], { accept, maxSize }: { accept?: string; maxSize?: number }) {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  for (const file of files) {
    if (!matchesAccept(file, accept)) rejected.push({ file, reason: "type" })
    else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size" })
    else accepted.push(file)
  }
  return { accepted, rejected }
}

type FileDropzoneProps = {
  files: File[]
  onFilesChange: (files: File[]) => void
  onReject?: (rejections: FileRejection[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  label?: React.ReactNode
  removeLabel?: string
  className?: string
}

// Saqara: selection + validation only; the app uploads and shows its own progress.
function FileDropzone({
  files, onFilesChange, onReject, accept, maxSize, multiple = false, disabled = false,
  label = "Glissez un fichier ici ou cliquez pour parcourir", removeLabel = "Retirer", className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const add = (list: FileList | null) => {
    if (!list || disabled) return
    const { accepted, rejected } = partitionFiles([...list], { accept, maxSize })
    if (rejected.length) onReject?.(rejected)
    if (accepted.length) onFilesChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1))
  }

  return (
    <div data-slot="file-dropzone" className={cn("grid gap-2", className)}>
      <button
        type="button"
        disabled={disabled}
        data-dragging={dragging ? "" : undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files) }}
        className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-6 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[dragging]:border-primary data-[dragging]:bg-accent"
      >
        <UploadIcon className="size-5" />
        {label}
      </button>
      <input ref={inputRef} type="file" hidden accept={accept} multiple={multiple} disabled={disabled}
        onChange={(e) => { add(e.target.files); e.target.value = "" }} />
      {files.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5">
              <span className="truncate">{file.name}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`${removeLabel} ${file.name}`}
                onClick={() => onFilesChange(files.filter((_, j) => j !== i))}>
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileDropzone }
```

- [ ] **Step 4: Vue**

`registry/vue/ui/file-dropzone/utils.ts`: the exact `FileRejection` type, `matchesAccept` and `partitionFiles` from Step 3 (copy verbatim, same comment).

`registry/vue/ui/file-dropzone/FileDropzone.vue`:
```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { FileRejection } from "./utils"
import { UploadIcon, XIcon } from "@lucide/vue"
import { ref } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"
import { partitionFiles } from "./utils"

// Saqara: selection + validation only; the app uploads and shows its own progress.
const props = withDefaults(defineProps<{
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  label?: string
  removeLabel?: string
  class?: HTMLAttributes["class"]
}>(), {
  multiple: false,
  disabled: false,
  label: "Glissez un fichier ici ou cliquez pour parcourir",
  removeLabel: "Retirer",
})
const files = defineModel<File[]>("files", { default: () => [] })
const emit = defineEmits<{ reject: [rejections: FileRejection[]] }>()
const input = ref<HTMLInputElement>()
const dragging = ref(false)

function add(list: FileList | null | undefined) {
  if (!list || props.disabled) return
  const { accepted, rejected } = partitionFiles([...list], { accept: props.accept, maxSize: props.maxSize })
  if (rejected.length) emit("reject", rejected)
  if (accepted.length) files.value = props.multiple ? [...files.value, ...accepted] : accepted.slice(0, 1)
}
function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  add(target.files)
  target.value = ""
}
function onDrop(event: DragEvent) {
  dragging.value = false
  add(event.dataTransfer?.files)
}
</script>

<template>
  <div data-slot="file-dropzone" :class="cn('grid gap-2', props.class)">
    <button
      type="button"
      :disabled="disabled"
      :data-dragging="dragging ? '' : undefined"
      class="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-6 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[dragging]:border-primary data-[dragging]:bg-accent"
      @click="input?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <UploadIcon class="size-5" />
      {{ label }}
    </button>
    <input ref="input" type="file" hidden :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange">
    <ul v-if="files.length" class="grid gap-1 text-sm">
      <li v-for="(file, i) in files" :key="`${file.name}-${i}`" class="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5">
        <span class="truncate">{{ file.name }}</span>
        <Button type="button" variant="ghost" size="icon" class="size-7" :aria-label="`${removeLabel} ${file.name}`" @click="files = files.filter((_, j) => j !== i)">
          <XIcon />
        </Button>
      </li>
    </ul>
  </div>
</template>
```

`registry/vue/ui/file-dropzone/index.ts`:
```ts
export { default as FileDropzone } from "./FileDropzone.vue"
export { matchesAccept, partitionFiles, type FileRejection } from "./utils"
```

- [ ] **Step 5: Manifest items** — React: `{ "name": "file-dropzone", "type": "registry:ui", "title": "File Dropzone", "description": "Sélection de fichiers par clic ou glisser-déposer, avec validation type/taille (Saqara).", "dependencies": ["cn", "lucide-react"], "registryDependencies": ["@saqara/button"], "files": [{ "path": "registry/react/ui/file-dropzone.tsx", "type": "registry:ui" }] }`. Vue: same with `"dependencies": ["@lucide/vue"]` and the three files under `registry/vue/ui/file-dropzone/`.

- [ ] **Step 6:** `npx vitest run tests/file-dropzone.test.ts` → PASS (6 tests).

- [ ] **Step 7: Demos**

`src/react/demos/file-dropzone.tsx`:
```tsx
import { useState } from "react"
import { toast } from "sonner"
import { FileDropzone, type FileRejection } from "@/registry/react/ui/file-dropzone"

const reasons = { type: "format non accepté", size: "fichier trop lourd (2 Mo max.)" }

export default function FileDropzoneDemo() {
  const [files, setFiles] = useState<File[]>([])
  const onReject = (rejections: FileRejection[]) =>
    rejections.forEach(({ file, reason }) => toast.error(`${file.name} : ${reasons[reason]}`))
  return (
    <FileDropzone className="max-w-md" accept="image/png,image/jpeg,image/webp,image/svg+xml" maxSize={2 * 1024 * 1024}
      files={files} onFilesChange={setFiles} onReject={onReject} label="Déposez votre logo (PNG, JPEG, WebP, SVG — 2 Mo max.)" />
  )
}
```

`src/vue/demos/file-dropzone.vue`:
```vue
<script setup lang="ts">
import { ref } from "vue"
import { toast } from "vue-sonner"
import { FileDropzone, type FileRejection } from "@/registry/vue/ui/file-dropzone"

const reasons = { type: "format non accepté", size: "fichier trop lourd (2 Mo max.)" }
const files = ref<File[]>([])
const onReject = (rejections: FileRejection[]) =>
  rejections.forEach(({ file, reason }) => toast.error(`${file.name} : ${reasons[reason]}`))
</script>

<template>
  <FileDropzone v-model:files="files" class="max-w-md" accept="image/png,image/jpeg,image/webp,image/svg+xml" :max-size="2 * 1024 * 1024"
    label="Déposez votre logo (PNG, JPEG, WebP, SVG — 2 Mo max.)" @reject="onReject" />
</template>
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add Saqara file-dropzone (React + Vue)`.

---

### Task 6: `stat-card` (React + Vue), docs

**Files:**
- Create: `registry/react/ui/stat-card.tsx`, `registry/vue/ui/stat-card/{StatCard.vue,index.ts}`, `tests/stat-card.test.ts`, demos
- Modify: manifests, `README.md`, `CHANGELOG.md`

- [ ] **Step 1: Failing test** — `tests/stat-card.test.ts`:

```ts
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { StatCard as ReactStatCard } from "../registry/react/ui/stat-card"
import { StatCard as VueStatCard } from "../registry/vue/ui/stat-card"

describe("stat-card", () => {
  it.each([
    ["react", () => Promise.resolve(renderToString(createElement(ReactStatCard, { label: "Évaluations", value: "128", description: "+12 ce mois-ci" })))],
    ["vue", () => renderVue(createSSRApp({ render: () => h(VueStatCard, { label: "Évaluations", value: "128", description: "+12 ce mois-ci" }) }))],
  ])("%s renders label, value and description", async (_, render) => {
    const html = await render()
    expect(html).toContain("Évaluations")
    expect(html).toContain("128")
    expect(html).toContain("+12 ce mois-ci")
    expect(html).toContain('data-slot="stat-card"')
  })
})
```

- [ ] **Step 2:** `npx vitest run tests/stat-card.test.ts` → FAIL.

- [ ] **Step 3: Implement**

`registry/react/ui/stat-card.tsx`:
```tsx
import * as React from "react"
import { cn } from "cn"
import { Card, CardContent, CardDescription, CardHeader } from "@/registry/react/ui/card"

type StatCardProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}

function StatCard({ label, value, description, icon, className, ...props }: StatCardProps) {
  return (
    <Card data-slot="stat-card" className={cn("gap-2 py-4", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
        <CardDescription>{label}</CardDescription>
        {icon && <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>}
      </CardHeader>
      <CardContent className="px-4">
        <div className="font-heading text-2xl font-semibold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

export { StatCard }
```

`registry/vue/ui/stat-card/StatCard.vue`:
```vue
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader } from "@/registry/vue/ui/card"

const props = defineProps<{ label: string; value: string | number; description?: string; class?: HTMLAttributes["class"] }>()
</script>

<template>
  <Card data-slot="stat-card" :class="cn('gap-2 py-4', props.class)">
    <CardHeader class="flex flex-row items-center justify-between gap-2 px-4">
      <CardDescription>{{ label }}</CardDescription>
      <span v-if="$slots.icon" class="text-muted-foreground [&_svg]:size-4"><slot name="icon" /></span>
    </CardHeader>
    <CardContent class="px-4">
      <div class="font-heading text-2xl font-semibold">{{ value }}</div>
      <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
    </CardContent>
  </Card>
</template>
```

`registry/vue/ui/stat-card/index.ts`: `export { default as StatCard } from "./StatCard.vue"`

- [ ] **Step 4: Manifest items** — React: `{ "name": "stat-card", "type": "registry:ui", "title": "Stat Card", "description": "Carte d'indicateur : libellé, valeur, précision, icône (Saqara).", "dependencies": ["cn"], "registryDependencies": ["@saqara/card"], "files": [{ "path": "registry/react/ui/stat-card.tsx", "type": "registry:ui" }] }`. Vue: same, no `dependencies`, files `StatCard.vue` and `index.ts`.

- [ ] **Step 5:** `npx vitest run tests/stat-card.test.ts` → PASS (2 tests).

- [ ] **Step 6: Demos**

`src/react/demos/stat-card.tsx`:
```tsx
import { ClipboardCheck, Leaf, Users } from "lucide-react"
import { StatCard } from "@/registry/react/ui/stat-card"

export default function StatCardDemo() {
  return (
    <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
      <StatCard label="Évaluations" value="128" description="+12 ce mois-ci" icon={<ClipboardCheck />} />
      <StatCard label="Note RSE moyenne" value="14,2/20" icon={<Leaf />} />
      <StatCard label="Fournisseurs actifs" value="342" icon={<Users />} />
    </div>
  )
}
```

`src/vue/demos/stat-card.vue`:
```vue
<script setup lang="ts">
import { ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { StatCard } from "@/registry/vue/ui/stat-card"
</script>

<template>
  <div class="grid max-w-2xl gap-3 sm:grid-cols-3">
    <StatCard label="Évaluations" value="128" description="+12 ce mois-ci"><template #icon><ClipboardCheck /></template></StatCard>
    <StatCard label="Note RSE moyenne" value="14,2/20"><template #icon><Leaf /></template></StatCard>
    <StatCard label="Fournisseurs actifs" value="342"><template #icon><Users /></template></StatCard>
  </div>
</template>
```

- [ ] **Step 7: Docs**

`CHANGELOG.md` (top): `- 2026-09-25 — Lot 3 : \`table\`, \`pagination\`, \`slider\`, \`sidebar\`, \`stepper\`, et les composants Saqara \`data-table\` (tri contrôlé), \`multi-select\`, \`file-dropzone\`, \`stat-card\`.`

`README.md`, after the root-elements list:
```markdown
Composants Saqara (lot 3) :
- `data-table` : le tri est toujours contrôlé par la page (`sorting` + `onSortingChange`, Vue `v-model:sorting`) ; pour l'en-tête collant, donner une hauteur max (`className="max-h-96"`).
- `stepper` : étapes numérotées à partir de 1 ; avec `linear` (défaut), on ne peut revenir qu'aux étapes précédentes.
- `file-dropzone` : sélection et validation seulement, l'app gère l'envoi.
```

- [ ] **Step 8: Verify** — `npm run check && npm run build && npm run smoke`; commit & push `feat: add stat-card (React + Vue); document lot 3`; watch CI.
