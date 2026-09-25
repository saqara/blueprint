import { Separator } from "@/registry/react/ui/separator"

export default function SeparatorDemo() {
  return (
    <div className="max-w-sm space-y-2 text-sm">
      <p>Informations légales</p>
      <Separator />
      <p>Données financières</p>
    </div>
  )
}
