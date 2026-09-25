import { readManifest, writeManifest } from "./lib/manifest.ts"

const DESCRIPTIONS: Record<string, string> = {
  accordion: "Sections repliables empilées, une ou plusieurs ouvertes.",
  alert: "Message contextuel : information, succès, avertissement, erreur.",
  "alert-dialog": "Fenêtre de confirmation pour les actions importantes ou irréversibles.",
  avatar: "Image ou initiales d'une personne.",
  badge: "Étiquette courte : statut, note, rôle.",
  breadcrumb: "Fil d'Ariane indiquant la position dans l'app.",
  button: "Bouton d'action, en plusieurs variantes et tailles.",
  card: "Conteneur de contenu avec en-tête, corps et pied.",
  chart: "Graphiques (courbes, barres, aires) aux couleurs du thème.",
  checkbox: "Case à cocher.",
  collapsible: "Zone dépliable simple.",
  command: "Liste filtrable au clavier (recherche, palette de commandes).",
  dialog: "Fenêtre modale pour un formulaire ou un contenu, en 4 tailles, avec un corps qui défile.",
  "dropdown-menu": "Menu d'actions déroulant.",
  empty: "État vide avec icône, message et action.",
  field: "Champ de formulaire : libellé, aide et message d'erreur.",
  "hover-card": "Aperçu d'un contenu au survol.",
  input: "Champ de saisie texte.",
  label: "Libellé associé à un champ.",
  pagination: "Navigation entre les pages d'une liste.",
  popover: "Contenu flottant ancré à un déclencheur.",
  progress: "Barre de progression.",
  "radio-group": "Choix unique parmi plusieurs options.",
  "scroll-area": "Zone de défilement aux barres stylées.",
  select: "Liste déroulante à choix unique.",
  separator: "Séparateur horizontal ou vertical.",
  sheet: "Panneau latéral glissant.",
  sidebar: "Barre latérale de navigation repliable.",
  skeleton: "Espace réservé pendant le chargement.",
  slider: "Curseur de valeur ou d'intervalle.",
  sonner: "Notifications (toasts) aux couleurs Saqara.",
  spinner: "Indicateur de chargement.",
  stepper: "Étapes numérotées d'un parcours.",
  switch: "Interrupteur marche / arrêt.",
  table: "Tableau de données simple.",
  tabs: "Onglets pour basculer entre des vues.",
  textarea: "Champ de saisie multiligne.",
  toggle: "Bouton à deux états.",
  "toggle-group": "Groupe de boutons à bascule (choix unique ou multiple).",
  tooltip: "Info-bulle au survol ou au focus.",
}

for (const path of ["registry.react.json", "registry.vue.json"]) {
  const m = readManifest(path)
  m.items = m.items.map((i) => (!i.description && DESCRIPTIONS[i.name] ? { ...i, description: DESCRIPTIONS[i.name] } : i))
  writeManifest(path, m)
}
console.log("descriptions written")
