# Saqara Blueprint — Design

- **Date :** 2026-09-25
- **Statut :** validé en brainstorming, en attente de relecture du spec
- **Premier consommateur :** portail fournisseur V3 (`_pfou-hub/pfou-hub-v3/services/front`, React 19 + Vite 8)
- **Consommateur Vue visé :** `saqara-gui` (shadcn-vue, style `new-york`)

## 1. Objectif

Fournir aux applications Saqara (React **et** Vue) un design system basé sur shadcn/ui et shadcn-vue, aux couleurs Saqara, installable composant par composant via la CLI shadcn.

**Critères de succès**

1. Une app React peut exécuter `npx shadcn add @saqara/saqara-theme @saqara/button` et obtenir un bouton aux couleurs Saqara, en clair comme en sombre.
2. Une app Vue peut exécuter `npx shadcn-vue add @saqara/saqara-theme @saqara/button` avec le même résultat.
3. Chaque composant du registry existe dans les deux frameworks (parité vérifiée en CI).
4. La vitrine publique montre chaque composant, en React et en Vue, en clair et en sombre.

**Hors scope**

- La migration de pfou-hub-v3 vers Blueprint : elle se fera ailleurs, progressivement, composant par composant. Le passage de pfou-hub à Tailwind v4 est un prérequis côté pfou-hub.
- Tout paquet npm publié.

## 2. Contexte et leçons des tentatives précédentes

| Repo | Période | Stack | Fin |
|---|---|---|---|
| `saqara/design-system` | 2021-03 → 2021-07 | React 17, Tailwind 2, Twind, divriots dsd | remplacé après 4 mois |
| `saqara/saqara-design-system` | 2021-05 → 2022-06 | React 17, Tailwind, react-aria, Backlight.dev | archivé |
| `saqara/front-packages` → `@saqara/design-system` 2.x | → 2023-07 | React 17, Tailwind 3, react-aria, Storybook, Rollup | inactif ; encore consommé par signature |

Point commun aux trois : un paquet npm sur GitHub Packages, un outillage lourd ou hébergé chez un prestataire, et plus personne pour le maintenir après le départ de l'équipe. Blueprint prend le contre-pied : **pas de paquet ni de pipeline de release**. Le code est copié dans l'app par la CLI shadcn.


## 3. Architecture

Un seul projet, sans monorepo, avec npm (pnpm/corepack absents du poste ; npm est aussi le gestionnaire de pfou-hub).

```
blueprint/
├─ tokens/theme.json            # source unique des tokens (light + dark)
├─ registry/react/ui/*.tsx      # composants shadcn React customisés
├─ registry/vue/ui/*.vue        # composants shadcn-vue customisés
├─ registry.react.json          # manifeste React (item theme injecté par sync-theme)
├─ registry.vue.json            # manifeste Vue   (item theme injecté par sync-theme)
├─ scripts/sync-theme.ts        # tokens/theme.json → item "saqara-theme" des 2 manifestes
├─ scripts/check-parity.ts      # échoue si un item existe dans un manifeste et pas l'autre
├─ src/                         # vitrine Vite multi-pages
│  ├─ react.html + react/       # une section par composant (démos React)
│  └─ vue.html + vue/           # une section par composant (démos Vue)
├─ public/r/react/*.json        # généré par `shadcn build`, jamais édité à la main
├─ public/r/vue/*.json          # généré par `shadcn-vue build`, jamais édité à la main
└─ .github/workflows/pages.yml
```

**Build :** `sync-theme`, puis `shadcn build registry.react.json -o public/r/react`, puis `shadcn-vue build registry.vue.json -o public/r/vue`, puis `vite build`. Le tout est déployé sur GitHub Pages : `https://saqara.github.io/blueprint/`. Le repo est **public**.

