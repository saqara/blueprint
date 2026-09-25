import { Settings } from "lucide-react"
import { DropdownMenuItem } from "@/registry/react/ui/dropdown-menu"
import { UserMenu } from "@/registry/react/ui/user-menu"

export default function UserMenuDemo() {
  return (
    <UserMenu name="Alexandre Brochot" email="alexandre.brochot@saqara.com" onSignOut={() => {}}>
      <DropdownMenuItem><Settings />Mon profil</DropdownMenuItem>
    </UserMenu>
  )
}
