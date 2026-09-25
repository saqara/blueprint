import { useState } from "react"
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { Alert, AlertAction, AlertClose, AlertDescription, AlertTitle } from "@/registry/react/ui/alert"
import { Button } from "@/registry/react/ui/button"

export default function AlertDemo() {
  const [showWarning, setShowWarning] = useState(true)
  return (
    <div className="grid max-w-lg gap-3">
      <Alert variant="info"><Info /><AlertTitle>Import en cours</AlertTitle><AlertDescription>1 250 lignes sur 3 000.</AlertDescription></Alert>
      <Alert variant="success"><CircleCheck /><AlertTitle>Import terminé</AlertTitle><AlertDescription>3 000 entreprises mises à jour.</AlertDescription></Alert>
      {showWarning && (
        <Alert variant="warning"><TriangleAlert /><AlertTitle>Données incomplètes</AlertTitle><AlertDescription>12 SIRET sans adresse.</AlertDescription><AlertClose onClick={() => setShowWarning(false)} /></Alert>
      )}
      <Alert variant="destructive"><CircleAlert /><AlertTitle>Échec de l'import</AlertTitle><AlertDescription>Colonne « SIREN » introuvable.</AlertDescription><AlertAction><Button size="sm" variant="outline">Réessayer</Button></AlertAction></Alert>
    </div>
  )
}
