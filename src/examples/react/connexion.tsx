import { useState } from "react"
import { Login } from "@/registry/react/blocks/login"

// Example: full-page sign-in for the supplier portal. Auth is simulated.
export default function ConnexionExample() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [error, setError] = useState<string>()
  const simulate = (then: () => void) => {
    setStatus("loading")
    setError(undefined)
    setTimeout(then, 800)
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Login
        title="Saqara Hub"
        description="Connectez-vous pour accéder à votre espace."
        magicLink
        sso={{ label: "Se connecter avec SSO" }}
        status={status}
        error={error}
        onPasswordSubmit={() => simulate(() => { setStatus("idle"); setError("Identifiants incorrects.") })}
        onMagicLinkSubmit={() => simulate(() => setStatus("sent"))}
        onSso={() => simulate(() => { setStatus("idle"); setError("La connexion SSO a échoué. Réessayez.") })}
        onForgotPassword={() => {}}
        onReset={() => setStatus("idle")}
      />
      <p className="text-xs text-muted-foreground">
        © Saqara — <a href="#/exemples/connexion" className="underline-offset-4 hover:underline">Mentions légales</a> ·{" "}
        <a href="#/exemples/connexion" className="underline-offset-4 hover:underline">Confidentialité</a>
      </p>
    </div>
  )
}
