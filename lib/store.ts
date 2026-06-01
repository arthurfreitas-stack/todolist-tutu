'use client'
import { Task, LogEntry, Priority } from './types'

const TASKS_KEY = 'allu_tasks'
const LOG_KEY = 'allu_log'

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function createTask(data: Omit<Task, 'id' | 'createdAt' | 'status'>): Task {
  const task: Task = {
    ...data,
    id: generateId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  const tasks = getTasks()
  saveTasks([task, ...tasks])
  return task
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const tasks = getTasks().map(t => t.id === id ? { ...t, ...updates } : t)
  saveTasks(tasks)
}

export function deleteTask(id: string): void {
  saveTasks(getTasks().filter(t => t.id !== id))
}

export function completeTask(id: string): void {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  if (!task) return
  const completedAt = new Date().toISOString()
  updateTask(id, { status: 'done', completedAt })
  appendLog({ taskId: id, taskTitle: task.title, assignee: task.assignee, priority: task.priority, event: 'completed', timestamp: completedAt })
}

export function checkOverdueTasks(): void {
  const now = new Date()
  const tasks = getTasks()
  tasks.forEach(task => {
    if (task.status === 'pending' && new Date(task.dueDate) < now) {
      updateTask(task.id, { status: 'overdue' })
      appendLog({ taskId: task.id, taskTitle: task.title, assignee: task.assignee, priority: task.priority, event: 'overdue', timestamp: now.toISOString() })
    }
  })
}

export function getLog(): LogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
  } catch {
    return []
  }
}

function appendLog(entry: LogEntry): void {
  const log = getLog()
  localStorage.setItem(LOG_KEY, JSON.stringify([entry, ...log]))
}

export function exportLogCSV(): void {
  const log = getLog()
  const header = 'Data,Evento,Tarefa,Responsável,Prioridade'
  const rows = log.map(e =>
    `"${new Date(e.timestamp).toLocaleString('pt-BR')}","${e.event === 'completed' ? 'Concluída' : 'Atrasada'}","${e.taskTitle}","${e.assignee}","${e.priority}"`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `allu-tasks-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function getStats() {
  const tasks = getTasks()
  const log = getLog()
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => t.status === 'overdue').length
  const pending = tasks.filter(t => t.status === 'pending').length
  const urgentPending = tasks.filter(t => t.status === 'pending' && t.priority === 'urgent').length

  const today = new Date().toDateString()
  const completedToday = log.filter(e => e.event === 'completed' && new Date(e.timestamp).toDateString() === today).length

  const last7: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toDateString()
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
    last7.push({ date: label, count: tasks.filter(t => new Date(t.createdAt).toDateString() === dateStr).length })
  }

  const byPriority = (['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => ({
    priority: p,
    count: tasks.filter(t => t.priority === p).length,
  }))

  return { total, done, overdue, pending, urgentPending, completedToday, last7, byPriority }
}
