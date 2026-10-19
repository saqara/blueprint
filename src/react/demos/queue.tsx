import { TrashIcon } from "lucide-react"
import {
  Queue, QueueItem, QueueItemAction, QueueItemActions, QueueItemContent, QueueItemDescription, QueueItemIndicator,
  QueueList, QueueSection, QueueSectionContent, QueueSectionLabel, QueueSectionTrigger,
} from "@/registry/react/ui/queue"

const todos = [
  { id: "1", title: "Exporter les fournisseurs lyonnais", description: "CSV, 412 lignes", completed: true },
  { id: "2", title: "Comparer les notes 2025 et 2026", completed: false },
  { id: "3", title: "Préparer la synthèse pour le comité achats", completed: false },
]

export default function QueueDemo() {
  return (
    <Queue className="w-full max-w-xl">
      <QueueSection>
        <QueueSectionTrigger>
          <QueueSectionLabel count={todos.length} label="tâches" />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {todos.map((todo) => (
              <QueueItem key={todo.id}>
                <div className="flex items-center gap-2">
                  <QueueItemIndicator completed={todo.completed} />
                  <QueueItemContent completed={todo.completed}>{todo.title}</QueueItemContent>
                  <QueueItemActions>
                    <QueueItemAction aria-label={`Retirer « ${todo.title} »`}><TrashIcon /></QueueItemAction>
                  </QueueItemActions>
                </div>
                {todo.description && <QueueItemDescription completed={todo.completed}>{todo.description}</QueueItemDescription>}
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  )
}
