<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/vue/ui/dialog"
import { Input } from "@/registry/vue/ui/input"
</script>

<template>
  <Dialog>
    <DialogTrigger as-child><Button variant="outline">Ajouter un contact</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Nouveau contact</DialogTitle>
        <DialogDescription>Le contact sera visible par toute l'organisation.</DialogDescription>
      </DialogHeader>
      <Input placeholder="Nom et prénom" />
      <DialogFooter>
        <DialogClose as-child><Button variant="outline">Annuler</Button></DialogClose>
        <Button>Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
