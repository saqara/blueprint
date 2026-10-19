<script setup lang="ts">
import { ref } from "vue"
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@/registry/vue/ui/checkpoint"

const restored = ref(false)
</script>

<template>
  <div class="w-full max-w-xl space-y-3">
    <Checkpoint>
      <CheckpointIcon />
      <CheckpointTrigger tooltip="Revenir à la conversation telle qu’elle était à ce moment" @click="restored = true">
        Restaurer ce point
      </CheckpointTrigger>
    </Checkpoint>
    <p class="text-sm text-muted-foreground">{{ restored ? "Conversation restaurée avant la question sur Lyon." : "Point enregistré avant la question sur Lyon." }}</p>
  </div>
</template>
