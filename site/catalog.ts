import manifest from "../registry.react.json" with { type: "json" }

export const START_PAGES = [
  { slug: "introduction", title: "Introduction" },
  { slug: "installation", title: "Installation" },
  { slug: "tokens", title: "Thème et tokens" },
  { slug: "ia", title: "Utiliser avec une IA" },
]

export const CATEGORIES = [
  { id: "formulaires", label: "Formulaires", items: ["button", "checkbox", "field", "file-dropzone", "input", "label", "multi-select", "radio-group", "select", "slider", "switch", "tag-input", "textarea", "toggle", "toggle-group"] },
  { id: "affichage", label: "Affichage", items: ["alert", "avatar", "badge", "card", "empty", "progress", "scroll-area", "separator", "skeleton", "spinner", "stat-card", "table"] },
  { id: "overlays", label: "Overlays", items: ["alert-dialog", "dialog", "dropdown-menu", "hover-card", "popover", "sheet", "sonner", "tooltip"] },
  { id: "navigation", label: "Navigation", items: ["accordion", "breadcrumb", "collapsible", "command", "pagination", "sidebar", "stepper", "tabs"] },
  { id: "donnees", label: "Données", items: ["chart", "data-table"] },
  { id: "saqara", label: "Saqara", items: ["saqara-logo", "theme-toggle", "user-menu"] },
]

export const BLOCKS = ["app-shell-header", "app-shell-sidebar", "login"]

export const EXAMPLES = [
  { slug: "annuaire", title: "Annuaire fournisseurs", description: "Liste filtrable et triable des entreprises, avec indicateurs." },
  { slug: "fiche-entreprise", title: "Fiche entreprise", description: "Informations, contacts et évaluations d'une entreprise." },
  { slug: "inscription", title: "Inscription fournisseur", description: "Parcours en trois étapes avec validation." },
  { slug: "connexion", title: "Connexion", description: "Page de connexion : mot de passe, lien magique, SSO." },
]

// Written for Blueprint (no upstream shadcn page to link to): descriptions end with "(Saqara)".
export const SAQARA_MADE = new Set(
  manifest.items.filter((i) => /\(Saqara\)\.?$/.test((i as { description?: string }).description ?? "")).map((i) => i.name),
)

export function itemInfo(name: string) {
  const item = manifest.items.find((i) => i.name === name)
  return item && { title: item.title as string, description: (item as { description?: string }).description ?? "", type: item.type }
}

export function pageTitle(route: { section: string; slug?: string }): string {
  if (route.section === "home") return "Accueil"
  const found =
    route.section === "demarrer" ? START_PAGES.find((p) => p.slug === route.slug)?.title
    : route.section === "exemples" ? EXAMPLES.find((e) => e.slug === route.slug)?.title
    : route.section === "composants" || route.section === "blocs" ? itemInfo(route.slug ?? "")?.title
    : undefined
  return found ?? "Introuvable"
}
