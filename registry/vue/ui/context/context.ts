import type { ComputedRef, InjectionKey } from "vue"
import { inject } from "vue"

// Saqara: the token fields of the `ai` SDK's LanguageModelUsage, without depending on it.
export interface ContextUsage {
  inputTokens?: number
  outputTokens?: number
  reasoningTokens?: number
  cachedInputTokens?: number
}

// Saqara: costs come from the app (it knows its model's pricing), not from a bundled price list
// (tokenlens). Leave one out and its row shows tokens only; without `total` the footer is hidden.
export interface ContextCosts {
  input?: number
  output?: number
  reasoning?: number
  cache?: number
  total?: number
}

export interface ContextContextValue {
  usedTokens: ComputedRef<number>
  maxTokens: ComputedRef<number>
  usage: ComputedRef<ContextUsage | undefined>
  costs: ComputedRef<ContextCosts | undefined>
  currency: ComputedRef<string>
}

export const ContextKey: InjectionKey<ContextContextValue> = Symbol("ContextContext")

export function useContextValue(): ContextContextValue {
  const context = inject<ContextContextValue>(ContextKey)
  if (!context) {
    throw new Error("Context components must be used within Context")
  }
  return context
}

export const percent = (value: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, style: "percent" }).format(value)
export const compact = (value: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(value)
export const money = (value: number, currency: string) => new Intl.NumberFormat("fr-FR", { currency, maximumFractionDigits: 4, style: "currency" }).format(value)
