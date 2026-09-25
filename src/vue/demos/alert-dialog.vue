<script setup lang="ts">
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/registry/vue/ui/alert-dialog"
import { Button } from "@/registry/vue/ui/button"
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child><Button variant="destructive">Supprimer l'agence</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer l'agence Lyon Sud ?</AlertDialogTitle>
        <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction>Supprimer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
