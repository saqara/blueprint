<script setup lang="ts">
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "@/registry/vue/ui/task"
</script>

<template>
  <Task class="w-full max-w-xl">
    <TaskTrigger title="Recherche des fournisseurs à relancer" />
    <TaskContent>
      <TaskItem>Lecture de <TaskItemFile>entreprises</TaskItemFile></TaskItem>
      <TaskItem>Filtre : inactifs depuis plus de 6 mois</TaskItem>
      <TaskItem>23 fournisseurs trouvés</TaskItem>
    </TaskContent>
  </Task>
</template>
