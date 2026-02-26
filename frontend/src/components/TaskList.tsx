interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface TaskListProps {
  tasks: Task[]
}

export default function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No tasks yet.</p>
        <p className="text-sm mt-1">Add one above to get started.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3"
        >
          <span
            className={`mt-1 w-4 h-4 rounded border-2 flex-shrink-0 ${
              task.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'
            }`}
            aria-label={task.completed ? 'completed' : 'incomplete'}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium leading-snug ${
                task.completed ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
