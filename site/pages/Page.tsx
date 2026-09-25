import type { Fw } from "../lib/framework"
import type { Route } from "../lib/route"
import { Ai } from "./Ai"
import { ExamplePage } from "./ExamplePage"
import { Home } from "./Home"
import { Installation } from "./Installation"
import { Introduction } from "./Introduction"
import { Tokens } from "./Tokens"
import { ItemPage } from "./ItemPage"
import { NotFound } from "./NotFound"

export function Page({ route, fw }: { route: Route; fw: Fw }) {
  switch (route.section) {
    case "home": return <Home />
    case "demarrer":
      if (route.slug === "introduction") return <Introduction />
      if (route.slug === "installation") return <Installation fw={fw} />
      if (route.slug === "tokens") return <Tokens />
      if (route.slug === "ia") return <Ai fw={fw} />
      return <NotFound />
    case "composants": return <ItemPage kind="composants" name={route.slug!} fw={fw} />
    case "blocs": return <ItemPage kind="blocs" name={route.slug!} fw={fw} />
    case "exemples": return <ExamplePage slug={route.slug!} fw={fw} />
    default: return <NotFound />
  }
}
