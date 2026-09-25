import { toast } from "sonner"
import { Button } from "@/registry/react/ui/button"

// The site (like any app) mounts a single Toaster at its root.
export default function SonnerDemo() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => toast.success("Import terminé", { description: "3 000 entreprises mises à jour." })}>Succès</Button>
      <Button variant="outline" onClick={() => toast.error("Échec de l'import")}>Erreur</Button>
    </div>
  )
}
