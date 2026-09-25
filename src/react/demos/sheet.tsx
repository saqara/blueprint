import { Button } from "@/registry/react/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/react/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Voir la fiche</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bâti Sud SAS</SheetTitle>
          <SheetDescription>SIREN 900 000 001 — Lyon</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
