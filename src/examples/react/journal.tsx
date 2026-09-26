import { useEffect, useRef, useState } from "react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/registry/react/ui/button"
import { DataTable, type DataTableFeatures } from "@/registry/react/ui/data-table"
import { Progress } from "@/registry/react/ui/progress"

type Entry = { id: string; date: string; user: string; action: string }

const users = ["Alexandre Brochot", "Camille Martin", "Hugo Leroy"]
const actions = ["a qualifié Bâti Sud SAS", "a relancé Élec Rhône", "a importé 120 entreprises", "a modifié un contact"]
const page = (from: number): Entry[] => Array.from({ length: 20 }, (_, i) => {
  const n = from + i
  return { id: String(n), date: `${String(25 - (n % 25)).padStart(2, "0")}/09/2026`, user: users[n % users.length], action: actions[n % actions.length] }
})
const TOTAL = 100

// Columns outside the component: stable, so FlexRender never remounts the cells.
const columns: ColumnDef<DataTableFeatures, Entry, any>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "user", header: "Utilisateur" },
  { accessorKey: "action", header: "Action" },
]

// Pattern 2: a live job card in the toast stack (toast.custom, updated by id, dismissed on demand).
function JobCard({ id, progress, stopped, onStop }: { id: string | number; progress: number; stopped: boolean; onStop: () => void }) {
  const done = progress >= 100
  return (
    <div className="grid w-[356px] gap-2 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{done ? "Import terminé" : stopped ? "Import arrêté" : "Import des entreprises"}</p>
        <Button variant="ghost" size="icon-sm" aria-label="Fermer" onClick={() => toast.dismiss(id)}><XIcon /></Button>
      </div>
      <Progress value={progress} variant={done ? "success" : stopped ? "warning" : "default"} aria-label="Avancement de l'import" />
      <div className="flex items-center justify-between text-muted-foreground">
        <span>{progress} %</span>
        {!done && !stopped && <Button variant="outline" size="sm" onClick={onStop}>Arrêter</Button>}
      </div>
    </div>
  )
}

function startImport() {
  const id = `import-${Date.now()}`
  let progress = 0
  let stopped = false
  const render = () => toast.custom(() => <JobCard id={id} progress={progress} stopped={stopped} onStop={() => { stopped = true; clearInterval(timer); render() }} />, { id, duration: Infinity })
  const timer = setInterval(() => {
    progress = Math.min(100, progress + 10)
    render()
    if (progress >= 100) clearInterval(timer)
  }, 400)
  render()
}

// Example: activity log loaded page by page as it scrolls, plus live import jobs in the toast stack.
export default function JournalExample() {
  const [rows, setRows] = useState<Entry[]>(() => page(0))
  const [loading, setLoading] = useState(false)
  const scroll = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const more = rows.length < TOTAL

  // Pattern 1: an IntersectionObserver on a sentinel rendered inside the scroll container (DataTable children).
  useEffect(() => {
    if (!more || loading || !sentinel.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setLoading(true)
      setTimeout(() => { setRows((r) => [...r, ...page(r.length)]); setLoading(false) }, 500)
    }, { root: scroll.current })
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [more, loading])

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Journal d'activité</h1>
        <Button onClick={startImport}>Lancer un import</Button>
      </div>
      <DataTable columns={columns} data={rows} getRowId={(r) => r.id} stickyHeader className="max-h-96" scrollRef={scroll}>
        <div ref={sentinel} className="h-px" />
        <p role="status" className="p-3 text-center text-sm text-muted-foreground">
          {loading ? "Chargement…" : more ? "" : `${rows.length} événements, fin du journal.`}
        </p>
      </DataTable>
    </div>
  )
}
