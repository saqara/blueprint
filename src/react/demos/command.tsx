import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/react/ui/command"

export default function CommandDemo() {
  return (
    <Command className="max-w-sm rounded-lg border">
      <CommandInput placeholder="Rechercher un lot…" />
      <CommandList>
        <CommandEmpty>Aucun lot trouvé.</CommandEmpty>
        <CommandGroup heading="Lots">
          <CommandItem>Gros œuvre</CommandItem>
          <CommandItem>Électricité</CommandItem>
          <CommandItem>Plomberie</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
