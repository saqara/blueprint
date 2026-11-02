import { Moon, Sun } from "lucide-react"
import { Switch } from "@/registry/react/ui/switch"

// On = dark. Until the first flip, the page follows the OS (choice "auto").
export function ThemeSwitch({ dark, onChange }: { dark: boolean; onChange: (dark: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 px-2 text-muted-foreground">
      <Sun className="hidden size-4 sm:block" aria-hidden />
      <Switch checked={dark} onCheckedChange={onChange} aria-label="Thème sombre" />
      <Moon className="hidden size-4 sm:block" aria-hidden />
    </label>
  )
}