**Vitrine :** Vite avec `@vitejs/plugin-react` et `@vitejs/plugin-vue`, deux entrées HTML. Pas de routeur : une page par framework, des ancres par composant, et un bouton pour basculer entre clair et sombre (classe `.dark`).

**Côté consommateur**, dans `components.json` :

```jsonc
// App React
"registries": { "@saqara": "https://saqara.github.io/blueprint/r/react/{name}.json" }
// App Vue
"registries": { "@saqara": "https://saqara.github.io/blueprint/r/vue/{name}.json" }
```

Les noms d'items sont identiques dans les deux frameworks : `@saqara/button`, `@saqara/dialog`, etc.

**Choix par défaut :** icônes lucide (`lucide-react` / `@lucide/vue`, ceux des registries officiels), primitives Radix (React) et Reka UI (Vue), Tailwind v4, mode sombre via la classe `.dark`.

## 4. Tokens

Source de vérité : les tokens de `@saqara/design-system` 2.x (consommés par signature), recalés sur le site vitrine saqara.com.

Neutres : palette **stone** de Tailwind (gris chauds) dans les deux modes, décision du 2026-09-25 après revue du mode sombre.

On garde les **noms de variables shadcn**, pour que les composants officiels fonctionnent sans retouche. Les couleurs sont en hex, comme la source ; Tailwind v4 les accepte, pas besoin de conversion OKLCH.

### 4.1 Couleurs

| Variable | Clair | Sombre |
|---|---|---|
| `--background` / `--foreground` | `#FFFFFF` / `#292524` (stone-800) | `#0C0A09` (stone-950) / `#FAFAF9` (stone-50) |
| `--card` / `--popover` | `#FFFFFF` (texte `#292524`) | `#1C1917` stone-900 (texte `#FAFAF9`) |
| `--primary` / `--primary-foreground` | `#F04632` / `#FFFFFF` | `#F04632` / `#FFFFFF` |
| `--secondary` / `--secondary-foreground` | `#F5F5F4` (stone-100) / `#1C1917` | `#292524` (stone-800) / `#FAFAF9` |
| `--muted` / `--muted-foreground` | `#F5F5F4` / `#57534E` (stone-600) | `#292524` / `#A8A29E` (stone-400) |
| `--accent` / `--accent-foreground` | `#FDECEB` / `#B32019` | `#292524` / `#FAFAF9` |
| `--destructive` / `--destructive-foreground` | `#C2002C` / `#FFFFFF` | `#FF5A6E` / `#0C0A09` |
| `--border` / `--input` | `#E7E5E4` (stone-200) / `#E7E5E4` | `#292524` / `#44403C` (stone-700) |
| `--ring` | `#F04632` | `#F04632` |

**Ajouts propres à Saqara**, exposés en utilitaires Tailwind (`bg-success`, `text-identity`…) via `@theme inline` :

| Variable | Valeur | `-foreground` |
|---|---|---|
| `--identity` (rouge de marque) | `#F04632` | `#FFFFFF` |
| `--navy` | `#283549` | `#FFFFFF` |
| `--success` | `#6EBD71` | `#0C0A09` |
| `--warning` | `#E59A06` | `#0C0A09` |
| `--info` | `#0A5CD6` | `#FFFFFF` |

Trois valeurs ont été foncées pour atteindre AA (calcul du 2026-09-25) : `muted-foreground` `#73757C` → `#646671` (gray-700 du DS v2, 5,14:1), `destructive` `#F02548` → `#C2002C` (alert-900 du DS v2, 6,31:1), `info` `#0E6EFF` → `#0A5CD6` (valeur dérivée hors rampe, 5,97:1).

Les valeurs sombres sont des propositions. Elles sont validées par le test de contraste (§7), puis relues visuellement dans la vitrine.

**Exception de contraste assumée :** un texte blanc sur `--primary` (`#F04632`) donne 3,73:1, sous le seuil WCAG AA de 4,5:1 pour du texte normal. C'est un choix de marque, pris en connaissance de cause. Même chose pour `--identity` / `--identity-foreground`. Les deux paires sont déclarées comme exceptions dans le test.

