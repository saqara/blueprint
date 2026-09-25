"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDown, XIcon } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/react/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/react/ui/popover"

export type MultiSelectOption = { value: string; label: string }

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

export function splitBadges<T>(selected: T[], max: number): { shown: T[]; hidden: number } {
  return { shown: selected.slice(0, max), hidden: Math.max(0, selected.length - max) }
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
  maxBadges?: number
  disabled?: boolean
  className?: string
}

function MultiSelect({
  options, value, onValueChange, placeholder = "Sélectionner…", searchPlaceholder = "Rechercher…",
  emptyMessage = "Aucun résultat.", clearLabel = "Tout effacer", maxBadges = 3, disabled = false, className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.filter((o) => value.includes(o.value))
  const { shown, hidden } = splitBadges(selected, maxBadges)
  const toggle = (v: string) => onValueChange(toggleValue(value, v))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} data-slot="multi-select"
          className={cn("h-auto min-h-9 w-full justify-between font-normal", className)}>
          <span className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {shown.map((o) => (
              <Badge key={o.value} variant="secondary">
                {o.label}
                <XIcon aria-hidden className="size-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggle(o.value) }} />
              </Badge>
            ))}
            {hidden > 0 && <Badge variant="outline">{`+${hidden}`}</Badge>}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.value} keywords={[o.label]} onSelect={() => toggle(o.value)}>
                  <CheckIcon className={cn(value.includes(o.value) ? "opacity-100" : "opacity-0")} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {value.length > 0 && (
            <div className="border-t p-1">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => onValueChange([])}>{clearLabel}</Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
