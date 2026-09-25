export function Introduction() {
  return (
    <article className="space-y-4 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
      <h1 className="text-3xl font-semibold">Introduction</h1>
      <p>
        Blueprint est le design system des applications Saqara. C'est un registry{" "}
        <a className="text-primary underline-offset-4 hover:underline" href="https://ui.shadcn.com" target="_blank" rel="noreferrer">shadcn/ui</a> (React) et{" "}
        <a className="text-primary underline-offset-4 hover:underline" href="https://www.shadcn-vue.com" target="_blank" rel="noreferrer">shadcn-vue</a> (Vue)
        aux couleurs Saqara : la CLI copie le code des composants dans votre app, qui en devient propriétaire.
      </p>
      <h2>Principes</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Chaque composant existe en React et en Vue, avec la même API et le même rendu.</li>
        <li>Un seul thème, <code>saqara-theme</code> : couleurs, polices (Poppins, Lato), rayons et ombres, en clair et en sombre.</li>
        <li>Contraste WCAG AA vérifié automatiquement sur chaque paire de couleurs.</li>
        <li>Tailwind CSS v4, textes par défaut en français, surchargeables par props.</li>
      </ul>
      <h2>Et ensuite</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li><a className="text-primary underline-offset-4 hover:underline" href="#/demarrer/installation">Installer Blueprint dans une app</a></li>
        <li><a className="text-primary underline-offset-4 hover:underline" href="#/demarrer/tokens">Découvrir le thème et les tokens</a></li>
        <li><a className="text-primary underline-offset-4 hover:underline" href="https://github.com/saqara/blueprint" target="_blank" rel="noreferrer">Code source sur GitHub</a></li>
      </ul>
    </article>
  )
}