### 4.2 Typographie

- `--font-heading` : Poppins (400/500/600), pour les titres.
- `--font-sans` : Lato (400/700), pour le texte et les tableaux.
- Les polices sont chargées par les dépendances `@fontsource/poppins` et `@fontsource/lato` de l'item `saqara-theme`. Pas de lien Google Fonts.
- On garde l'échelle de tailles Tailwind par défaut. L'échelle du DS v2 renommait `md` et `lg`, ce qui casserait les classes des composants shadcn.

### 4.3 Formes et ombres

- `--radius: 0.375rem`, ce qui donne `rounded-md` à 4 px, comme le `rounded` du DS v2.
- Ombres reprises du DS v2 :
  - `--shadow-sm: 0 4px 4px rgba(0,0,0,.1)`
  - `--shadow-md: 0 10px 20px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.04), 0 0 1px rgba(0,0,0,.04)`
  - `--shadow-lg: 0 10px 72px var(--shadow)`, où `--shadow` dépend du mode : `rgba(155,154,154,.3)` en clair (valeur DS v2), `rgba(0,0,0,.6)` en sombre (une ombre grise faisait un halo clair sur fond sombre)

## 5. Composants

Chaque composant est livré en React **et** en Vue, avec une démo dans chaque vitrine. Il part du composant officiel shadcn / shadcn-vue, restylé par les tokens, et ajoute des variantes seulement quand pfou-hub en a besoin.

| Lot | Contenu |
|---|---|
| **0 — Socle** | repo, `tokens/theme.json`, `sync-theme`, `check-parity`, vitrine, CI Pages, test de contraste, item `saqara-theme` |
| **1 — Bases** | Button, Badge (+ `success`/`warning`/`info`/`identity`), Alert (+ mêmes variantes), Card, Input, Textarea, Label, Field, Checkbox, Switch, RadioGroup, Select, Tooltip, Skeleton, Spinner, Separator |
| **2 — Overlays & navigation** | Dialog, AlertDialog, Sheet, DropdownMenu, Popover, Tabs, Accordion, Command, Sonner, Progress, Empty |
| **3 — Composés Saqara** | DataTable (TanStack), MultiSelect / TagCombobox, FileDropzone, Slider, Pagination, Stepper, StatCard, Sidebar |
| **4 — Blocs Saqara** (`registry:block`) | `app-shell` (sidebar repliable, header + logo, menu profil, bascule clair/sombre, menu mobile en Sheet — structure calquée sur le shell de pfou-hub, construit sur le bloc sidebar officiel) ; `login` (connexion + SSO). Aucun code repris de signature (`@saqara/layouts`, React 17 + Material UI) ni de pfou-hub. |

**Points de vigilance**

- Stepper n'existe que dans shadcn-vue : il faut l'écrire côté React.
- MultiSelect n'existe dans aucun des deux : il est écrit dans les deux frameworks à partir de Command et Popover.
- Sonner s'appuie sur `sonner` en React et sur `vue-sonner` en Vue. La version React n'utilise pas `next-themes` : l'app passe `theme` au `Toaster`. Les toasts typés (`success`, `info`, `warning`, `error`) sont teintés comme les Alert : fond à 10 % de la couleur, bordure à 50 %, texte normal, icône colorée ; la description utilise `muted-foreground`.

### 5.1 Lot 3 — détail (validé le 2026-09-25)

**Repris tels quels des registries officiels :** `table`, `pagination`, `slider`, `sidebar` (React + Vue) et `stepper` côté Vue.

**Composants Saqara (React + Vue).** Textes par défaut en français, tous surchargeables par props.

