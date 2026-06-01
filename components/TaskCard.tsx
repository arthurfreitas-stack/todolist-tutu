'use client'
import { Task } from '@/lib/types'
import { getInitials, priorityColor, priorityLabel, formatDate } from '@/lib/utils'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onComplete, onEdit, onDelete }: Props) {
  const isUrgent = task.priority === 'urgent' && task.status === 'pending'

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border p-4 transition-all hover:shadow-md ${isUrgent ? 'border-l-4 border-l-red-500 border-red-200' : 'border-gray-100'} ${task.status === 'overdue' ? 'bg-red-50 border-red-200' : ''} ${task.status === 'done' ? 'opacity-70' : ''}`}>
      {isUrgent && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-bold text-red-600 animate-pulse">🔥 URGENTE</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {task.status === 'pending' && (
          <button onClick={() => onComplete(task.id)} className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-[#52D680] flex-shrink-0 transition" title="Concluir" />
        )}
        {task.status === 'done' && <span className="mt-0.5 text-[#52D680] flex-shrink-0">✓</span>}
        {task.status === 'overdue' && <span className="mt-0.5 text-red-500 flex-shrink-0">!</span>}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-gray-800 text-sm leading-tight ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
          {task.description && <p className="text-xs text-gray-400 mt-1 truncate">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${priorityColor(task.priority)}`}>{priorityLabel(task.priority)}</span>
            <span className="text-xs text-gray-400">Prazo: {formatDate(task.dueDate)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#52D680] flex items-center justify-center text-white text-xs font-bold" title={task.assignee}>{getInitials(task.assignee)}</div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(task)} className="text-xs text-gray-400 hover:text-gray-600 px-1" title="Editar">✎</button>
            <button onClick={() => onDelete(task.id)} className="text-xs text-gray-400 hover:text-red-500 px-1" title="Excluir">×</button>
          </div>
        </div>
      </div>
    </div>
  )
}
