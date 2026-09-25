import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

const rows = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon" },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne" },
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
