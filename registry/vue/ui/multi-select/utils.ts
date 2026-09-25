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
