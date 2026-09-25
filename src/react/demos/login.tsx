import { useState } from "react"
import { Login } from "@/registry/react/blocks/login"

export default function LoginDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [error, setError] = useState<string>()
  const [action, setAction] = useState<"password" | "magicLink" | "sso">()
  const wait = (which: typeof action, then: () => void) => { setAction(which); setStatus("loading"); setError(undefined); setTimeout(then, 800) }
  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 p-8">
      <Login title="Saqara Hub" description="Connectez-vous pour accéder à votre espace." magicLink sso={{ label: "Se connecter avec SSO" }}
        status={status} loadingAction={action} error={error} onErrorDismiss={() => setError(undefined)}
        emailPlaceholder="prenom.nom@exemple.fr" resendCooldown={30}
        onPasswordSubmit={() => wait("password", () => { setStatus("idle"); setError("Identifiants incorrects.") })}
        onMagicLinkSubmit={() => wait("magicLink", () => setStatus("sent"))}
        onSso={() => wait("sso", () => { setStatus("idle"); setError("La connexion SSO a échoué. Réessayez.") })}
        onResend={() => {}} onForgotPassword={() => {}} onReset={() => setStatus("idle")} />
    </div>
  )
}
