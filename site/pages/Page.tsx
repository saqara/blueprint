import type { Fw } from "../lib/framework"
import type { Route } from "../lib/route"
import { Home } from "./Home"
import { ItemPage } from "./ItemPage"
import { NotFound } from "./NotFound"

export function Page({ route, fw }: { route: Route; fw: Fw }) {
  switch (route.section) {
    case "home": return <Home />
    case "composants": return <ItemPage kind="composants" name={route.slug!} fw={fw} />
    case "blocs": return <ItemPage kind="blocs" name={route.slug!} fw={fw} />
    default: return <NotFound />
  }
}
