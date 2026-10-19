// Saqara: the tool-call shape of the `ai` SDK (ToolUIPart / DynamicToolUIPart), without depending on it.
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"

export interface ToolPart {
  type: `tool-${string}` | "dynamic-tool"
  state: ToolState
  toolName?: string
  input?: unknown
  output?: unknown
  errorText?: string
}
