# Changelog

Une ligne par changement visible par les apps consommatrices, la plus récente en haut.

- 2026-09-25 — `saqara-theme` : tokens de texte `success-text`, `warning-text`, `info-text`, `identity-text`, `destructive-text` (classes `text-success-text`…), AA (≥ 4,5:1) sur le fond, la carte et la teinte `bg-X/10`, en clair et en sombre. `text-success` / `text-warning` restent réservés aux fonds et aux icônes. Le test de contraste couvre ces paires.
- 2026-09-25 — `saqara-theme` : embarque le reste de la base de `shadcn init` (`@custom-variant dark` sur la classe `.dark`, `* { @apply border-border outline-ring/50 }`) : `add @saqara/saqara-theme` suffit, plus besoin d'`init`. Les bordures sans couleur d'une app existante prennent la couleur `border`.
- 2026-09-25 — `saqara-theme` : installe et importe `tw-animate-css`, sans quoi `dialog`, `sheet`, `popover`… s'ouvrent sans animation dans une app installée sans `shadcn init`.
- 2026-09-25 — `confirm-dialog` (Saqara) : `await confirm({ message })` remplace `window.confirm` (titre « Confirmation », boutons « Confirmer » / « Annuler », variantes `warning`, `destructive`, `info`, `onConfirm` asynchrone qui garde la fenêtre ouverte). `alert-dialog` (Vue) : `size` et `AlertDialogMedia`, comme en React.
- 2026-09-25 — `saqara-theme` : `body` reçoit `bg-background text-foreground`, pour que les contenus portés dans `<body>` (dialog, sheet, popover…) soient lisibles en sombre dans une app installée sans `shadcn init`.
- 2026-09-25 — `dialog` : prop `size` (`sm`, `md`, `lg`, `xl` ; défaut inchangé), hauteur limitée à l'écran et `DialogBody` qui défile entre l'en-tête et le pied, libellé « Fermer » par défaut (`closeLabel`). `dialog`, `sheet`, `alert-dialog` : un dialogue contrôlé sans déclencheur rend le focus à l'élément qui l'a ouvert. Textes d'accessibilité en français dans `sheet`, `sidebar`, `breadcrumb`, `command` et `stepper`, avec un test qui interdit les restes en anglais.
- 2026-09-25 — `alert` : emplacement `AlertAction` (3e colonne, en haut à droite) et `AlertClose` (bouton X, « Fermer » par défaut) pour les alertes refermables, en React et en Vue ; `AlertTitle` n'est plus tronqué à une ligne (les titres longs passent à la ligne).
- 2026-09-25 — `button` (React) : `asChild` rendait un tableau au `Slot` depuis l'ajout de `loading` (erreur « Slot failed to slot onto its children ») ; corrigé et couvert par un test.
- 2026-09-25 — `button` : prop `loading` (Saqara) — désactive le bouton, pose `aria-busy` et affiche le spinner devant le libellé, qui reste visible. `spinner` : libellé accessible en français (« Chargement »).
- 2026-09-25 — `multi-select` : déclencheur à la hauteur des autres champs (36 px), avec ou sans badges.
- 2026-09-25 — `tag-input` (Saqara) : saisie de plusieurs valeurs en étiquettes, libre ou guidée par un catalogue (remplace MultiInput / TagCombobox de pfou-hub).
- 2026-09-25 — `chart` (React : recharts, Vue : unovis) et tokens `chart-1` à `chart-5` aux couleurs Saqara.
- 2026-09-25 — `data-table` : un 3e clic sur un en-tête retire le tri ; `aria-busy` pendant le chargement. `file-dropzone` : `*/*` accepte tout ; en mode fichier unique, les fichiers en trop sont signalés (`reason: "count"`). Shells : le titre de page est toujours un `h1`, jamais vide. `saqara-theme` : `sidebar-border` sombre distinct (`#44403C`).
- 2026-09-25 — `saqara-theme` : police monospace JetBrains Mono (`font-mono`), installée avec le thème.
- 2026-09-25 — Site de documentation : pages par composant (aperçu, code, installation), bascule React / Vue, thème clair / sombre / auto, page tokens, page « Utiliser avec une IA » et `llms.txt`, 4 exemples (Annuaire, Fiche entreprise, Inscription, Connexion). Descriptions françaises publiées pour tous les composants.
- 2026-09-25 — Lot 5 : `breadcrumb`, `collapsible`, `scroll-area`, `toggle`, `toggle-group`, `hover-card`.
- 2026-09-25 — `app-shell-header` : couleurs de la sidebar, onglets sur une ligne, titre de page affiché seulement s'il est passé (`title`). `app-shell-sidebar` : compteurs en pastilles `identity`. `login` : logo et titre centrés.
- 2026-09-25 — Lot 4 : tokens sidebar, `avatar`, `saqara-logo`, `theme-toggle`, `user-menu`, blocs `app-shell-sidebar`, `app-shell-header`, `login`.
- 2026-09-25 — `pagination` : libellés et textes d'accessibilité en français (Précédent, Suivant, Plus de pages).
- 2026-09-25 — Lot 3 : `table`, `pagination`, `slider`, `sidebar`, `stepper`, et les composants Saqara `data-table` (tri contrôlé, TanStack Table v9), `multi-select`, `file-dropzone`, `stat-card`.
- 2026-09-25 — `sonner` : toasts typés teintés aux couleurs Saqara (comme `alert`), description lisible en clair et en sombre. `saqara-theme` : ombre `shadow-lg` noire en mode sombre (plus de halo clair).
- 2026-09-25 — Lot 2 : `dialog`, `alert-dialog`, `sheet`, `popover`, `dropdown-menu`, `tabs`, `accordion`, `command`, `progress`, `empty`, `sonner` (React sans next-themes, Vue avec la feuille de style vue-sonner).
- 2026-09-25 — `saqara-theme` : neutres en palette stone (gris chauds) en clair et en sombre.
- 2026-09-25 — `badge` : variantes `success`, `warning`, `info`, `identity`. `alert` : variantes `success`, `warning`, `info`.
- 2026-09-25 — Premier registry : thème `saqara-theme`, `button`, et les composants de formulaire (`input`, `textarea`, `label`, `separator`, `field`, `checkbox`, `switch`, `radio-group`, `select`) et d'affichage (`card`, `skeleton`, `spinner`, `tooltip`).
