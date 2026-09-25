import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"
import type { ThemeChoice } from "../lib/theme"

const icons = { light: Sun, dark: Moon, auto: Monitor }

export function ThemeMenu({ value, onChange }: { value: ThemeChoice; onChange: (choice: ThemeChoice) => void }) {
  const Icon = icons[value]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Thème"><Icon /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as ThemeChoice)}>
          <DropdownMenuRadioItem value="light"><Sun />Clair</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon />Sombre</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto"><Monitor />Auto (système)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
