import { useState } from "react"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/registry/react/ui/field"
import { Label } from "@/registry/react/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/react/ui/radio-group"

const agencies = [
  { value: "lyon", title: "Agence de Lyon", description: "Rhône, Ain, Isère" },
  { value: "lille", title: "Agence de Lille", description: "Nord, Pas-de-Calais" },
]

export default function RadioGroupDemo() {
  const [agency, setAgency] = useState("lyon")
  return (
    <div className="grid w-full max-w-md gap-6">
      <RadioGroup defaultValue="conforme" aria-label="Conformité">
        {["conforme", "partiel", "non conforme"].map((v) => (
          <div key={v} className="flex items-center gap-2">
            <RadioGroupItem value={v} id={`radio-${v}`} />
            <Label htmlFor={`radio-${v}`}>{v}</Label>
          </div>
        ))}
      </RadioGroup>
      {/* Selectable cards: a FieldLabel wrapping a Field. allowDeselect: click the chosen card again to clear. */}
      <RadioGroup value={agency} onValueChange={setAgency} allowDeselect aria-label="Agence de rattachement">
        {agencies.map((a) => (
          <FieldLabel key={a.value} htmlFor={`agence-${a.value}`}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{a.title}</FieldTitle>
                <FieldDescription>{a.description}</FieldDescription>
              </FieldContent>
              <RadioGroupItem value={a.value} id={`agence-${a.value}`} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
      <p className="text-sm text-muted-foreground">{agency ? `Agence choisie : ${agency}` : "Aucune agence (sélection effacée)."}</p>
    </div>
  )
}
