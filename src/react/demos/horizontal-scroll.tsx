import { HorizontalScroll } from "@/registry/react/ui/horizontal-scroll"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

const months = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."]
const rows = ["Bâti Sud SAS", "Élec Rhône", "Plomberie Dupuis", "Carrelages Marseillais", "Ain Couverture", "Bresse Électricité", "Charpentes du Forez", "Calanques Aménagement"]

export default function HorizontalScrollDemo() {
  return (
    <div className="w-full max-w-2xl rounded-md border">
      {/* The table gives its scrolling to HorizontalScroll (container={false}). Drag it sideways, or use the bar. */}
      <HorizontalScroll>
        <Table container={false} className="min-w-[1100px]">
          <TableHeader>
            <TableRow><TableHead>Entreprise</TableHead>{months.map((m) => <TableHead key={m} className="text-right">{m}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r}>
                <TableCell className="font-medium">{r}</TableCell>
                {months.map((m, j) => <TableCell key={m} className="text-right tabular-nums">{((i * 7 + j * 3) % 20) + 1}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </HorizontalScroll>
    </div>
  )
}
