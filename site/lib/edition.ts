import edition from "../../edition.json" with { type: "json" }

// Blueprint ships editions side by side: V1 at the root, V2 under /v2/ (one git branch each, see
// edition.json). Everything that prints a URL (site, registry, llms.txt) derives it from here.
export type Edition = keyof typeof edition.editions
export const EDITIONS = Object.keys(edition.editions) as Edition[]
export const CURRENT = edition.current as Edition

const ORIGIN = "https://saqara.github.io"
export const basePath = (e: Edition = CURRENT) => `/blueprint/${edition.editions[e]}`
export const siteUrl = (e: Edition = CURRENT) => `${ORIGIN}${basePath(e)}`
export const registryUrl = (fw: "react" | "vue", e: Edition = CURRENT) => `${siteUrl(e)}r/${fw}/{name}.json`

// The same page (query and hash kept) in another edition.
export function editionHref(target: Edition, location: { pathname: string; search: string; hash: string }): string {
  const rest = location.pathname.startsWith(basePath()) ? location.pathname.slice(basePath().length) : ""
  return `${basePath(target)}${rest}${location.search}${location.hash}`
}
