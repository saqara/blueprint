import { useState } from "react"
import { Wizard } from "@/registry/react/blocks/wizard"
import { Checkbox } from "@/registry/react/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/registry/react/ui/field"
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"

type Values = { siren: string; name: string; contact: string; email: string; accepted: boolean }
type Errors = Partial<Record<keyof Values, string>>
const EMPTY: Values = { siren: "", name: "", contact: "", email: "", accepted: false }

// The app owns the fields and the rules; the block asks before each step forward.
function errorsOf(step: number, v: Values): Errors {
  const found: Errors = {}
  if (step === 1) {
    if (!/^\d{9}$/.test(v.siren.replace(/\s/g, ""))) found.siren = "Le SIREN doit contenir 9 chiffres."
    if (!v.name.trim()) found.name = "La raison sociale est obligatoire."
  }
  if (step === 2) {
    if (!v.contact.trim()) found.contact = "Le nom du contact est obligatoire."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) found.email = "L’e-mail n’est pas valide."
  }
  return found
}

export default function WizardDemo() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle")
  const field = (key: "siren" | "name" | "contact" | "email", label: string, props: React.ComponentProps<"input"> = {}) => (
    <Field data-invalid={errors[key] ? true : undefined}>
      <FieldLabel htmlFor={`wizard-${key}`}>{label}</FieldLabel>
      <Input id={`wizard-${key}`} value={values[key]} aria-invalid={!!errors[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })} {...props} />
      {errors[key] && <FieldError>{errors[key]}</FieldError>}
    </Field>
  )

  return (
    <div className="flex min-h-full items-start justify-center bg-muted/40 p-6">
      <Wizard
        title="Créer votre compte fournisseur"
        description="Trois étapes, deux minutes."
        status={status}
        submitLabel="Créer le compte"
        canSubmit={values.accepted}
        validate={(step) => {
          const found = errorsOf(step, values)
          setErrors(found)
          return Object.values(found)
        }}
        onSubmit={() => { setStatus("submitting"); setTimeout(() => setStatus("done"), 1200) }}
        doneTitle="Compte créé"
        done={<p>{values.name} peut maintenant se connecter. Un e-mail de confirmation est parti à {values.email}.</p>}
        steps={[
          { title: "Entreprise", description: "SIREN et raison sociale", content: (
            <div className="grid gap-4 sm:grid-cols-2">{field("siren", "SIREN", { inputMode: "numeric" })}{field("name", "Raison sociale")}</div>
          ) },
          { title: "Contact", description: "Interlocuteur principal", content: (
            <div className="grid gap-4 sm:grid-cols-2">{field("contact", "Nom et prénom")}{field("email", "E-mail", { type: "email" })}</div>
          ) },
        ]}
        review={
          <div className="space-y-4">
            <dl className="grid gap-x-6 gap-y-2 rounded-md border p-4 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-muted-foreground">SIREN</dt><dd>{values.siren}</dd>
              <dt className="text-muted-foreground">Raison sociale</dt><dd>{values.name}</dd>
              <dt className="text-muted-foreground">Contact</dt><dd>{values.contact} · {values.email}</dd>
            </dl>
            <div className="flex items-center gap-2">
              <Checkbox id="wizard-accept" checked={values.accepted} onCheckedChange={(c) => setValues({ ...values, accepted: c === true })} />
              <Label htmlFor="wizard-accept">J’accepte les conditions d’utilisation</Label>
            </div>
          </div>
        }
      />
    </div>
  )
}
