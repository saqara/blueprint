<script setup lang="ts">
import { TrashIcon } from "@lucide/vue"
import {
  Queue, QueueItem, QueueItemAction, QueueItemActions, QueueItemContent, QueueItemDescription, QueueItemIndicator,
  QueueList, QueueSection, QueueSectionContent, QueueSectionLabel, QueueSectionTrigger,
} from "@/registry/vue/ui/queue"

const todos = [
  { id: "1", title: "Exporter les fournisseurs lyonnais", description: "CSV, 412 lignes", completed: true },
  { id: "2", title: "Comparer les notes 2025 et 2026", completed: false },
  { id: "3", title: "Préparer la synthèse pour le comité achats", completed: false },
]
</script>

<template>
  <Queue class="w-full max-w-xl">
    <QueueSection>
      <QueueSectionTrigger>
        <QueueSectionLabel :count="todos.length" label="tâches" />
      </QueueSectionTrigger>
      <QueueSectionContent>
        <QueueList>
          <QueueItem v-for="todo in todos" :key="todo.id">
            <div class="flex items-center gap-2">
              <QueueItemIndicator :completed="todo.completed" />
              <QueueItemContent :completed="todo.completed">{{ todo.title }}</QueueItemContent>
              <QueueItemActions>
                <QueueItemAction :aria-label="`Retirer « ${todo.title} »`"><TrashIcon /></QueueItemAction>
              </QueueItemActions>
            </div>
            <QueueItemDescription v-if="todo.description" :completed="todo.completed">{{ todo.description }}</QueueItemDescription>
          </QueueItem>
        </QueueList>
      </QueueSectionContent>
    </QueueSection>
  </Queue>
</template>
