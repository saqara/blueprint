"use client"

import * as React from "react"
import { cn } from "cn"
import { Alert, AlertDescription } from "@/registry/react/ui/alert"
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/react/ui/card"
import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"
import { Separator } from "@/registry/react/ui/separator"
import { Spinner } from "@/registry/react/ui/spinner"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"

type LoginProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  logo?: React.ReactNode
  password?: boolean
  magicLink?: boolean
  sso?: { label: string }
  status?: "idle" | "loading" | "sent"
  error?: string
  onPasswordSubmit?: (values: { email: string; password: string }) => void
  onMagicLinkSubmit?: (email: string) => void
  onSso?: () => void
  onForgotPassword?: (email: string) => void
  onReset?: () => void
  className?: string
}

// Saqara block: presentational login. The app runs the auth and drives `status` / `error`.
function Login({
  title = "Connexion", description, logo, password = true, magicLink = false, sso, status = "idle", error,
  onPasswordSubmit, onMagicLinkSubmit, onSso, onForgotPassword, onReset, className,
}: LoginProps) {
  const id = React.useId()
  const [email, setEmail] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const loading = status === "loading"
  const brand = logo ?? <SaqaraLogo className="text-foreground" />

  if (status === "sent") {
    return (
      <Card data-slot="login" className={cn("w-full max-w-sm", className)}>
        <CardHeader className="items-center gap-3 text-center">
          {brand}
          <CardTitle className="font-heading text-xl">Vérifiez votre boîte mail</CardTitle>
          <CardDescription>Un lien de connexion a été envoyé à <strong>{email || "votre adresse"}</strong>.</CardDescription>
        </CardHeader>
        {onReset && (
          <CardFooter><Button variant="outline" className="w-full" onClick={onReset}>Utiliser une autre adresse</Button></CardFooter>
        )}
      </Card>
    )
  }

  const hasForm = password || magicLink
  const sendLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    const input = event.currentTarget.form?.elements.namedItem("email") as HTMLInputElement | null
    if (input && !input.reportValidity()) return
    onMagicLinkSubmit?.(email)
  }

  return (
    <Card data-slot="login" className={cn("w-full max-w-sm", className)}>
      <CardHeader className="items-center gap-3 text-center">
        {brand}
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
        {sso && <Button variant="outline" className="w-full" disabled={loading} onClick={onSso}>{sso.label}</Button>}
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
              <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required disabled={loading} value={email} onChange={(event) => setEmail(event.target.value)} />
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
            {password && <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner />}Se connecter</Button>}
            {magicLink && (password
              ? <Button type="button" variant="ghost" className="w-full" disabled={loading} onClick={sendLink}>Recevoir un lien de connexion</Button>
              : <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner />}Recevoir un lien de connexion</Button>)}
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export { Login }
