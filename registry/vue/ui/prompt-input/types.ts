// Saqara: the shapes of the `ai` SDK (FileUIPart, ChatStatus), declared here so the chat works
// without it — an app on the AI SDK can still pass its own values.
export type ChatStatus = "submitted" | "streaming" | "ready" | "error"
export interface FileUIPart {
  type: "file"
  mediaType: string
  filename?: string
  url: string
}
import type { Ref } from 'vue'

export interface PromptInputMessage {
  text: string
  files: FileUIPart[]
}

export interface AttachmentFile extends FileUIPart {
  id: string
  file?: File
}

export interface PromptInputContext {
  textInput: Ref<string>
  files: Ref<AttachmentFile[]>
  isLoading: Ref<boolean>
  fileInputRef: Ref<HTMLInputElement | null>
  setTextInput: (val: string) => void
  addFiles: (files: File[] | FileList) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  clearInput: () => void
  openFileDialog: () => void
  submitForm: () => void
}

export const PROMPT_INPUT_KEY = Symbol('PromptInputContext')
