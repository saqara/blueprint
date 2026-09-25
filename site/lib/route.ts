export type Section = "home" | "demarrer" | "composants" | "blocs" | "exemples" | "not-found"
export type Route = { section: Section; slug?: string }

const SECTIONS = new Set<Section>(["demarrer", "composants", "blocs", "exemples"])

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").split("?")[0].replace(/\/+$/, "")
  if (!path) return { section: "home" }
  const [section, slug, ...rest] = path.split("/")
  if (!SECTIONS.has(section as Section) || !slug || rest.length) return { section: "not-found" }
  return { section: section as Section, slug: decodeURIComponent(slug) }
}

export const toHash = (route: Route) => (route.section === "home" ? "#/" : `#/${route.section}/${route.slug}`)
