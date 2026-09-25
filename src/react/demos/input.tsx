import { Input } from "@/registry/react/ui/input"

export default function InputDemo() {
  return (
    <div className="grid max-w-sm gap-2">
      <Input placeholder="Raison sociale" />
      <Input placeholder="SIREN" aria-invalid />
      <Input placeholder="Désactivé" disabled />
    </div>
  )
}
