import "../styles.css"
import { StrictMode, type ComponentType } from "react"
import { createRoot } from "react-dom/client"

const demos = import.meta.glob<{ default: ComponentType }>("./demos/*.tsx", { eager: true })

function App() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-heading">Blueprint — React</h1>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => document.documentElement.classList.toggle("dark")}>
          Clair / sombre
        </button>
      </header>
      {Object.entries(demos).map(([path, mod]) => {
        const name = path.split("/").pop()!.replace(".tsx", "")
        const Demo = mod.default
        return (
          <section key={name} id={name} className="space-y-3">
            <h2 className="text-lg font-heading"><a href={`#${name}`}>{name}</a></h2>
            <Demo />
          </section>
        )
      })}
    </main>
  )
}

createRoot(document.getElementById("app")!).render(<StrictMode><App /></StrictMode>)
