import { Button } from "@/registry/react/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/react/ui/dialog"
import { Input } from "@/registry/react/ui/input"

export default function DialogDemo() {
  return (
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
  )
}
