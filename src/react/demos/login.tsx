import { useState } from "react"
import { Login } from "@/registry/react/blocks/login"

export default function LoginDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [error, setError] = useState<string>()
  const wait = (then: () => void) => { setStatus("loading"); setError(undefined); setTimeout(then, 800) }
  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 p-8">
      <Login title="Portail Fournisseur" description="Connectez-vous pour accéder à votre espace." magicLink sso={{ label: "Se connecter avec SSO" }}
        status={status} error={error}
        onPasswordSubmit={() => wait(() => { setStatus("idle"); setError("Identifiants incorrects.") })}
        onMagicLinkSubmit={() => wait(() => setStatus("sent"))}
        onSso={() => wait(() => { setStatus("idle"); setError("La connexion SSO a échoué. Réessayez.") })}
        onForgotPassword={() => {}} onReset={() => setStatus("idle")} />
    </div>
  )
}
