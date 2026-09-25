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

// Trigger text in "count" mode: the select-all label once everything is chosen, else the count.
export function summarize(count: number, total: number, countLabel: (n: number) => string, selectAllLabel?: string): string {
  return selectAllLabel && total > 0 && count === total ? selectAllLabel : countLabel(count)
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
  /** "badges" (default) or "count": a one-line summary ("3 agences"). */
  display?: "badges" | "count"
  countLabel?: (count: number) => string
  /** Adds a first entry that selects / clears everything; also the "count" summary when all are chosen. */
  selectAllLabel?: string
  /** Attributes for the trigger: data-testid, id, aria-label (required without a visible label)… */
  triggerProps?: React.ComponentProps<"button"> & Record<`data-${string}`, string | undefined>
  getOptionProps?: (option: MultiSelectOption) => Record<`data-${string}`, string | undefined>
  disabled?: boolean
  className?: string
}

function MultiSelect({
  options, value, onValueChange, placeholder = "Sélectionner…", searchPlaceholder = "Rechercher…",
  emptyMessage = "Aucun résultat.", clearLabel = "Tout effacer", maxBadges = 3,
  display = "badges", countLabel = (n) => `${n} sélectionné${n > 1 ? "s" : ""}`, selectAllLabel, triggerProps, getOptionProps,
  disabled = false, className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.filter((o) => value.includes(o.value))
  const { shown, hidden } = splitBadges(selected, maxBadges)
  const toggle = (v: string) => onValueChange(toggleValue(value, v))
  const allSelected = options.length > 0 && selected.length === options.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button {...triggerProps} variant="outline" role="combobox" aria-expanded={open} disabled={disabled} data-slot="multi-select"
          className={cn("h-auto min-h-9 w-full justify-between py-1 font-normal", className)}>
          <span className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {display === "count" && selected.length > 0 && <span>{summarize(selected.length, options.length, countLabel, selectAllLabel)}</span>}
            {display === "badges" && shown.map((o) => (
              <Badge key={o.value} variant="secondary">
                {o.label}
                <XIcon aria-hidden className="size-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggle(o.value) }} />
              </Badge>
            ))}
            {display === "badges" && hidden > 0 && <Badge variant="outline">{`+${hidden}`}</Badge>}
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
              {selectAllLabel && (
                <CommandItem value="__all__" keywords={[selectAllLabel]} onSelect={() => onValueChange(allSelected ? [] : options.map((o) => o.value))}>
                  <CheckIcon className={cn(allSelected ? "opacity-100" : "opacity-0")} />
                  {selectAllLabel}
                </CommandItem>
              )}
              {options.map((o) => (
                <CommandItem key={o.value} {...getOptionProps?.(o)} value={o.value} keywords={[o.label]} onSelect={() => toggle(o.value)}>
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
