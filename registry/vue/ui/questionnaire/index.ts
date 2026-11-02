import type { QuestionOption } from "@/registry/vue/ui/question"

export { default as Questionnaire } from "./Questionnaire.vue"

export interface QuestionnaireStep {
  id: string
  question: string
  options: QuestionOption[]
}
