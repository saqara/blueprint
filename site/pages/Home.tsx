import { ArrowRight } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/registry/react/ui/card"
import { BLOCKS, CATEGORIES, EXAMPLES } from "../catalog"

export function Home() {
  const count = CATEGORIES.reduce((n, c) => n + c.items.length, 0)
  const cards = [
    { href: "#/demarrer/installation", title: "Installation", text: "Déclarer le registry et installer le thème en deux commandes." },
    { href: `#/composants/button`, title: `${count} composants`, text: "Formulaires, overlays, navigation, données — en React et en Vue." },
    { href: `#/blocs/${BLOCKS[0]}`, title: `${BLOCKS.length} blocs`, text: "Shells d'application et page de connexion prêts à l'emploi." },
    { href: `#/exemples/${EXAMPLES[0].slug}`, title: `${EXAMPLES.length} exemples`, text: "Écrans complets du portail fournisseur." },
  ]
  return (
    <div className="space-y-10">
      <section className="space-y-4 py-6">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Saqara Blueprint" className="size-16 rounded-2xl" />
        <h1 className="max-w-2xl text-4xl font-semibold">Le design system des applications Saqara.</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Des composants shadcn/ui et shadcn-vue aux couleurs Saqara, installés dans votre app par la CLI : le code vous appartient.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">{c.title}<ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" /></CardTitle>
                <CardDescription>{c.text}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </section>
    </div>
  )
}
