import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/react/ui/field"
import { Input } from "@/registry/react/ui/input"

export default function FieldDemo() {
  return (
    <Field className="max-w-sm" data-invalid>
      <FieldLabel htmlFor="field-siren">SIREN</FieldLabel>
      <Input id="field-siren" aria-invalid defaultValue="12345" />
      <FieldDescription>9 chiffres, sans espace.</FieldDescription>
      <FieldError>Le SIREN doit contenir 9 chiffres.</FieldError>
    </Field>
  )
}
