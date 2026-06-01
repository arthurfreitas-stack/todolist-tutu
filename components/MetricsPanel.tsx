'use client'
import { useState, useEffect } from 'react'
import { MetricEntry } from '@/lib/types'
import { getMetrics, saveMetricEntry, deleteMetricEntry } from '@/lib/store'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const all = getMetrics()
    setMetrics(all)
    const existing = all.find(m => m.date === selectedDate)
    setDraft(existing?.content || '')
  }, [selectedDate])

  function handleSave() {
    if (!draft.trim()) return
    saveMetricEntry(selectedDate, draft.trim())
    setMetrics(getMetrics())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este registro de métricas?')) return
    deleteMetricEntry(id)
    setMetrics(getMetrics())
    if (metrics.find(m => m.id === id)?.date === selectedDate) setDraft('')
  }

  const currentEntry = metrics.find(m => m.date === selectedDate)
  const pastEntries = metrics.filter(m => m.date !== selectedDate).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Métricas</h2>
        <span className="text-xs text-gray-400">{metrics.length} registro{metrics.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Editor do dia */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">📊</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Data do registro</label>
            <input
              type="date"
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]"
              value={selectedDate}
              max={todayStr()}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          {currentEntry && (
            <span className="text-xs text-gray-400">Atualizado {new Date(currentEntry.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680] resize-none font-mono leading-relaxed"
          rows={10}
          value={draft}
          onChange={e => { setDraft(e.target.value); setSaved(false) }}
          placeholder={`Métricas de ${formatDateLabel(selectedDate)}

Ex:
Funil B2B:
- Leads gerados: 12
- Calls agendadas: 4
- Propostas enviadas: 2
- Fechamentos: 1

Funil B2C:
- Visitas: 340
- Cadastros: 28
- Conversões: 5`}
        />

        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs transition-opacity ${saved ? 'text-[#52D680] opacity-100' : 'opacity-0'}`}>✓ Salvo</span>
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            className="bg-[#52D680] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[#3ec46d] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar métricas
          </button>
        </div>
      </div>

      {/* Histórico */}
      {pastEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Histórico</p>
          <div className="space-y-2">
            {pastEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{formatDateLabel(entry.date)}</p>
                      <p className="text-xs text-gray-400">{entry.content.split('\n').filter(Boolean).length} linha{entry.content.split('\n').filter(Boolean).length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedDate(entry.date); setDraft(entry.content) }}
                      className="text-xs text-[#52D680] hover:underline px-2"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(entry.id) }}
                      className="text-xs text-gray-400 hover:text-red-500 px-2"
                      title="Excluir"
                    >
                      ×
                    </button>
                    <span className="text-gray-400 text-xs">{expandedId === entry.id ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedId === entry.id && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed pt-3">{entry.content}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">Nenhuma métrica registrada ainda</p>
          <p className="text-sm">Comece escrevendo as métricas de hoje acima</p>
        </div>
      )}
    </div>
  )
}
