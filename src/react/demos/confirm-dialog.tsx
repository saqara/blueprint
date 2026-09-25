import { useState } from "react"
import { Button } from "@/registry/react/ui/button"
import { ConfirmDialog, confirm } from "@/registry/react/ui/confirm-dialog"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function ConfirmDialogDemo() {
  const [result, setResult] = useState("Aucune réponse pour l'instant.")

  async function remove() {
    const ok = await confirm({ title: "Supprimer le contact ?", message: "Cette action est définitive.", confirmText: "Supprimer", variant: "destructive" })
    setResult(ok ? "Contact supprimé." : "Suppression annulée.")
  }

  async function send() {
    const ok = await confirm({ message: "Envoyer la demande de documents au fournisseur ?", confirmText: "Envoyer", variant: "info", onConfirm: () => wait(1500) })
    setResult(ok ? "Demande envoyée." : "Envoi annulé.")
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <ConfirmDialog />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={remove}>Supprimer un contact</Button>
        <Button variant="outline" onClick={send}>Envoyer (asynchrone)</Button>
      </div>
      <p className="text-sm text-muted-foreground">{result}</p>
    </div>
  )
}
