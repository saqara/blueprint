export { default as BarList } from "./BarList.vue"

export interface BarListItem {
  /** Defaults to `label`. */
  key?: string
  label: string
  value: number
  /** Makes the row a link. */
  href?: string
}