| Item | API | Construit sur |
|---|---|---|
| `data-table` | `columns` (TanStack `ColumnDef`), `data`, `getRowId`, `sorting` + `onSortingChange` (toujours contrôlé : la page trie, serveur ou client), `loading` (lignes squelette, 5 par défaut), `emptyMessage`, `stickyHeader`, `stickyFirstColumn`. En-tête triable (`DataTableColumnHeader`) avec flèches et `aria-sort`. | `table`, `button`, `skeleton`, `@tanstack/react-table` / `@tanstack/vue-table` |
| `multi-select` | `options: { value, label }[]`, `value` + `onValueChange` (Vue : `v-model`), `placeholder`, `searchPlaceholder`, `emptyMessage`, `maxBadges` (3 par défaut, puis « +N »), `disabled`. Recherche clavier, badges retirables, « Tout effacer ». Liste fermée : pas de création de valeur. | `popover`, `command`, `badge` |
| `stepper` (React) | Même API que le Stepper shadcn-vue : `Stepper`, `StepperItem`, `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperDescription`, `StepperSeparator` ; `value` contrôlé + `onValueChange`, `orientation`, flèches clavier entre étapes. | React + `cn` |
| `file-dropzone` | `accept` (MIME, `type/*`, extensions), `maxSize` (octets), `multiple`, `files` + `onFilesChange`, `onReject({ file, reason: "type" \| "size" }[])`, `disabled`. Liste des fichiers avec retrait. Pas d'upload : l'app envoie et affiche sa `progress`. | `<input type="file">` natif, `button` |
| `stat-card` | `label`, `value`, `description?`, emplacement icône. | `card` |

**Tests :** la logique pure (acceptation/refus de fichiers, bascule d'une valeur, calcul « +N », état d'une étape) est testée avec les mêmes cas en React et en Vue. Chaque démo passe par le rendu SSR, la parité et le smoke. Interactions (clic, clavier) vérifiées à l'écran : pas de jsdom ni de Testing Library.

**Hors lot 3 :** upload intégré, création de valeurs (TagCombobox, MultiInput), tri/pagination/filtres intégrés à la DataTable.

### 5.2 Lot 4 — blocs (validé le 2026-09-25)

Le lot 4 remplace la ligne « 4 — Blocs Saqara » du tableau ci-dessus : deux shells au lieu d'un, et un login à trois méthodes.

**Briques partagées (`registry:ui`, React + Vue)**

| Item | API |
|---|---|
| `saqara-logo` | Symbole « S » de Saqara (SVG de signature) : partie rouge en `--identity`, partie sombre en `currentColor` (lisible en sombre). `withText` ajoute « Saqara » en `font-heading`. |
| `theme-toggle` | Bouton soleil/lune. `theme: "light" \| "dark"` + `onThemeChange` (Vue : `v-model:theme`). Purement visuel : l'app garde son gestionnaire de thème. |
| `user-menu` | DropdownMenu : avatar à initiales (`avatar` officiel), nom, email, emplacement pour des entrées, « Se déconnecter » (`onSignOut`). |

Modèle de navigation commun aux shells : `AppNavItem = { id, label, icon?, badge?, href? }`, avec `activeId` et `onNavigate(id)`. Sans routeur : `<a>` si `href`, sinon bouton. L'entrée active porte `aria-current="page"`.

**Blocs (`registry:block`, React + Vue, un fichier chacun)**

| Bloc | Contenu |
|---|---|
| `app-shell-sidebar` | Sidebar officielle repliable en icônes (logo en tête, `user-menu` en pied, badges sur les entrées) + header (`SidebarTrigger`, titre et icône de page, `theme-toggle`). Sheet automatique sur mobile. |
| `app-shell-header` | Structure de pfou-hub : header collant (logo, séparateur, titre de page), onglets avec badges, `theme-toggle`, `user-menu` ; sur mobile, bouton menu qui ouvre la navigation dans un Sheet. |
| `login` | Card centrée : logo, titre, description. Méthodes activables : `password` (email, mot de passe, « Mot de passe oublié »), `magicLink` (« Recevoir un lien de connexion »), `sso` (bouton en tête + séparateur « ou »). Callbacks `onPasswordSubmit`, `onMagicLinkSubmit`, `onSso`, `onForgotPassword`. État `status: "idle" \| "loading" \| "sent"` + `error` (`role="alert"`). Écran « Vérifiez votre boîte mail » avec l'adresse et « Utiliser une autre adresse ». |

