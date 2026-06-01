'use client'
import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (description: string, doneAt: string) => void
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AchievementModal({ open, onClose, onSave }: Props) {
  const [description, setDescription] = useState('')
  const [doneAt, setDoneAt] = useState(toLocalDatetimeValue(new Date()))

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    onSave(description.trim(), new Date(doneAt).toISOString())
    setDescription('')
    setDoneAt(toLocalDatetimeValue(new Date()))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">✅</span>
          <h2 className="text-xl font-bold text-gray-800">Registrar realização</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Registre algo que você fez sem precisar ter criado uma tarefa antes.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">O que foi feito? *</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680] resize-none"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Liguei para 5 leads do funil B2B, fechei contrato com cliente X..."
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quando foi feito? *</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]"
              value={doneAt}
              onChange={e => setDoneAt(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
            <button type="submit" className="flex-1 bg-[#52D680] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#3ec46d] transition">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
