import type { ComputedRef, InjectionKey } from 'vue'
import { inject } from 'vue'

// Saqara: ANSI escapes (colours, cursor moves) are stripped rather than rendered, so the terminal
// needs no ANSI library; the copy button copies the same clean text.
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g
export const stripAnsi = (text: string) => text.replace(ANSI, "")

export interface TerminalContextValue {
  output: ComputedRef<string>
  isStreaming: ComputedRef<boolean>
  autoScroll: ComputedRef<boolean>
  hasClear: ComputedRef<boolean>
  onClear: () => void
}

export const TerminalKey: InjectionKey<TerminalContextValue> = Symbol('Terminal')

export function useTerminalContext(componentName: string): TerminalContextValue {
  const context = inject(TerminalKey)

  if (!context) {
    throw new Error(`${componentName} must be used within Terminal`)
  }

  return context
}
