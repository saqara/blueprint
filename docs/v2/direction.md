# Direction visuelle V2

Référence : [Fluid Functionalism](https://www.fluidfunctionalism.com/) (motion, tailles de texte, sensation). Ce fichier fixe les règles de chaque lot de la V2 ; ne pas les redemander.

## Décisions de Simon (2026-11-02)

| Sujet | Décision |
|---|---|
| Esprit | Sobre et dense, à la Fluid Functionalism. |
| Couleurs | Gris neutres purs. Bouton principal noir (clair) / blanc (sombre). Rouge Saqara `#F04632` = seule couleur d'accent : anneau de focus, switch coché, sélection. Les erreurs restent en rouge foncé `destructive` avec une icône, pour ne pas se confondre avec le focus. |
| Rayons | 6 px pour les contrôles (`rounded-md`), 10 px pour les conteneurs (`rounded-xl`). |
| Polices | Poppins pour les titres (celle de saqara.com), Geist pour le contenu, Maple Mono pour le code. |
| Motion | Bibliothèques Motion : `motion` (React), `motion-v` (Vue), avec les presets de `@saqara/springs`. |
| Survol fluide | Menus, select, command, tabs, sidebar, table et data-table. Pas dans les listes où un mauvais clic coûte cher. |

## Texte

5 styles, et les classes Tailwind de taille sont réglées dessus par le thème :

| Rôle | Classe | Taille / interligne |
|---|---|---|
| Titre de page | `text-3xl` | 28 / 34 px |
| Titre de section | `text-lg` | 16 / 22 px |
| Sous-titre, titre de carte | `text-base` | 14 / 20 px |
| Corps : libellés, menus, paragraphes | `text-sm` | 13 / 20 px |
| Légende, métadonnées | `text-xs` | 12 / 16 px |

- 3 graisses : normal pour le texte, semibold pour les titres et l'élément sélectionné, bold pour le titre de page seulement.
- 2 couleurs de texte : `text-foreground` et `text-muted-foreground`. Pas de texte en opacité (`/60`).
- Pas de majuscules, pas d'espacement de lettres, pas de surtitre au-dessus d'un titre.
- Geist n'a pas d'axe de taille optique : un libellé qui passe en semibold s'élargit. Réserver sa largeur avec une copie invisible en semibold dans la même cellule de grille.

## Tailles

Deux crans seulement : 36 px par défaut (`h-9`) et 28 px compact (`h-7`), pour les boutons, champs, selects, onglets et lignes de menu ou de table. Le cran compact réduit tout ensemble : texte 13 → 12 px, icône 16 → 14 px, padding 12 → 10 px, écart 8 → 4 px.

## Motion

Règle : **la réponse part tout de suite et se pose lentement.** Ce n'est pas un délai, c'est de l'inertie.

1. Trois vitesses de ressort, jamais de durée écrite à la main (`@saqara/springs`) :
   - `fast` 0,08 s, sans rebond : survol, fondus, tooltips, anneau de focus.
   - `moderate` 0,16 s, sans rebond, se pose exactement : menus, onglets, panneaux.
   - `slow` 0,24 s, rebond 0,12 : dialogues, sheets, grandes surfaces.
   Plus l'élément est grand, plus le ressort est lent.
2. La sortie est un tween sans rebond, un cran plus rapide que l'entrée (0,06 / 0,12 / 0,16 s) : `spring.<vitesse>.exit`.
3. Appui rapide, relâché lent : l'appui suit en 80 ms, le relâchement en 180 ms sur `ease-tail` (`cubic-bezier(.23,1,.32,1)`), la courbe à longue traîne.
4. Survol fluide : une seule surbrillance par liste, qui glisse (`spring.fast`) jusqu'à l'élément sous le curseur au lieu de clignoter d'un élément à l'autre.
5. Animer `transform` et `opacity`, jamais `top`, `left`, `width` ou `height`.
6. Mouvement réduit : moins, pas rien. On garde les fondus, on coupe les déplacements et les changements d'échelle.

Pour une transition CSS simple (couleur, bordure), le thème expose `duration-fast` / `duration-moderate` / `duration-slow` et `ease-tail`.

## Lots

| Lot | Contenu |
|---|---|
| 0 | Fondations : couleurs, rayons, polices, échelle de texte, ombres, presets de ressort, ce fichier. |
| 1 | Contrôles de base : button, input, textarea, checkbox, radio, switch, slider, badge, toggle, label, field… |
| 2 | Surcouches : dialog, alert-dialog, sheet, popover, hover-card, tooltip, dropdown-menu, select, command, sonner… |
| 3 | Survol fluide (hook React + composable Vue) sur menus, tabs, sidebar, table, data-table. |
| 4 | Contenus : card, alert, accordion, stepper, page-header, skeleton, progress, empty… |
| 5 | Composants IA, puis blocs et site de doc. |