**Tests :** rendu SSR dans les deux frameworks (champs selon les méthodes, écran « envoyé », erreur, entrée active, badges) ; calcul des initiales en logique pure. **Vitrine :** chaque bloc dans un cadre fixe (600 px, `transform` pour contenir la sidebar `fixed`).

**Hors lot 4 :** l'auth elle-même (Keycloak, envoi du lien), le routage, les sous-menus imbriqués.

**Lot 5 (2026-09-25) :** `breadcrumb`, `collapsible`, `scroll-area`, `toggle`, `toggle-group`, `hover-card`, repris tels quels (React + Vue). Reportés à la demande : `chart`, `calendar` / `date-picker`, `tag-input`, champs téléphone / devise / pays.

**Hors V1 :** Chart (recharts d'un côté, unovis de l'autre, parité coûteuse) et DatePicker (pas de besoin dans pfou-hub).

## 6. Conventions

- Code, commentaires et noms en anglais. Documentation et contenu de la vitrine en français.
- Un composant = un item de registry = un fichier par framework, avec le même nom (`button.tsx` / `Button.vue`, suivant la convention de chaque CLI).
- Les imports internes du registry passent par `@/registry/...`, comme l'exigent les deux CLI.
- `CHANGELOG.md` à la racine : une ligne par changement visible par les apps consommatrices. Pas de semver.

## 7. Tests et CI

À chaque PR :

1. `check-parity` : mêmes noms d'items dans `registry.react.json` et `registry.vue.json`.
2. Test de contraste (Vitest) sur `tokens/theme.json` : chaque paire `X` / `X-foreground`, ainsi que `muted-foreground` et `destructive` utilisés comme texte sur `background` et `card`, doit atteindre au moins 4,5:1, en clair comme en sombre. Les exceptions déclarées, aujourd'hui `primary` et `identity` (3,73:1), sont tolérées.
3. `tsc --noEmit` (React) et `vue-tsc --noEmit` (Vue).
4. `shadcn build` + `shadcn-vue build` + `vite build`. La vitrine importe tous les composants, donc son build sert de test d'intégration.

Sur `main` : même pipeline, puis déploiement GitHub Pages.

Pas de tests unitaires par composant : les composants viennent de shadcn, déjà testés en amont. On ajoute un test quand on écrit de la logique propre (MultiSelect, Stepper React, DataTable).

## 8. Décisions

| # | Décision | Alternative écartée |
|---|---|---|
| D1 | Identité visuelle : tokens du DS v2 (signature), recalés sur saqara.com | palette pfou-hub, thème shadcn neutre |
| D2 | Distribution : registry shadcn | paquet npm, hybride |
| D3 | Tailwind v4 | Tailwind 3.4 (branche legacy de shadcn) |
| D4 | Vitrine : Vite multi-pages sur GitHub Pages, repo public | Storybook, rien |
| D5 | Migration de pfou-hub : progressive, hors de ce repo | adaptateurs, big bang |
| D6 | Parité complète React + Vue | thème seul pour Vue |
| D7 | `--primary` = `#F04632` exact, exception AA assumée | `#CF342B` conforme AA |
| D8 | Poppins pour les titres, Lato pour le texte | Poppins seule, Lato seule |

## 9. Site de documentation (validé le 2026-09-25)

Remplace la vitrine (`react.html`, `vue.html`) par un vrai site de doc, **construit avec Blueprint** (dogfooding), toujours publié sur `https://saqara.github.io/blueprint/`.

