'use client'
import { Task, Status } from '@/lib/types'
import { getInitials, priorityColor, priorityLabel, formatDate } from '@/lib/utils'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: Status) => void
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Fazendo' },
  { value: 'done', label: 'Concluído' },
  { value: 'overdue', label: 'Atrasado' },
]

const STATUS_BADGE: Record<Status, string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  done: 'bg-green-100 text-green-700 border-green-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
}

export default function TaskCard({ task, onEdit, onDelete, onChangeStatus }: Props) {
  const isUrgent = task.priority === 'urgent' && (task.status === 'pending' || task.status === 'in_progress')

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border p-4 transition-all hover:shadow-md
      ${isUrgent ? 'border-l-4 border-l-red-500 border-red-200' : 'border-gray-100'}
      ${task.status === 'overdue' ? 'bg-red-50 border-red-200' : ''}
      ${task.status === 'in_progress' ? 'border-l-4 border-l-blue-400' : ''}
      ${task.status === 'done' ? 'opacity-70' : ''}
    `}>
      {isUrgent && (
        <p className="text-xs font-bold text-red-600 animate-pulse mb-2">🔥 URGENTE</p>
      )}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-gray-800 text-sm leading-tight ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
          {task.description && <p className="text-xs text-gray-400 mt-1 truncate">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${priorityColor(task.priority)}`}>{priorityLabel(task.priority)}</span>
            <span className="text-xs text-gray-400">Prazo: {formatDate(task.dueDate)}</span>
          </div>
          {task.status === 'done' && task.completedAt && (
            <p className="text-xs text-gray-400 mt-1">Concluído: {formatDate(task.completedAt)}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#52D680] flex items-center justify-center text-white text-xs font-bold" title={task.assignee}>{getInitials(task.assignee)}</div>
          <select
            value={task.status}
            onChange={e => onChangeStatus(task.id, e.target.value as Status)}
            onClick={e => e.stopPropagation()}
            className={`text-xs border rounded-lg px-2 py-1 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#52D680] ${STATUS_BADGE[task.status]}`}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button onClick={() => onEdit(task)} className="text-xs text-gray-400 hover:text-gray-600 px-1" title="Editar">✎</button>
            <button onClick={() => onDelete(task.id)} className="text-xs text-gray-400 hover:text-red-500 px-1" title="Excluir">×</button>
          </div>
        </div>
      </div>
    </div>
  )
}
