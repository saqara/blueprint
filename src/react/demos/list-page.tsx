import { useMemo, useState } from "react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { PlusIcon } from "lucide-react"
import { ListPage } from "@/registry/react/blocks/list-page"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { DataTableColumnHeader, type DataTableFeatures } from "@/registry/react/ui/data-table"
import { ToggleGroup, ToggleGroupItem } from "@/registry/react/ui/toggle-group"

type Company = { siren: string; name: string; city: string; status: "qualified" | "pending"; score: number }
const COMPANIES: Company[] = [
  ["900 000 001", "Bâti Sud SAS", "Lyon", "qualified", 16], ["900 000 002", "Élec Rhône", "Villeurbanne", "pending", 12],
  ["900 000 003", "Plomberie Dupuis", "Vienne", "qualified", 18], ["900 000 004", "Menuiseries Alpines", "Grenoble", "qualified", 15],
  ["900 000 005", "Charpentes du Forez", "Saint-Étienne", "pending", 11], ["900 000 006", "Ain Couverture", "Bourg-en-Bresse", "qualified", 14],
  ["900 000 007", "Atelier Métal Lyonnais", "Vénissieux", "qualified", 17], ["900 000 008", "Isolation Durable", "Échirolles", "pending", 9],
  ["900 000 009", "Carrelages Marseillais", "Marseille", "qualified", 13], ["900 000 010", "Bordeaux Façades", "Bordeaux", "pending", 10],
  ["900 000 011", "Nord Terrassement", "Lille", "qualified", 14], ["900 000 012", "Paris Ascenseurs", "Paris", "qualified", 19],
  ["900 000 013", "Loire Serrurerie", "Roanne", "qualified", 13], ["900 000 014", "Dauphiné Plâtrerie", "Voiron", "pending", 11],
].map(([siren, name, city, status, score]) => ({ siren, name, city, status, score }) as Company)

const columns: ColumnDef<DataTableFeatures, Company, any>[] = [
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Raison sociale" />, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => <DataTableColumnHeader column={column} title="Ville" /> },
  { accessorKey: "status", header: "Statut", enableSorting: false,
    cell: ({ row }) => row.original.status === "qualified" ? <Badge variant="success">Qualifiée</Badge> : <Badge variant="warning">À compléter</Badge> },
  { accessorKey: "score", header: ({ column }) => <DataTableColumnHeader column={column} title="Note" />, cell: ({ row }) => `${row.original.score}/20` },
]

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
const PAGE_SIZE = 5

// The demo filters, sorts and pages in memory; a real page would ask its API.
export default function ListPageDemo() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<"data" | "empty" | "loading">("data")

  const list = useMemo(() => {
    const q = fold(search.trim())
    const rows = mode === "data" ? COMPANIES.filter((c) => (!q || fold(c.name).includes(q)) && (status === "all" || c.status === status)) : []
    const [s] = sorting
    if (!s) return rows
    const key = s.id as keyof Company
    return [...rows].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "fr", { numeric: true }) * (s.desc ? -1 : 1))
  }, [search, status, sorting, mode])
  const reset = () => { setSearch(""); setStatus("all"); setPage(1) }
  const add = <Button><PlusIcon />Ajouter une entreprise</Button>

  return (
    <div className="space-y-4 p-6">
      <ToggleGroup type="single" variant="outline" size="sm" value={mode} onValueChange={(v) => v && setMode(v as typeof mode)} aria-label="État de la démo">
        <ToggleGroupItem value="data">Données</ToggleGroupItem>
        <ToggleGroupItem value="empty">Liste vide</ToggleGroupItem>
        <ToggleGroupItem value="loading">Chargement</ToggleGroupItem>
      </ToggleGroup>
      <ListPage
        title="Entreprises suivies" description="Fournisseurs et sous-traitants de votre organisation." actions={add}
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Rechercher une entreprise…"
        filters={
          <ToggleGroup type="single" variant="outline" value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1) } }} aria-label="Statut">
            <ToggleGroupItem value="all">Toutes</ToggleGroupItem>
            <ToggleGroupItem value="qualified">Qualifiées</ToggleGroupItem>
            <ToggleGroupItem value="pending">À compléter</ToggleGroupItem>
          </ToggleGroup>
        }
        filtered={mode === "data" && (!!search || status !== "all")} onReset={reset}
        columns={columns} data={list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)} getRowId={(c) => c.siren}
        sorting={sorting} onSortingChange={(s) => { setSorting(s); setPage(1) }} loading={mode === "loading"}
        total={list.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel={["entreprise", "entreprises"]}
        emptyTitle="Aucune entreprise suivie" emptyDescription="Ajoutez vos fournisseurs pour suivre leurs documents et leurs évaluations."
        emptyAction={add} noResultDescription="Aucune entreprise ne correspond à ces critères."
      />
    </div>
  )
}
