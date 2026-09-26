import { useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/registry/react/ui/input-group"

export default function InputGroupDemo() {
  const [query, setQuery] = useState("Bâti")
  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput aria-label="Rechercher une entreprise" placeholder="Rechercher une entreprise…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <InputGroupAddon><SearchIcon /></InputGroupAddon>
      {query && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Effacer la recherche" onClick={() => setQuery("")}><XIcon /></InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
