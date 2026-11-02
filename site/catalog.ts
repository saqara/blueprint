import manifest from "../registry.react.json" with { type: "json" }

export const START_PAGES = [
  { slug: "introduction", title: "Introduction" },
  { slug: "installation", title: "Installation" },
  { slug: "tokens", title: "Thème et tokens" },
  { slug: "ia", title: "Utiliser avec une IA" },
]

export const CATEGORIES = [
  { id: "formulaires", label: "Formulaires", items: ["autocomplete", "button", "button-group", "checkbox", "field", "file-dropzone", "input", "input-group", "label", "multi-select", "password-input", "radio-group", "rating-grid", "select", "slider", "switch", "tag-input", "textarea", "toggle", "toggle-group"] },
  { id: "mise-en-page", label: "Mise en page", items: ["list-toolbar", "page-header"] },
  { id: "affichage", label: "Affichage", items: ["alert", "avatar", "badge", "card", "carousel", "empty", "progress", "scroll-area", "separator", "skeleton", "spinner", "stat-card", "table"] },
  { id: "overlays", label: "Overlays", items: ["alert-dialog", "confirm-dialog", "dialog", "dropdown-menu", "hover-card", "popover", "sheet", "sonner", "tooltip"] },
  { id: "navigation", label: "Navigation", items: ["accordion", "breadcrumb", "collapsible", "collapsible-section", "command", "pagination", "sidebar", "stepper", "tabs"] },
  { id: "donnees", label: "Données", items: ["chart", "data-table", "horizontal-scroll"] },
  // AI Elements (Vercel, Vue port by vuepont), restyled and translated: docs link to AI Elements.
  { id: "chat-ia", label: "Chat IA", items: ["agent", "attachments", "chain-of-thought", "checkpoint", "code-block", "confirmation", "context", "conversation", "file-tree", "inline-citation", "message", "model-selector", "plan", "prompt-input", "question", "queue", "reasoning", "shimmer", "sources", "stack-trace", "suggestion", "task", "terminal", "test-results", "tool"] },
  { id: "saqara", label: "Saqara", items: ["saqara-logo", "theme-toggle", "user-menu"] },
]

// V2 edition only: components restyled ("updated") or added ("new") since V1, badged in the sidebar.
// Each V2 lot adds its components here.
export const V2_STATUS: Record<string, "new" | "updated"> = {
  // Lot 1, basic controls.
  badge: "updated", button: "updated", checkbox: "updated", field: "updated", input: "updated", "input-group": "updated",
  "radio-group": "updated", slider: "updated", switch: "updated", textarea: "updated", toggle: "updated", "toggle-group": "updated",
  // Lot 2, overlays.
  "alert-dialog": "updated", command: "updated", "confirm-dialog": "updated", dialog: "updated", "dropdown-menu": "updated",
  "hover-card": "updated", popover: "updated", select: "updated", sheet: "updated", tooltip: "updated",
  // Lot 3, fluid hover.
  "data-table": "updated", sidebar: "updated", table: "updated", tabs: "updated",
}

export const BLOCKS = ["ai-chat", "app-shell-header", "app-shell-sidebar", "dashboard", "list-page", "login", "record-page", "settings-page", "wizard"]

export const EXAMPLES = [
  { slug: "annuaire", title: "Annuaire fournisseurs", description: "Liste filtrable et triable des entreprises, avec indicateurs." },
  { slug: "fiche-entreprise", title: "Fiche entreprise", description: "Informations, contacts et évaluations d'une entreprise." },
  { slug: "inscription", title: "Inscription fournisseur", description: "Parcours en trois étapes avec validation." },
  { slug: "connexion", title: "Connexion", description: "Page de connexion : mot de passe, lien magique, SSO." },
  { slug: "journal", title: "Journal d'activité", description: "Défilement infini (sentinelle) et imports en cours dans la pile de notifications." },
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
