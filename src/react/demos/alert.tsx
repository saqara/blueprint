import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/registry/react/ui/alert"

export default function AlertDemo() {
  return (
    <div className="grid max-w-lg gap-3">
      <Alert variant="info"><Info /><AlertTitle>Import en cours</AlertTitle><AlertDescription>1 250 lignes sur 3 000.</AlertDescription></Alert>
      <Alert variant="success"><CircleCheck /><AlertTitle>Import terminé</AlertTitle><AlertDescription>3 000 entreprises mises à jour.</AlertDescription></Alert>
      <Alert variant="warning"><TriangleAlert /><AlertTitle>Données incomplètes</AlertTitle><AlertDescription>12 SIRET sans adresse.</AlertDescription></Alert>
      <Alert variant="destructive"><CircleAlert /><AlertTitle>Échec de l'import</AlertTitle><AlertDescription>Colonne « SIREN » introuvable.</AlertDescription></Alert>
    </div>
  )
}
