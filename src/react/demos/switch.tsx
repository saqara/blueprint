import { Label } from "@/registry/react/ui/label"
import { Switch } from "@/registry/react/ui/switch"

export default function SwitchDemo() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="switch-cron" defaultChecked />
      <Label htmlFor="switch-cron">Synchronisation automatique</Label>
    </div>
  )
}
