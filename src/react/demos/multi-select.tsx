import { useState } from "react"
import { MultiSelect } from "@/registry/react/ui/multi-select"

const departments = [
  ["01", "Ain"], ["13", "Bouches-du-Rhône"], ["33", "Gironde"], ["38", "Isère"], ["42", "Loire"],
  ["59", "Nord"], ["69", "Rhône"], ["75", "Paris"],
].map(([value, name]) => ({ value, label: `${value} — ${name}` }))

export default function MultiSelectDemo() {
  const [value, setValue] = useState(["69", "38"])
  return <MultiSelect className="max-w-sm" options={departments} value={value} onValueChange={setValue} placeholder="Départements" />
}
