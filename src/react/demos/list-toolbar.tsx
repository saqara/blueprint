import { SearchIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/react/ui/input-group"
import { ListToolbar } from "@/registry/react/ui/list-toolbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/react/ui/select"

export default function ListToolbarDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ListToolbar
        search={
          <InputGroup>
            <InputGroupInput aria-label="Rechercher une entreprise" placeholder="Rechercher une entreprise…" />
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
          </InputGroup>
        }
        filters={
          <Select defaultValue="all">
            <SelectTrigger className="w-44" aria-label="Statut"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="qualified">Qualifiées</SelectItem>
              <SelectItem value="pending">À compléter</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={<Button>Ajouter une entreprise</Button>}
      />
    </div>
  )
}
