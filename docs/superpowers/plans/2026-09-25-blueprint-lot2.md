# Blueprint — Lot 2 (overlays & navigation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the 11 Lot 2 components (React + Vue) to the registry, with French demos, Sonner adapted to Saqara apps.

**Architecture:** Same pipeline as Lot 1: `npm run vendor -- <names>` copies upstream items into `registry/{react,vue}/`, demos go in `src/{react,vue}/demos/`, `npm run check` (parity, tests incl. SSR render of every demo, types) and `npm run smoke` (real consumer installs) gate each task.

**Tech Stack:** unchanged (see `docs/superpowers/plans/2026-09-25-blueprint-lot0-lot1.md`).

**Spec:** `docs/superpowers/specs/2026-09-25-blueprint-design.md` (§5 Lot 2, Sonner note)

## Global Constraints

- Work directly on `main` (user decision, 2026-09-25); push after each task so CI + Pages run.
- Every item exists in both manifests with a demo in each framework (`check-parity`).
- Every demo must render under SSR (`tests/demos.test.ts`); overlays render closed, that is fine.
- Showcase copy in French, code in English.
- Customized upstream files are protected: re-vendor only with `--force`.

## Review Focus

1. **Command depends on Dialog** — vendoring `command` without `dialog` in the manifest must fail `check`; Task 1 vendors `dialog` first.
2. **React Toaster without `next-themes`** — installing `@saqara/sonner` must not pull `next-themes`; pinned by `tests/sonner.test.ts` (Task 3).
3. **Vue toasts unstyled** — `vue-sonner` v2 needs its stylesheet; our `Sonner.vue` imports it so consumers get styled toasts; pinned by `tests/sonner.test.ts`.
4. **Providers** — Tooltip needed `TooltipProvider`; any Lot 2 demo needing a provider/context is caught by the SSR render test.
5. **Consumer install of the 11 new items** — `npm run smoke` after each task.

---

### Task 1: Overlays — dialog, alert-dialog, sheet, popover, dropdown-menu

**Files:**
- Generated: `registry/{react,vue}/ui/{dialog,alert-dialog,sheet,popover,dropdown-menu}*`, manifest items
- Create: `src/react/demos/{dialog,alert-dialog,sheet,popover,dropdown-menu}.tsx`, `src/vue/demos/{same}.vue`

- [ ] **Step 1: Vendor** — `npm run vendor -- dialog alert-dialog sheet popover dropdown-menu`; run the printed `npm i …` line if any.

- [ ] **Step 2: React demos**

`src/react/demos/dialog.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/react/ui/dialog"
import { Input } from "@/registry/react/ui/input"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Ajouter un contact</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau contact</DialogTitle>
          <DialogDescription>Le contact sera visible par toute l'organisation.</DialogDescription>
        </DialogHeader>
        <Input placeholder="Nom et prénom" />
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
          <Button>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

`src/react/demos/alert-dialog.tsx`:
```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/registry/react/ui/alert-dialog"
import { Button } from "@/registry/react/ui/button"

export default function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="destructive">Supprimer l'agence</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'agence Lyon Sud ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

`src/react/demos/sheet.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/react/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Voir la fiche</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bâti Sud SAS</SheetTitle>
          <SheetDescription>SIREN 552 100 554 — Lyon</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
```

`src/react/demos/popover.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/react/ui/popover"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline">Détail du score</Button></PopoverTrigger>
      <PopoverContent className="text-sm">Qualité 16/20 · RSE 14/20 · Délais 18/20</PopoverContent>
    </Popover>
  )
}
```

`src/react/demos/dropdown-menu.tsx`:
```tsx
import { Button } from "@/registry/react/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Actions</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Bâti Sud SAS</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Voir la fiche</DropdownMenuItem>
        <DropdownMenuItem>Ajouter aux favoris</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Retirer de la liste</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 3: Vue demos**

`src/vue/demos/dialog.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/vue/ui/dialog"
import { Input } from "@/registry/vue/ui/input"
</script>

