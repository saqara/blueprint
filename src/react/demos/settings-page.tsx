import { useState } from "react"
import { SettingsPage } from "@/registry/react/blocks/settings-page"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/registry/react/ui/field"
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"
import { Switch } from "@/registry/react/ui/switch"

const saved = { prenom: "Camille", nom: "Martin", email: "camille.martin@exemple.fr", raison: "Martin Équipements SAS", siret: "91234567800021", digest: true, relances: false }

export default function SettingsPageDemo() {
  const [base, setBase] = useState(saved)
  const [values, setValues] = useState(saved)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const dirty = JSON.stringify(values) !== JSON.stringify(base)
  const set = (key: keyof typeof saved) => (value: string | boolean) => { setValues((v) => ({ ...v, [key]: value })); setStatus("idle") }

  return (
    <div className="h-[620px] overflow-auto bg-background">
      <SettingsPage
        description="Votre compte, votre organisation et vos notifications."
        dirty={dirty}
        status={status}
        warnOnLeave={false}
        onCancel={() => { setValues(base); setStatus("idle") }}
        onSave={() => { setStatus("saving"); setTimeout(() => { setBase(values); setStatus("saved") }, 800) }}
        sections={[
          {
            id: "compte", label: "Compte", description: "Vos informations personnelles.",
            content: (
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field><FieldLabel htmlFor="sp-prenom">Prénom</FieldLabel><Input id="sp-prenom" value={values.prenom} onChange={(e) => set("prenom")(e.target.value)} /></Field>
                  <Field><FieldLabel htmlFor="sp-nom">Nom</FieldLabel><Input id="sp-nom" value={values.nom} onChange={(e) => set("nom")(e.target.value)} /></Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="sp-email">E-mail</FieldLabel>
                  <Input id="sp-email" type="email" value={values.email} onChange={(e) => set("email")(e.target.value)} />
                  <FieldDescription>Utilisé pour la connexion et les notifications.</FieldDescription>
                </Field>
              </FieldGroup>
            ),
          },
          {
            id: "organisation", label: "Organisation", description: "Les informations légales de votre entreprise.",
            content: (
              <FieldGroup>
                <Field><FieldLabel htmlFor="sp-raison">Raison sociale</FieldLabel><Input id="sp-raison" value={values.raison} onChange={(e) => set("raison")(e.target.value)} /></Field>
                <Field>
                  <FieldLabel htmlFor="sp-siret">SIRET</FieldLabel>
                  <Input id="sp-siret" inputMode="numeric" value={values.siret} onChange={(e) => set("siret")(e.target.value)} />
                  <FieldDescription>14 chiffres, sans espace.</FieldDescription>
                </Field>
              </FieldGroup>
            ),
          },
          {
            id: "notifications", label: "Notifications", description: "Ce que vous recevez par e-mail.",
            content: (
              <FieldGroup>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="sp-digest">Résumé hebdomadaire des fournisseurs</Label>
                  <Switch id="sp-digest" checked={values.digest} onCheckedChange={set("digest")} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="sp-relances">Relances d’évaluation</Label>
                  <Switch id="sp-relances" checked={values.relances} onCheckedChange={set("relances")} />
                </div>
              </FieldGroup>
            ),
          },
        ]}
      />
    </div>
  )
}
