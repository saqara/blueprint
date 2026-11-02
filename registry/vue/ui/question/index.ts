export { default as Question } from "./Question.vue"

export interface QuestionOption {
  value: string
  label: string
  /** Second line, muted ("SAINT-VINCENT-DE-TYROSSE · Carrelage"). */
  description?: string
  disabled?: boolean
}
