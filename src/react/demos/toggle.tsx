import { Star } from "lucide-react"
import { Toggle } from "@/registry/react/ui/toggle"

export default function ToggleDemo() {
  return <Toggle variant="outline" aria-label="Favori"><Star />Favori</Toggle>
}
