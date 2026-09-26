<script setup lang="ts">
import type { ColumnDef } from "@tanstack/vue-table"
import type { DataTableFeatures } from "@/registry/vue/ui/data-table"
import { XIcon } from "@lucide/vue"
import { computed, defineComponent, h, markRaw, onBeforeUnmount, ref, watch } from "vue"
import { toast } from "vue-sonner"
import { Button } from "@/registry/vue/ui/button"
import { DataTable } from "@/registry/vue/ui/data-table"
import { Progress } from "@/registry/vue/ui/progress"
import { Toaster } from "@/registry/vue/ui/sonner"

// Example: activity log loaded page by page as it scrolls, plus live import jobs in the toast stack.
// The app mounts <Toaster /> once at its root (here, the example's own root).
type Entry = { id: string, date: string, user: string, action: string }

const users = ["Alexandre Brochot", "Camille Martin", "Hugo Leroy"]
const actions = ["a qualifié Bâti Sud SAS", "a relancé Élec Rhône", "a importé 120 entreprises", "a modifié un contact"]
const page = (from: number): Entry[] => Array.from({ length: 20 }, (_, i) => {
  const n = from + i
  return { id: String(n), date: `${String(25 - (n % 25)).padStart(2, "0")}/09/2026`, user: users[n % users.length]!, action: actions[n % actions.length]! }
})
const TOTAL = 100

const columns: ColumnDef<DataTableFeatures, Entry, any>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "user", header: "Utilisateur" },
  { accessorKey: "action", header: "Action" },
]

const rows = ref<Entry[]>(page(0))
const loading = ref(false)
const table = ref<{ scrollContainer: HTMLElement | null }>()
const sentinel = ref<HTMLElement>()
const more = computed(() => rows.value.length < TOTAL)

// Pattern 1: an IntersectionObserver on a sentinel rendered inside the scroll container (DataTable default slot).
let observer: IntersectionObserver | undefined
watch([sentinel, more, loading], () => {
  observer?.disconnect()
  if (!more.value || loading.value || !sentinel.value) return
  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    loading.value = true
    setTimeout(() => { rows.value = [...rows.value, ...page(rows.value.length)]; loading.value = false }, 500)
  }, { root: table.value?.scrollContainer })
  observer.observe(sentinel.value)
}, { flush: "post" })
onBeforeUnmount(() => observer?.disconnect())

// Pattern 2: a live job card in the toast stack (toast.custom, updated by id, dismissed on demand).
const JobCard = markRaw(defineComponent({
  props: { id: { type: [String, Number], required: true }, progress: { type: Number, required: true }, stopped: Boolean, onStop: { type: Function, required: true } },
  setup(props) {
    return () => {
      const done = props.progress >= 100
      return h("div", { class: "grid w-[356px] gap-2 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg" }, [
        h("div", { class: "flex items-center justify-between gap-2" }, [
          h("p", { class: "font-medium" }, done ? "Import terminé" : props.stopped ? "Import arrêté" : "Import des entreprises"),
          h(Button, { variant: "ghost", size: "icon-sm", "aria-label": "Fermer", onClick: () => toast.dismiss(props.id) }, () => h(XIcon)),
        ]),
        h(Progress, { modelValue: props.progress, variant: done ? "success" : props.stopped ? "warning" : "default", "aria-label": "Avancement de l'import" }),
        h("div", { class: "flex items-center justify-between text-muted-foreground" }, [
          h("span", `${props.progress} %`),
          !done && !props.stopped ? h(Button, { variant: "outline", size: "sm", onClick: props.onStop }, () => "Arrêter") : null,
        ]),
      ])
    }
  },
}))

function startImport() {
  const id = `import-${Date.now()}`
  let progress = 0
  let stopped = false
  const render = () => toast.custom(JobCard, { id, duration: Infinity, componentProps: { id, progress, stopped, onStop: () => { stopped = true; clearInterval(timer); render() } } })
  const timer = setInterval(() => {
    progress = Math.min(100, progress + 10)
    render()
    if (progress >= 100) clearInterval(timer)
  }, 400)
  render()
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-3xl gap-4 p-6">
    <Toaster />
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-xl font-semibold">Journal d'activité</h1>
      <Button @click="startImport">Lancer un import</Button>
    </div>
    <DataTable ref="table" :columns="columns" :data="rows" :get-row-id="(r: Entry) => r.id" sticky-header class="max-h-96">
      <div ref="sentinel" class="h-px" />
      <p role="status" class="p-3 text-center text-sm text-muted-foreground">
        {{ loading ? "Chargement…" : more ? "" : `${rows.length} événements, fin du journal.` }}
      </p>
    </DataTable>
  </div>
</template>