<template>
  <Dialog>
    <DialogTrigger as-child><Button variant="outline">Ajouter un contact</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Nouveau contact</DialogTitle>
        <DialogDescription>Le contact sera visible par toute l'organisation.</DialogDescription>
      </DialogHeader>
      <Input placeholder="Nom et prénom" />
      <DialogFooter>
        <DialogClose as-child><Button variant="outline">Annuler</Button></DialogClose>
        <Button>Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

`src/vue/demos/alert-dialog.vue`:
```vue
<script setup lang="ts">
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/registry/vue/ui/alert-dialog"
import { Button } from "@/registry/vue/ui/button"
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child><Button variant="destructive">Supprimer l'agence</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer l'agence Lyon Sud ?</AlertDialogTitle>
        <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction>Supprimer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

`src/vue/demos/sheet.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/vue/ui/sheet"
</script>

<template>
  <Sheet>
    <SheetTrigger as-child><Button variant="outline">Voir la fiche</Button></SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Bâti Sud SAS</SheetTitle>
        <SheetDescription>SIREN 552 100 554 — Lyon</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
</template>
```

`src/vue/demos/popover.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/vue/ui/popover"
</script>

<template>
  <Popover>
    <PopoverTrigger as-child><Button variant="outline">Détail du score</Button></PopoverTrigger>
    <PopoverContent class="text-sm">Qualité 16/20 · RSE 14/20 · Délais 18/20</PopoverContent>
  </Popover>
</template>
```

`src/vue/demos/dropdown-menu.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child><Button variant="outline">Actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Bâti Sud SAS</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Voir la fiche</DropdownMenuItem>
      <DropdownMenuItem>Ajouter aux favoris</DropdownMenuItem>
      <DropdownMenuItem variant="destructive">Retirer de la liste</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

- [ ] **Step 4: Verify** — `npm run check && npm run build && npm run smoke`. Expected: `parity ok`, all tests pass (5 new React + 5 new Vue demo renders), `smoke ok`. If a type error names an export or prop, use the name the vendored file actually exports; do not edit vendored files to fit the demo.

- [ ] **Step 5: Commit and push** — `git add -A && git commit -m "feat: add overlay components (React + Vue)" && git push`.

---

### Task 2: Navigation & disclosure — tabs, accordion, command

**Files:**
- Generated: `registry/{react,vue}/ui/{tabs,accordion,command}*`
- Create: `src/react/demos/{tabs,accordion,command}.tsx`, `src/vue/demos/{same}.vue`

- [ ] **Step 1: Vendor** — `npm run vendor -- tabs accordion command`; install printed deps (expected: `cmdk`).

- [ ] **Step 2: React demos**

`src/react/demos/tabs.tsx`:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"

export default function TabsDemo() {
  return (
    <Tabs defaultValue="todo" className="max-w-md">
      <TabsList>
        <TabsTrigger value="todo">À traiter</TabsTrigger>
        <TabsTrigger value="done">Traitées</TabsTrigger>
      </TabsList>
      <TabsContent value="todo" className="text-sm">3 demandes RSE en attente.</TabsContent>
      <TabsContent value="done" className="text-sm">12 demandes traitées ce mois-ci.</TabsContent>
    </Tabs>
  )
}
```

`src/react/demos/accordion.tsx`:
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/react/ui/accordion"

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="max-w-md">
      <AccordionItem value="legal">
        <AccordionTrigger>Informations légales</AccordionTrigger>
        <AccordionContent>SAS au capital de 50 000 €, créée en 2004.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="finance">
        <AccordionTrigger>Données financières</AccordionTrigger>
        <AccordionContent>CA 2025 : 4,2 M€.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

`src/react/demos/command.tsx`:
```tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/react/ui/command"

