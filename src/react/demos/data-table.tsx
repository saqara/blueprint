import { useMemo, useState } from "react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { DataTable, DataTableColumnHeader, type DataTableFeatures } from "@/registry/react/ui/data-table"

type Company = { siren: string; name: string; city: string; score: number }
const companies: Company[] = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon", score: 16 },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne", score: 12 },
  { siren: "900 000 003", name: "Plomberie Dupuis", city: "Vienne", score: 18 },
]
const columns: ColumnDef<DataTableFeatures, Company, any>[] = [
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
