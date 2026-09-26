import { Card, CardContent, CardHeader, CardTitle } from "@/registry/react/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

const rows = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon" },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne" },
]

const body = (
  <>
    <TableHeader>
      <TableRow><TableHead>SIREN</TableHead><TableHead>Raison sociale</TableHead><TableHead>Ville</TableHead></TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.siren}><TableCell>{r.siren}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.city}</TableCell></TableRow>
      ))}
    </TableBody>
  </>
)

export default function TableDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-6">
      <Table>{body}</Table>
      {/* In a card, the card is the frame: bordered={false}. */}
      <Card className="gap-2 pb-2">
        <CardHeader><CardTitle>Entreprises suivies</CardTitle></CardHeader>
        <CardContent className="px-2"><Table bordered={false}>{body}</Table></CardContent>
      </Card>
    </div>
  )
}
