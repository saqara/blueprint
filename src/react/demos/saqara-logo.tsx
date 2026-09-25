import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"

export default function SaqaraLogoDemo() {
  return (
    <div className="flex items-center gap-6">
      <SaqaraLogo />
      <SaqaraLogo withText />
      <SaqaraLogo withText label="Portail Fournisseur" className="text-lg" />
    </div>
  )
}
