'use client'
import { useState, useEffect } from 'react'
import { Task, Priority } from '@/lib/types'
import { priorityLabel } from '@/lib/utils'

interface Props {
  open: boolean
  task?: Task | null
  onClose: () => void
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => void
}

const priorities: Priority[] = ['urgent', 'high', 'medium', 'low']

const empty = { title: '', description: '', priority: 'medium' as Priority, assignee: '', dueDate: '' }

export default function TaskModal({ open, task, onClose, onSave }: Props) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, description: task.description || '', priority: task.priority, assignee: task.assignee, dueDate: task.dueDate.slice(0, 16) })
    } else {
      setForm(empty)
    }
  }, [task, open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.assignee.trim() || !form.dueDate) return
    onSave({ ...form, dueDate: new Date(form.dueDate).toISOString() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-5">{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Revisar contrato do cliente" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680] resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes opcionais..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade *</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                {priorities.map(p => <option key={p} value={p}>{priorityLabel(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Nome" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo *</label>
            <input type="datetime-local" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
            <button type="submit" className="flex-1 bg-[#52D680] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#3ec46d] transition">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
