import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

// Saqara: the tool states of the `ai` SDK's ToolUIPart, without depending on it.
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"

export type ToolUIPartApproval
  = | {
    id: string
    approved?: never
    reason?: never
  }
  | {
    id: string
    approved: boolean
    reason?: string
  }
  | undefined

export interface ConfirmationContextValue {
  approval: Ref<ToolUIPartApproval>
  state: Ref<ToolState>
}

export const ConfirmationKey: InjectionKey<ConfirmationContextValue>
  = Symbol('ConfirmationContext')

export function useConfirmationContext() {
  const context = inject(ConfirmationKey)
  if (!context)
    throw new Error('Confirmation components must be used within <Confirmation>')
  return context
}
