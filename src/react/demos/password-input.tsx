import { Label } from "@/registry/react/ui/label"
import { PasswordInput } from "@/registry/react/ui/password-input"

export default function PasswordInputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="api-key">Clé d'API Infolegale</Label>
      <PasswordInput id="api-key" defaultValue="sk_test_exemple" autoComplete="off" />
    </div>
  )
}
