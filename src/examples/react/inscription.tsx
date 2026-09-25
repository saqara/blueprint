import { useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/react/ui/card"
import { Checkbox } from "@/registry/react/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/registry/react/ui/field"
import { FileDropzone, type FileRejection } from "@/registry/react/ui/file-dropzone"
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/react/ui/select"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/react/ui/stepper"

// Example: supplier sign-up in three steps. The app mounts a Toaster once at its root.
type Values = { siren: string; name: string; category: string; logo: File[]; contactName: string; email: string; phone: string; accepted: boolean }
type Errors = Partial<Record<keyof Values, string>>

const EMPTY: Values = { siren: "", name: "", category: "", logo: [], contactName: "", email: "", phone: "", accepted: false }
const CATEGORIES = ["Gros œuvre", "Second œuvre", "Bureau d'études", "Fournitures"]
const STEPS = [
  { step: 1, title: "Entreprise", description: "SIREN et raison sociale" },
  { step: 2, title: "Contacts", description: "Interlocuteur principal" },
  { step: 3, title: "Validation", description: "Récapitulatif" },
]

export function stepErrors(step: number, v: Values): Errors {
  const errors: Errors = {}
  if (step === 1) {
    if (!/^\d{9}$/.test(v.siren.replace(/\s/g, ""))) errors.siren = "Le SIREN doit contenir 9 chiffres."
    if (!v.name.trim()) errors.name = "La raison sociale est obligatoire."
  }
  if (step === 2) {
    if (!v.contactName.trim()) errors.contactName = "Le nom du contact est obligatoire."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "L'e-mail n'est pas valide."
  }
  return errors
}

const reasons = { type: "format non accepté", size: "fichier trop lourd (2 Mo max.)" }

export default function InscriptionExample() {
  const [step, setStep] = useState(1)
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }))

  const goTo = (next: number) => {
    if (next > step) {
      const found = stepErrors(step, values)
      setErrors(found)
      if (Object.keys(found).length) return
    }
    setStep(next)
  }
  const submit = () => {
    toast.success("Compte créé", { description: `${values.name} peut maintenant se connecter.` })
    setValues(EMPTY)
    setErrors({})
    setStep(1)
  }
  const onReject = (rejections: FileRejection[]) => rejections.forEach(({ file, reason }) => toast.error(`${file.name} : ${reasons[reason]}`))

  return (
    <div className="flex min-h-full justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-2xl self-start">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Créer votre compte fournisseur</CardTitle>
          <CardDescription>Trois étapes, deux minutes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Stepper value={step} onValueChange={goTo} className="w-full items-start">
            {STEPS.map((s) => (
              <StepperItem key={s.step} step={s.step} className="relative flex-1 flex-col">
                <StepperTrigger>
                  <StepperIndicator>{s.step < step ? <Check className="size-4" /> : s.step}</StepperIndicator>
                  <StepperTitle>{s.title}</StepperTitle>
                  <StepperDescription>{s.description}</StepperDescription>
                </StepperTrigger>
                {s.step < STEPS.length && <StepperSeparator className="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />}
              </StepperItem>
            ))}
          </Stepper>

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.siren ? true : undefined}>
                <FieldLabel htmlFor="siren">SIREN</FieldLabel>
                <Input id="siren" inputMode="numeric" value={values.siren} aria-invalid={!!errors.siren} onChange={(e) => set("siren", e.target.value)} />
                {errors.siren && <FieldError>{errors.siren}</FieldError>}
              </Field>
              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Raison sociale</FieldLabel>
                <Input id="name" value={values.name} aria-invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Catégorie</FieldLabel>
                <Select value={values.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger id="category" className="w-full"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <FileDropzone accept="image/png,image/jpeg,image/webp,image/svg+xml" maxSize={2 * 1024 * 1024} files={values.logo}
                  onFilesChange={(f) => set("logo", f)} onReject={onReject} label="Logo de l'entreprise (PNG, JPEG, WebP, SVG — 2 Mo max.)" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.contactName ? true : undefined} className="sm:col-span-2">
                <FieldLabel htmlFor="contact">Nom et prénom</FieldLabel>
                <Input id="contact" value={values.contactName} aria-invalid={!!errors.contactName} onChange={(e) => set("contactName", e.target.value)} />
                {errors.contactName && <FieldError>{errors.contactName}</FieldError>}
              </Field>
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input id="email" type="email" value={values.email} aria-invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Téléphone (facultatif)</FieldLabel>
                <Input id="phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <dl className="grid gap-x-6 gap-y-2 rounded-md border p-4 text-sm sm:grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">SIREN</dt><dd>{values.siren}</dd>
                <dt className="text-muted-foreground">Raison sociale</dt><dd>{values.name}</dd>
                <dt className="text-muted-foreground">Catégorie</dt><dd>{values.category || "—"}</dd>
                <dt className="text-muted-foreground">Logo</dt><dd>{values.logo[0]?.name ?? "—"}</dd>
                <dt className="text-muted-foreground">Contact</dt><dd>{values.contactName} · {values.email}{values.phone && ` · ${values.phone}`}</dd>
              </dl>
              <div className="flex items-center gap-2">
                <Checkbox id="accept" checked={values.accepted} onCheckedChange={(c) => set("accepted", c === true)} />
                <Label htmlFor="accept">J'accepte les conditions d'utilisation</Label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" disabled={step === 1} onClick={() => goTo(step - 1)}>Précédent</Button>
          {step < STEPS.length
            ? <Button onClick={() => goTo(step + 1)}>Suivant</Button>
            : <Button disabled={!values.accepted} onClick={submit}>Créer le compte</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
