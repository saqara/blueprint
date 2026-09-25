import { useMemo, useState } from "react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { Building2, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellSidebar, type AppNavItem } from "@/registry/react/blocks/app-shell-sidebar"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { DataTable, DataTableColumnHeader, type DataTableFeatures } from "@/registry/react/ui/data-table"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/react/ui/hover-card"
import { Input } from "@/registry/react/ui/input"
import { MultiSelect } from "@/registry/react/ui/multi-select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/registry/react/ui/pagination"
import { Slider } from "@/registry/react/ui/slider"
import { StatCard } from "@/registry/react/ui/stat-card"
import { ToggleGroup, ToggleGroupItem } from "@/registry/react/ui/toggle-group"

// Example: the supplier directory (main screen of the portal).
export type Company = { siren: string; name: string; city: string; dept: string; status: "qualified" | "pending"; score: number }
export type Filters = { search: string; depts: string[]; status: "all" | "qualified" | "pending"; minScore: number }
export type Sort = { id: string; desc: boolean }[]

// Fictitious data.
export const COMPANIES: Company[] = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon", dept: "69", status: "qualified", score: 16 },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne", dept: "69", status: "pending", score: 12 },
  { siren: "900 000 003", name: "Plomberie Dupuis", city: "Vienne", dept: "38", status: "qualified", score: 18 },
  { siren: "900 000 004", name: "Menuiseries Alpines", city: "Grenoble", dept: "38", status: "qualified", score: 15 },
  { siren: "900 000 005", name: "Charpentes du Forez", city: "Saint-Étienne", dept: "42", status: "pending", score: 11 },
  { siren: "900 000 006", name: "Ain Couverture", city: "Bourg-en-Bresse", dept: "01", status: "qualified", score: 14 },
  { siren: "900 000 007", name: "Atelier Métal Lyonnais", city: "Vénissieux", dept: "69", status: "qualified", score: 17 },
  { siren: "900 000 008", name: "Isolation Durable", city: "Échirolles", dept: "38", status: "pending", score: 9 },
  { siren: "900 000 009", name: "Carrelages Marseillais", city: "Marseille", dept: "13", status: "qualified", score: 13 },
  { siren: "905 118 640", name: "Provence Béton", city: "Aix-en-Provence", dept: "13", status: "qualified", score: 16 },
  { siren: "900 000 010", name: "Bordeaux Façades", city: "Bordeaux", dept: "33", status: "pending", score: 10 },
  { siren: "900 000 011", name: "Gironde Étanchéité", city: "Mérignac", dept: "33", status: "qualified", score: 15 },
  { siren: "900 000 012", name: "Nord Terrassement", city: "Lille", dept: "59", status: "qualified", score: 14 },
  { siren: "900 000 013", name: "Flandres Peinture", city: "Roubaix", dept: "59", status: "pending", score: 8 },
  { siren: "900 000 014", name: "Paris Ascenseurs", city: "Paris", dept: "75", status: "qualified", score: 19 },
  { siren: "900 000 015", name: "Seine Ventilation", city: "Paris", dept: "75", status: "pending", score: 12 },
  { siren: "900 000 016", name: "Loire Serrurerie", city: "Roanne", dept: "42", status: "qualified", score: 13 },
  { siren: "900 000 017", name: "Rhône Vitrages", city: "Lyon", dept: "69", status: "qualified", score: 15 },
  { siren: "900 000 018", name: "Dauphiné Plâtrerie", city: "Voiron", dept: "38", status: "pending", score: 11 },
  { siren: "900 000 019", name: "Bresse Électricité", city: "Oyonnax", dept: "01", status: "qualified", score: 16 },
  { siren: "900 000 020", name: "Calanques Aménagement", city: "La Ciotat", dept: "13", status: "pending", score: 7 },
  { siren: "900 000 021", name: "Médoc Charpente", city: "Pauillac", dept: "33", status: "qualified", score: 14 },
  { siren: "900 000 022", name: "Lys Chauffage", city: "Tourcoing", dept: "59", status: "qualified", score: 17 },
  { siren: "915 470 128", name: "Montmartre Rénovation", city: "Paris", dept: "75", status: "pending", score: 10 },
]

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

export function filterCompanies(list: Company[], f: Filters): Company[] {
  const q = fold(f.search.trim())
  return list.filter((c) =>
    (!q || fold(c.name).includes(q)) &&
    (!f.depts.length || f.depts.includes(c.dept)) &&
    (f.status === "all" || c.status === f.status) &&
    c.score >= f.minScore,
  )
}

// A real page would sort server-side; the example sorts in memory.
export function sortCompanies(list: Company[], sorting: Sort): Company[] {
  const [s] = sorting
  if (!s) return list
  const key = s.id as keyof Company
  return [...list].sort((a, b) => {
    const [x, y] = [a[key], b[key]]
    const order = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "fr", { numeric: true })
    return s.desc ? -order : order
  })
}

