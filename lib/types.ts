export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type Status = 'pending' | 'in_progress' | 'done' | 'overdue'

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  status: Status
  assignee: string
  dueDate: string
  createdAt: string
  completedAt?: string
}

export interface LogEntry {
  taskId: string
  taskTitle: string
  assignee: string
  priority: Priority
  event: 'completed' | 'overdue'
  timestamp: string
}

export interface Achievement {
  id: string
  description: string
  doneAt: string
  createdAt: string
}

export interface MetricEntry {
  id: string
  date: string
  content: string
  updatedAt: string
}
