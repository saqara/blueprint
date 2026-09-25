<script setup lang="ts">
import { computed } from "vue"
import { Info, TriangleAlert } from "@lucide/vue"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/vue/ui/alert-dialog"
import { Button } from "@/registry/vue/ui/button"
import { accept, cancel, state } from "./confirm"

const media = {
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}
const variant = computed(() => state.options.variant ?? "warning")
</script>

<template>
  <AlertDialog :open="state.open" @update:open="(open) => !open && cancel()">
    <AlertDialogContent data-slot="confirm-dialog">
      <AlertDialogHeader>
        <AlertDialogMedia :class="media[variant]">
          <Info v-if="variant === 'info'" />
          <TriangleAlert v-else />
        </AlertDialogMedia>
        <AlertDialogTitle>{{ state.options.title ?? "Confirmation" }}</AlertDialogTitle>
        <AlertDialogDescription>{{ state.options.message }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="state.loading">
          {{ state.options.cancelText ?? "Annuler" }}
        </AlertDialogCancel>
        <Button
          :variant="variant === 'destructive' ? 'destructive' : 'default'"
          :loading="state.loading"
          @click="accept"
        >
          {{ state.options.confirmText ?? "Confirmer" }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
