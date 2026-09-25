#!/usr/bin/env bash
# Installs every registry item into throwaway React and Vue apps, then typechecks them.
set -euo pipefail

ROOT=$(pwd)
TMP=$(mktemp -d)
# Isolated npm config: the developer's ~/.npmrc (private registries, allow-scripts) must not leak in.
touch "$TMP/.npmrc"
export NPM_CONFIG_USERCONFIG="$TMP/.npmrc"
PORT=4873
python3 -m http.server "$PORT" -d "$ROOT/public" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER; rm -rf "$TMP"' EXIT
sleep 1

items() { node -e "console.log(require('$ROOT/registry.$1.json').items.map(i => '@saqara/' + i.name).join(' '))"; }

write_common() { # $1 = app dir
  mkdir -p "$1/src"
  echo '{ "name": "smoke", "private": true, "type": "module" }' > "$1/package.json"
  printf '@import "tailwindcss";\n' > "$1/src/index.css"
}

# --- React consumer
R="$TMP/react"; write_common "$R"
cat > "$R/tsconfig.json" <<'EOF'
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
  "strict": true, "noEmit": true, "skipLibCheck": true, "paths": { "@/*": ["./src/*"] } }, "include": ["src"] }
EOF
cat > "$R/components.json" <<EOF
{ "\$schema": "https://ui.shadcn.com/schema.json", "style": "new-york", "rsc": false, "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
  "iconLibrary": "lucide", "registries": { "@saqara": "http://localhost:$PORT/r/react/{name}.json" } }
EOF
(cd "$R" && npm i -s react react-dom tailwindcss vite @vitejs/plugin-react typescript@^6 @types/react @types/react-dom \
  && npx -y shadcn@latest add $(items react) -y \
  && npx tsc -p .)

# --- Vue consumer
V="$TMP/vue"; write_common "$V"
cat > "$V/tsconfig.json" <<'EOF'
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "preserve",
  "strict": true, "noEmit": true, "skipLibCheck": true, "paths": { "@/*": ["./src/*"] } },
  "include": ["src/**/*.ts", "src/**/*.vue"] }
EOF
printf 'declare module "*.vue" { import type { DefineComponent } from "vue"; const c: DefineComponent<object, object, unknown>; export default c }\n' > "$V/src/shims.d.ts"
mkdir -p "$V/src/lib" && cp "$ROOT/lib/utils.ts" "$V/src/lib/utils.ts"
cat > "$V/components.json" <<EOF
{ "\$schema": "https://shadcn-vue.com/schema.json", "style": "new-york", "typescript": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "composables": "@/composables" },
  "iconLibrary": "lucide", "registries": { "@saqara": "http://localhost:$PORT/r/vue/{name}.json" } }
EOF
(cd "$V" && npm i -s vue tailwindcss vite @vitejs/plugin-vue typescript@^6 vue-tsc clsx tailwind-merge \
  && npx -y shadcn-vue@latest add $(items vue) -y \
  && npx vue-tsc -p .)

# --- Assertions shared by both consumers
for APP in "$R" "$V"; do
  if grep -rq "@/registry/" "$APP/src"; then echo "FAIL: unrewritten @/registry/ import in $APP"; exit 1; fi
  grep -q -- "--primary: #F04632" "$APP/src/index.css" || { echo "FAIL: theme vars missing in $APP/src/index.css"; exit 1; }
  grep -q "@fontsource/lato" "$APP/src/index.css" || { echo "FAIL: font imports missing in $APP/src/index.css"; exit 1; }
done
echo "smoke ok"
