import { Button } from "@/registry/react/ui/button"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/react/ui/dialog"
import { Input } from "@/registry/react/ui/input"

const clauses = Array.from({ length: 12 }, (_, i) => `Article ${i + 1}. Le fournisseur s'engage à tenir à jour les informations de son entreprise et les documents justificatifs demandés par l'acheteur.`)

export default function DialogDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild><Button variant="outline">Ajouter un contact</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau contact</DialogTitle>
            <DialogDescription>Le contact sera visible par toute l'organisation.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Nom et prénom" />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild><Button variant="outline">Conditions (lg, défilement)</Button></DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Conditions d'utilisation</DialogTitle>
            <DialogDescription>Le corps défile, l'en-tête et le pied restent visibles.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3 text-sm">
            {clauses.map((c) => <p key={c}>{c}</p>)}
          </DialogBody>
          <DialogFooter showCloseButton>
            <Button>J'accepte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
