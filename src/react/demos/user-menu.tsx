import { Settings } from "lucide-react"
import { DropdownMenuItem } from "@/registry/react/ui/dropdown-menu"
import { UserMenu } from "@/registry/react/ui/user-menu"

export default function UserMenuDemo() {
  return (
    <UserMenu name="Camille Martin" email="camille.martin@exemple.fr" onSignOut={() => {}}>
      <DropdownMenuItem><Settings />Mon profil</DropdownMenuItem>
    </UserMenu>
  )
}