### 9.1 Architecture

- Un seul point d'entrée `index.html`. `react.html` et `vue.html` deviennent des redirections vers le site (anciens liens conservés).
- Habillage écrit en React avec les composants Blueprint : `app-shell-sidebar` (navigation), `tabs` (Aperçu / Code), `toggle-group` (React | Vue), `dropdown-menu` (thème), `breadcrumb`, `scroll-area`.
- En mode Vue, chaque démo Vue est montée dans un îlot (`createApp(...).mount()` dans un composant React), démontée au changement de page ou de framework.
- **Framework** : bascule React | Vue dans le header, mémorisée (localStorage) et reflétée dans l'URL (`?fw=vue`) pour qu'un lien partagé ouvre le bon framework. Défaut : React.
- **Thème** : menu Clair / Sombre / Auto, **Auto par défaut** (suit `prefers-color-scheme` et ses changements), mémorisé en localStorage, appliqué par la classe `.dark` sur `<html>` avant le premier rendu (pas de flash).
- **Routage** par hash, sans librairie : `#/` (accueil), `#/demarrer/<page>`, `#/composants/<nom>`, `#/blocs/<nom>`, `#/exemples/<nom>`. Route inconnue → page « Introuvable » avec lien vers l'accueil.

### 9.2 Navigation

- **Démarrer** : Introduction, Installation (React, Vue), Thème et tokens.
- **Composants**, par catégorie : Formulaires, Affichage, Overlays, Navigation, Données, Saqara. Chaque item du registry (hors thème, hooks et blocs) apparaît dans exactement une catégorie ; un test le vérifie.
- **Blocs** : `app-shell-sidebar`, `app-shell-header`, `login`.
- **Exemples** : Annuaire fournisseurs, Fiche entreprise, Inscription fournisseur, Connexion.

### 9.3 Pages

- **Composant / bloc** : titre et description (lus dans les manifestes du registry ; les composants repris de shadcn reçoivent une description française, publiée aussi pour les apps), commande d'installation du framework actif avec bouton Copier, onglets **Aperçu** (la démo existante) et **Code** (le source réel de la démo via `?raw`, coloré par Shiki, thèmes clair/sombre). Lien vers la doc officielle shadcn / shadcn-vue pour les composants repris.
- **Thème et tokens** : générée depuis `tokens/theme.json` — nuancier clair et sombre, valeur hex, ratio de contraste de chaque paire (fonction `contrastRatio` existante), exceptions signalées.
- **Exemples** : écrans complets, en React et en Vue, avec Aperçu (dans un cadre) et Code. Ils assemblent les composants comme une vraie app, avec des données fictives :
  - *Annuaire fournisseurs* : `app-shell-sidebar`, StatCards, filtres (`multi-select`, `slider`, `toggle-group`), `data-table` triable avec badges de note, `pagination`, `hover-card` sur la raison sociale.
  - *Fiche entreprise* : `breadcrumb`, en-tête avec badges, `tabs` (Informations, Contacts, Évaluations), `accordion`, `dialog` d'ajout de contact, `sonner` de confirmation.
  - *Inscription fournisseur* : `stepper` en 3 étapes (Entreprise, Contacts, Validation), `field` / `input` / `select`, `file-dropzone` pour le logo, validation, récapitulatif.
  - *Connexion* : bloc `login` plein écran (mot de passe, lien magique, SSO).

### 9.4 Tests

- La parité exige chaque exemple dans les deux frameworks (`src/examples/{react,vue}/`).
- Rendu SSR de chaque démo et de chaque exemple.
- Logique pure : lecture d'une route (`parseRoute`), résolution du thème (`resolveTheme("auto", prefersDark)`), couverture des catégories.

### 9.5 Hors périmètre

Recherche, tableau des props, version anglaise, versionnage de la doc.