export default function CommandDemo() {
  return (
    <Command className="max-w-sm rounded-lg border">
      <CommandInput placeholder="Rechercher un lot…" />
      <CommandList>
        <CommandEmpty>Aucun lot trouvé.</CommandEmpty>
        <CommandGroup heading="Lots">
          <CommandItem>Gros œuvre</CommandItem>
          <CommandItem>Électricité</CommandItem>
          <CommandItem>Plomberie</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

- [ ] **Step 3: Vue demos**

`src/vue/demos/tabs.vue`:
```vue
<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/vue/ui/tabs"
</script>

<template>
  <Tabs default-value="todo" class="max-w-md">
    <TabsList>
      <TabsTrigger value="todo">À traiter</TabsTrigger>
      <TabsTrigger value="done">Traitées</TabsTrigger>
    </TabsList>
    <TabsContent value="todo" class="text-sm">3 demandes RSE en attente.</TabsContent>
    <TabsContent value="done" class="text-sm">12 demandes traitées ce mois-ci.</TabsContent>
  </Tabs>
</template>
```

`src/vue/demos/accordion.vue`:
```vue
<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/vue/ui/accordion"
</script>

<template>
  <Accordion type="single" collapsible class="max-w-md">
    <AccordionItem value="legal">
      <AccordionTrigger>Informations légales</AccordionTrigger>
      <AccordionContent>SAS au capital de 50 000 €, créée en 2004.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="finance">
      <AccordionTrigger>Données financières</AccordionTrigger>
      <AccordionContent>CA 2025 : 4,2 M€.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
```

`src/vue/demos/command.vue`:
```vue
<script setup lang="ts">
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/vue/ui/command"
</script>

<template>
  <Command class="max-w-sm rounded-lg border">
    <CommandInput placeholder="Rechercher un lot…" />
    <CommandList>
      <CommandEmpty>Aucun lot trouvé.</CommandEmpty>
      <CommandGroup heading="Lots">
        <CommandItem value="gros-oeuvre">Gros œuvre</CommandItem>
        <CommandItem value="electricite">Électricité</CommandItem>
        <CommandItem value="plomberie">Plomberie</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
```

- [ ] **Step 4: Verify** — `npm run check && npm run build && npm run smoke`. Expected: `parity ok`, all pass, `smoke ok`.

- [ ] **Step 5: Commit and push** — `git commit -m "feat: add tabs, accordion and command (React + Vue)"`, push.

---

### Task 3: Feedback — progress, empty, sonner (Saqara-adapted)

**Files:**
- Generated then modified: `registry/react/ui/sonner.tsx`, `registry/vue/ui/sonner/Sonner.vue`, sonner items in `registry.react.json`
- Generated: `registry/{react,vue}/ui/{progress,empty}*`
- Create: `tests/sonner.test.ts`, `src/react/demos/{progress,empty,sonner}.tsx`, `src/vue/demos/{same}.vue`

- [ ] **Step 1: Vendor** — `npm run vendor -- progress empty sonner`; install printed deps (expected: `sonner`, `vue-sonner`, `next-themes` — **do not** install `next-themes`).

- [ ] **Step 2: Write the failing test** — `tests/sonner.test.ts`

```ts
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { readManifest } from "../scripts/lib/manifest.ts"

const sonnerDeps = (fw: "react" | "vue") =>
  (readManifest(`registry.${fw}.json`).items.find((i) => i.name === "sonner")!.dependencies as string[])

describe("sonner (Saqara)", () => {
  it("React Toaster does not depend on next-themes (apps pass `theme`)", () => {
    expect(readFileSync("registry/react/ui/sonner.tsx", "utf8")).not.toContain("next-themes")
    expect(sonnerDeps("react")).not.toContain("next-themes")
  })
  it("Vue Toaster ships the vue-sonner stylesheet", () => {
    expect(readFileSync("registry/vue/ui/sonner/Sonner.vue", "utf8")).toContain('import "vue-sonner/style.css"')
  })
})
```

- [ ] **Step 3: Run it** — `npx vitest run tests/sonner.test.ts`. Expected: FAIL on both tests.

- [ ] **Step 4: Adapt**

In `registry/react/ui/sonner.tsx`: delete the line `import { useTheme } from "next-themes"`, change the signature and first line of the component to:
```tsx
const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
```
(remove `const { theme = "system" } = useTheme()` and the `theme as ToasterProps["theme"]` cast; keep everything else).

In `registry.react.json`, remove `"next-themes"` from the `sonner` item's `dependencies`.

In `registry/vue/ui/sonner/Sonner.vue`, add as the first import of `<script lang="ts" setup>`:
```ts
import "vue-sonner/style.css"
```

- [ ] **Step 5: Run it** — `npx vitest run tests/sonner.test.ts`. Expected: PASS (2 tests).

- [ ] **Step 6: Demos**

`src/react/demos/progress.tsx`:
```tsx
import { Progress } from "@/registry/react/ui/progress"

export default function ProgressDemo() {
  return (
    <div className="max-w-sm space-y-1 text-sm">
      <p>Import : 1 250 / 3 000 lignes</p>
      <Progress value={42} />
    </div>
  )
}
```

`src/react/demos/empty.tsx`:
```tsx
import { SearchX } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/react/ui/empty"

export default function EmptyDemo() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
        <EmptyTitle>Aucune entreprise</EmptyTitle>
        <EmptyDescription>Aucun résultat ne correspond à ces filtres.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent><Button variant="outline">Réinitialiser les filtres</Button></EmptyContent>
    </Empty>
  )
}
```

`src/react/demos/sonner.tsx`:
```tsx
import { toast } from "sonner"
import { Button } from "@/registry/react/ui/button"
import { Toaster } from "@/registry/react/ui/sonner"

export default function SonnerDemo() {
  return (
    <div className="flex gap-2">
      <Toaster />
      <Button variant="outline" onClick={() => toast.success("Import terminé", { description: "3 000 entreprises mises à jour." })}>Succès</Button>
      <Button variant="outline" onClick={() => toast.error("Échec de l'import")}>Erreur</Button>
    </div>
  )
}
```

`src/vue/demos/progress.vue`:
```vue
<script setup lang="ts">
import { Progress } from "@/registry/vue/ui/progress"
</script>

<template>
  <div class="max-w-sm space-y-1 text-sm">
    <p>Import : 1 250 / 3 000 lignes</p>
    <Progress :model-value="42" />
  </div>
</template>
```

`src/vue/demos/empty.vue`:
```vue
<script setup lang="ts">
import { SearchX } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/vue/ui/empty"
</script>

<template>
  <Empty class="border">
    <EmptyHeader>
      <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
      <EmptyTitle>Aucune entreprise</EmptyTitle>
      <EmptyDescription>Aucun résultat ne correspond à ces filtres.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent><Button variant="outline">Réinitialiser les filtres</Button></EmptyContent>
  </Empty>
</template>
```

`src/vue/demos/sonner.vue`:
```vue
<script setup lang="ts">
import { toast } from "vue-sonner"
import { Button } from "@/registry/vue/ui/button"
import { Toaster } from "@/registry/vue/ui/sonner"
</script>

<template>
  <div class="flex gap-2">
    <Toaster />
    <Button variant="outline" @click="toast.success('Import terminé', { description: '3 000 entreprises mises à jour.' })">Succès</Button>
    <Button variant="outline" @click="toast.error('Échec de l\'import')">Erreur</Button>
  </div>
</template>
```

- [ ] **Step 7: Verify** — `npm run check && npm run build && npm run smoke`. Expected: `parity ok`, all pass, `smoke ok`; `grep -l "data-sonner-toaster" dist/assets/*.css` finds the Vue stylesheet.

- [ ] **Step 8: Docs, commit, push**

`README.md`, under "Utiliser Blueprint dans une app", add:
```markdown
Composants qui demandent un élément racine :
- `tooltip` (React) : placer un `<TooltipProvider>` à la racine de l'app.
- `sonner` : monter `<Toaster />` une fois à la racine. En React, passer `theme="light" | "dark"` depuis le thème de l'app (défaut : `system`).
```

`CHANGELOG.md` (top): `- 2026-09-25 — Lot 2 : dialog, alert-dialog, sheet, popover, dropdown-menu, tabs, accordion, command, progress, empty, sonner (React sans next-themes, Vue avec la feuille de style vue-sonner).`

`git commit -m "feat: add progress, empty and Saqara-adapted sonner (React + Vue)"`, push, watch CI.
