import type * as React from "react"
import tokens from "../../tokens/theme.json"
import { Badge } from "@/registry/react/ui/badge"
import { contrastRatio } from "../../scripts/lib/contrast.ts"

type Vars = Record<string, string>

// Each palette redefines its own mode's variables, so « Clair » renders light even when the site is dark (and vice versa).
export const cssVarsFor = (vars: Vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--${k}`, v])) as React.CSSProperties
const HEX = /^#[0-9A-Fa-f]{6}$/

function Palette({ mode, vars }: { mode: "Clair" | "Sombre"; vars: Vars }) {
  const pairs = Object.keys(vars).filter((k) => vars[`${k}-foreground`])
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{mode}</h2>
      <div style={cssVarsFor(vars)}>
        <div className="grid gap-2 rounded-lg border bg-background p-4 text-foreground sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map((k) => {
            const ratio = contrastRatio(vars[k], vars[`${k}-foreground`])
            const exception = tokens.contrastExceptions.includes(k)
            return (
              <div key={k} className="flex items-center gap-3 rounded-md border p-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-medium" style={{ background: vars[k], color: vars[`${k}-foreground`] }}>Aa</div>
                <div className="min-w-0 text-xs">
                  <div className="font-mono font-medium">--{k}</div>
                  <div className="text-muted-foreground">{vars[k]} / {vars[`${k}-foreground`]}</div>
                </div>
                <Badge className="ml-auto" variant={ratio >= 4.5 ? "success" : exception ? "warning" : "destructive"}>{ratio.toFixed(2)}:1</Badge>
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Autres valeurs : {Object.entries(vars).filter(([k, v]) => !pairs.includes(k) && !k.endsWith("-foreground") && HEX.test(v)).map(([k, v]) => `--${k} ${v}`).join(" · ")}</p>
    </section>
  )
}

export function Tokens() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Thème et tokens</h1>
        <p className="text-muted-foreground">
          Source unique : <code>tokens/theme.json</code>. Chaque paire fond / texte doit atteindre 4,5:1 (WCAG AA) ; exceptions assumées : {tokens.contrastExceptions.join(", ")} (rouge de marque).
        </p>
      </header>
      <Palette mode="Clair" vars={tokens.light} />
      <Palette mode="Sombre" vars={tokens.dark} />
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Typographie</h2>
        <p className="font-heading text-2xl">Poppins — titres</p>
        <p>Lato — texte courant, tableaux et formulaires.</p>
        <p className="font-mono">JetBrains Mono — code, identifiants (SIREN 900 000 001), montants.</p>
      </section>
    </article>
  )
}
