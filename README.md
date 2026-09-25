# Saqara Blueprint

Design system Saqara : un registry [shadcn/ui](https://ui.shadcn.com) (React) et [shadcn-vue](https://www.shadcn-vue.com) (Vue), aux couleurs Saqara.

Vitrine : https://saqara.github.io/blueprint/

## Utiliser Blueprint dans une app

Prérequis : Tailwind v4 et `shadcn init` (React) ou `shadcn-vue init` (Vue) déjà faits.

1. Déclarer le registry dans `components.json` :

   ```jsonc
   // React
   "registries": { "@saqara": "https://saqara.github.io/blueprint/r/react/{name}.json" }
   // Vue
   "registries": { "@saqara": "https://saqara.github.io/blueprint/r/vue/{name}.json" }
   ```

2. Installer le thème, puis les composants :

   ```bash
   npx shadcn@latest add @saqara/saqara-theme @saqara/button        # React
   npx shadcn-vue@latest add @saqara/saqara-theme @saqara/button    # Vue
   ```

Composants qui demandent un élément racine :
- `tooltip` (React) : placer un `<TooltipProvider>` à la racine de l'app.
- `sonner` : monter `<Toaster />` une fois à la racine. En React, passer `theme="light" | "dark"` depuis le thème de l'app (défaut : `light`, comme en Vue). En Vue, la feuille de style de `vue-sonner` est importée par le composant (l'app doit déclarer les types `vite/client`, présents par défaut dans un projet Vite).

Le code est copié dans l'app : il lui appartient. Pour récupérer une mise à jour, relancer `add` avec `--overwrite` et relire le diff.

## Développer

Node ≥ 24 et npm.

```bash
npm i
npm run dev            # vitrine sur http://localhost:5173/blueprint/react.html
npm run vendor -- card # importe un composant officiel (React + Vue) dans registry/
npm run check          # parité, tests, types
npm run build          # registry JSON + vitrine dans dist/
npm run smoke          # installe tout dans des apps jetables (après build)
```

- Les couleurs se changent dans `tokens/theme.json`, jamais dans `src/theme.css` (généré).
- Chaque composant doit exister en React **et** en Vue, avec une démo dans `src/react/demos/` et `src/vue/demos/`.
- Un composant personnalisé ne se réimporte qu'avec `--force`, en connaissance de cause.
- TypeScript reste en 6.x tant que `vue-tsc` ne supporte pas TypeScript 7.
