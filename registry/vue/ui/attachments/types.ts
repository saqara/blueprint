// Saqara: the shapes of the `ai` SDK (same as prompt-input), declared here so the chat works without it.
export interface FileUIPart { type: "file", mediaType: string, filename?: string, url: string }
export interface SourceDocumentUIPart { type: "source-document", sourceId: string, mediaType: string, title: string, filename?: string }

export type AttachmentData
  = | (FileUIPart & { id: string })
    | (SourceDocumentUIPart & { id: string })

export type AttachmentMediaCategory
  = | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'source'
    | 'unknown'

export type AttachmentVariant = 'grid' | 'inline' | 'list'
