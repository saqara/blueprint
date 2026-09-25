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
