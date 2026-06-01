import { Priority } from './types'

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function priorityLabel(p: Priority): string {
  return { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' }[p]
}

export function priorityColor(p: Priority): string {
  return {
    urgent: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-gray-100 text-gray-600 border-gray-300',
  }[p]
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date()
}
