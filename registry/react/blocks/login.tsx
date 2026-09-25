"use client"

import * as React from "react"
import { cn } from "cn"
import { Alert, AlertClose, AlertDescription } from "@/registry/react/ui/alert"
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/registry/react/ui/card"
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"
import { Separator } from "@/registry/react/ui/separator"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"

type LoginProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  logo?: React.ReactNode
  password?: boolean
  magicLink?: boolean
  sso?: { label: string }
  status?: "idle" | "loading" | "sent"
  /** Which button spins while `status` is "loading" (all controls stay locked). Default: the form's main method. */
  loadingAction?: "password" | "magicLink" | "sso"
  error?: string
  emailPlaceholder?: string
  emailHint?: React.ReactNode
  sentTitle?: React.ReactNode
  resetLabel?: string
  /** Seconds before the link can be resent, restarted after each resend. */
  resendCooldown?: number
  onPasswordSubmit?: (values: { email: string; password: string }) => void
  onMagicLinkSubmit?: (email: string) => void
  onSso?: () => void
  onForgotPassword?: (email: string) => void
  onReset?: () => void
  onResend?: (email: string) => void
  onErrorDismiss?: () => void
  className?: string
}

// The page has one heading: the card title is an h1 (CardTitle is a div).
const titleClass = "font-heading text-xl leading-none font-semibold"

// Saqara block: presentational login. The app runs the auth and drives `status` / `error`.
function Login({
  title = "Connexion", description, logo, password = true, magicLink = false, sso, status = "idle", loadingAction, error,
  emailPlaceholder, emailHint, sentTitle = "Vérifiez votre boîte mail", resetLabel = "Utiliser une autre adresse", resendCooldown = 60,
  onPasswordSubmit, onMagicLinkSubmit, onSso, onForgotPassword, onReset, onResend, onErrorDismiss, className,
}: LoginProps) {
  const id = React.useId()
  const [email, setEmail] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [wait, setWait] = React.useState(resendCooldown)
  const loading = status === "loading"
  const brand = logo ?? <SaqaraLogo className="text-foreground" />

  // Countdown restarts whenever the sent screen shows (state adjusted during render, not in an effect);
  // resend() restarts it too.
  const [shownStatus, setShownStatus] = React.useState(status)
  if (status !== shownStatus) {
    setShownStatus(status)
    if (status === "sent") setWait(resendCooldown)
  }
  React.useEffect(() => {
    if (status !== "sent") return
    const timer = setInterval(() => setWait((w) => Math.max(0, w - 1)), 1000)
    return () => clearInterval(timer)
  }, [status])

  const errorAlert = error && (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{error}</AlertDescription>
      {onErrorDismiss && <AlertClose onClick={onErrorDismiss} />}
    </Alert>
  )

  if (status === "sent") {
    return (
      <Card data-slot="login" className={cn("w-full max-w-sm", className)}>
        <CardHeader className="justify-items-center gap-3 text-center">
          {brand}
          <h1 data-slot="card-title" className={titleClass}>{sentTitle}</h1>
          <CardDescription>Un lien de connexion a été envoyé à <strong>{email || "votre adresse"}</strong>.</CardDescription>
        </CardHeader>
        {errorAlert && <CardContent>{errorAlert}</CardContent>}
        {(onResend || onReset) && (
          <CardFooter className="grid gap-2">
            {onResend && (
              <Button className="w-full" disabled={wait > 0} onClick={() => { setWait(resendCooldown); onResend(email) }}>
                {wait > 0 ? `Renvoyer le lien dans ${wait} s` : "Renvoyer le lien"}
              </Button>
            )}
            {onReset && <Button variant="outline" className="w-full" onClick={onReset}>{resetLabel}</Button>}
          </CardFooter>
        )}
      </Card>
    )
  }

  const hasForm = password || magicLink
  const spinning = loading ? (loadingAction ?? (password ? "password" : "magicLink")) : undefined
  const sendLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    const input = event.currentTarget.form?.elements.namedItem("email") as HTMLInputElement | null
    if (input && !input.reportValidity()) return
    onMagicLinkSubmit?.(email)
  }

  return (
    <Card data-slot="login" className={cn("w-full max-w-sm", className)}>
      <CardHeader className="justify-items-center gap-3 text-center">
        {brand}
        <h1 data-slot="card-title" className={titleClass}>{title}</h1>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">
        {errorAlert}
        {sso && <Button variant="outline" className="w-full" disabled={loading} loading={spinning === "sso"} onClick={onSso}>{sso.label}</Button>}
        {sso && hasForm && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Separator className="flex-1" /><span>ou</span><Separator className="flex-1" /></div>
        )}
        {hasForm && (
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault()
            if (password) onPasswordSubmit?.({ email, password: secret })
            else onMagicLinkSubmit?.(email)
          }}>
            <div className="grid gap-2">
              <Label htmlFor={`${id}-email`}>E-mail</Label>
              <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required disabled={loading}
                placeholder={emailPlaceholder} aria-describedby={emailHint ? `${id}-email-hint` : undefined}
                value={email} onChange={(event) => setEmail(event.target.value)} />
              {emailHint && <p id={`${id}-email-hint`} className="text-xs text-muted-foreground">{emailHint}</p>}
            </div>
            {password && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${id}-password`}>Mot de passe</Label>
                  {onForgotPassword && (
                    <button type="button" disabled={loading} className="text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50" onClick={() => onForgotPassword(email)}>
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <Input id={`${id}-password`} name="password" type="password" autoComplete="current-password" required disabled={loading} value={secret} onChange={(event) => setSecret(event.target.value)} />
              </div>
            )}
            {password && <Button type="submit" className="w-full" disabled={loading} loading={spinning === "password"}>Se connecter</Button>}
            {magicLink && (password
              ? <Button type="button" variant="ghost" className="w-full" disabled={loading} loading={spinning === "magicLink"} onClick={sendLink}>Recevoir un lien de connexion</Button>
              : <Button type="submit" className="w-full" disabled={loading} loading={spinning === "magicLink"}>Recevoir un lien de connexion</Button>)}
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export { Login }
