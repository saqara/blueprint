<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/vue/ui/dialog"
import { Input } from "@/registry/vue/ui/input"

const clauses = Array.from({ length: 12 }, (_, i) => `Article ${i + 1}. Le fournisseur s'engage à tenir à jour les informations de son entreprise et les documents justificatifs demandés par l'acheteur.`)
</script>

<template>
  <div class="flex flex-wrap gap-2">
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
    <Dialog>
      <DialogTrigger as-child><Button variant="outline">Conditions (lg, défilement)</Button></DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Conditions d'utilisation</DialogTitle>
          <DialogDescription>Le corps défile, l'en-tête et le pied restent visibles.</DialogDescription>
        </DialogHeader>
        <DialogBody class="space-y-3 text-sm">
          <p v-for="c in clauses" :key="c">{{ c }}</p>
        </DialogBody>
        <DialogFooter show-close-button>
          <Button>J'accepte</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