export function paginate<T>(list: T[], page: number, perPage: number) {
  const pageCount = Math.max(1, Math.ceil(list.length / perPage))
  const current = Math.min(Math.max(1, page), pageCount)
  return { rows: list.slice((current - 1) * perPage, current * perPage), pageCount, page: current }
}

const PER_PAGE = 8
const EMPTY: Filters = { search: "", depts: [], status: "all", minScore: 0 }
const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
const DEPARTMENTS = [["01", "Ain"], ["13", "Bouches-du-Rhône"], ["33", "Gironde"], ["38", "Isère"], ["42", "Loire"], ["59", "Nord"], ["69", "Rhône"], ["75", "Paris"]]
  .map(([value, name]) => ({ value, label: `${value} — ${name}` }))

const columns: ColumnDef<DataTableFeatures, Company, any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Raison sociale" />,
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger asChild><a href="#/exemples/fiche-entreprise" className="font-medium hover:underline">{row.original.name}</a></HoverCardTrigger>
        <HoverCardContent className="space-y-1 text-sm">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-muted-foreground">SIREN {row.original.siren} — {row.original.city}</p>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => <DataTableColumnHeader column={column} title="Ville" /> },
  { accessorKey: "dept", header: ({ column }) => <DataTableColumnHeader column={column} title="Dép." /> },
  {
    accessorKey: "status",
    header: "Statut",
    enableSorting: false,
    cell: ({ row }) => row.original.status === "qualified" ? <Badge variant="success">Qualifié</Badge> : <Badge variant="warning">À compléter</Badge>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Note" />,
    cell: ({ row }) => <Badge variant={row.original.score >= 15 ? "success" : "secondary"}>{row.original.score}/20</Badge>,
  },
]

export default function AnnuaireExample() {
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [page, setPage] = useState(1)
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1) }

  const list = useMemo(() => sortCompanies(filterCompanies(COMPANIES, filters), sorting), [filters, sorting])
  const view = paginate(list, page, PER_PAGE)
  const qualified = COMPANIES.filter((c) => c.status === "qualified").length
  const average = (COMPANIES.reduce((n, c) => n + c.score, 0) / COMPANIES.length).toFixed(1).replace(".", ",")

  return (
    <AppShellSidebar className="h-full min-h-0 [&_.h-svh]:h-full" nav={nav} activeId="annuaire"
      user={{ name: "Alexandre Brochot", email: "alexandre.brochot@saqara.com" }} onSignOut={() => {}}>
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Entreprises" value={COMPANIES.length} />
          <StatCard label="Qualifiées" value={qualified} />
          <StatCard label="À compléter" value={COMPANIES.length - qualified} />
          <StatCard label="Note moyenne" value={`${average}/20`} />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Input className="w-56" placeholder="Rechercher une entreprise…" aria-label="Rechercher une entreprise" value={filters.search} onChange={(e) => set("search", e.target.value)} />
          <MultiSelect className="w-64" options={DEPARTMENTS} value={filters.depts} onValueChange={(v) => set("depts", v)} placeholder="Départements" />
          <ToggleGroup type="single" variant="outline" value={filters.status} onValueChange={(v) => v && set("status", v as Filters["status"])} aria-label="Statut">
            <ToggleGroupItem value="all">Toutes</ToggleGroupItem>
            <ToggleGroupItem value="qualified">Qualifiées</ToggleGroupItem>
            <ToggleGroupItem value="pending">À compléter</ToggleGroupItem>
          </ToggleGroup>
          <div className="grid w-48 gap-2 text-sm">
            <span className="text-muted-foreground">Note minimale : {filters.minScore}/20</span>
            <Slider min={0} max={20} step={1} value={[filters.minScore]} onValueChange={([v]) => set("minScore", v)} aria-label="Note minimale" />
          </div>
          <Button variant="ghost" onClick={() => { setFilters(EMPTY); setPage(1) }}>Réinitialiser</Button>
        </div>

        <DataTable columns={columns} data={view.rows} getRowId={(c) => c.siren} sorting={sorting} onSortingChange={(s) => { setSorting(s); setPage(1) }}
          emptyMessage="Aucune entreprise ne correspond à ces filtres." className="rounded-md border" />

        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>{list.length} entreprise{list.length > 1 ? "s" : ""}</span>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(view.page - 1) }} /></PaginationItem>
              {Array.from({ length: view.pageCount }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={p === view.page} onClick={(e) => { e.preventDefault(); setPage(p) }}>{p}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(view.page + 1) }} /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </AppShellSidebar>
  )
}
