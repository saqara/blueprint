import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "@/registry/react/ui/task"

export default function TaskDemo() {
  return (
    <Task className="w-full max-w-xl">
      <TaskTrigger title="Recherche des fournisseurs à relancer" />
      <TaskContent>
        <TaskItem>Lecture de <TaskItemFile>entreprises</TaskItemFile></TaskItem>
        <TaskItem>Filtre : inactifs depuis plus de 6 mois</TaskItem>
        <TaskItem>23 fournisseurs trouvés</TaskItem>
      </TaskContent>
    </Task>
  )
}
