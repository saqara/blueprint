export type MultiSelectOption = { value: string; label: string }

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

export function splitBadges<T>(selected: T[], max: number): { shown: T[]; hidden: number } {
  return { shown: selected.slice(0, max), hidden: Math.max(0, selected.length - max) }
}
