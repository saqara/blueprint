import { useState } from "react"
import { FileTree, FileTreeFile, FileTreeFolder } from "@/registry/react/ui/file-tree"

export default function FileTreeDemo() {
  const [selected, setSelected] = useState("exports/2026-10/fournisseurs-actifs.csv")
  return (
    <div className="w-full max-w-sm space-y-2">
      <FileTree aria-label="Exports de la conversation" defaultExpanded={new Set(["exports", "exports/2026-10"])} selectedPath={selected} onSelect={setSelected}>
        <FileTreeFolder path="exports" name="exports">
          <FileTreeFolder path="exports/2026-10" name="2026-10">
            <FileTreeFile path="exports/2026-10/fournisseurs-actifs.csv" name="fournisseurs-actifs.csv" />
            <FileTreeFile path="exports/2026-10/notes-par-ville.csv" name="notes-par-ville.csv" />
          </FileTreeFolder>
          <FileTreeFolder path="exports/requetes" name="requetes">
            <FileTreeFile path="exports/requetes/top-villes.sql" name="top-villes.sql" />
          </FileTreeFolder>
        </FileTreeFolder>
      </FileTree>
      <p className="text-sm text-muted-foreground">Sélection : {selected}</p>
    </div>
  )
}
