'use client'
import { LogEntry, Achievement } from '@/lib/types'
import { exportLogCSV, deleteAchievement } from '@/lib/store'
import { priorityLabel, formatDate } from '@/lib/utils'

interface Props {
  log: LogEntry[]
  achievements: Achievement[]
  onAchievementDeleted: () => void
  onNewAchievement: () => void
}

type UnifiedEntry =
  | { kind: 'task'; timestamp: string; data: LogEntry }
  | { kind: 'achievement'; timestamp: string; data: Achievement }

function groupByDay(entries: UnifiedEntry[]) {
  const groups: Record<string, UnifiedEntry[]> = {}
  entries.forEach(entry => {
    const day = new Date(entry.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    if (!groups[day]) groups[day] = []
    groups[day].push(entry)
  })
  return groups
}

export default function LogTimeline({ log, achievements, onAchievementDeleted, onNewAchievement }: Props) {
  const unified: UnifiedEntry[] = [
    ...log.map(e => ({ kind: 'task' as const, timestamp: e.timestamp, data: e })),
    ...achievements.map(a => ({ kind: 'achievement' as const, timestamp: a.doneAt, data: a })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const groups = groupByDay(unified)
  const days = Object.keys(groups)

  function handleDeleteAchievement(id: string) {
    if (!confirm('Excluir esta realização?')) return
    deleteAchievement(id)
    onAchievementDeleted()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Log de Atividades</h2>
        <div className="flex gap-2">
          <button
            onClick={onNewAchievement}
            className="text-sm bg-[#52D680] text-white rounded-xl px-4 py-1.5 hover:bg-[#3ec46d] transition font-medium"
          >
            + Registrar realização
          </button>
          <button onClick={exportLogCSV} className="text-sm border border-gray-200 text-gray-600 rounded-xl px-4 py-1.5 hover:bg-gray-50 transition font-medium">Exportar CSV</button>
        </div>
      </div>

      {days.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhuma atividade registrada ainda</p>
          <p className="text-sm mt-1">Conclua tarefas ou registre realizações para ver o log</p>
          <button onClick={onNewAchievement} className="mt-4 bg-[#52D680] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[#3ec46d] transition">
            + Registrar primeira realização
          </button>
        </div>
      )}

      <div className="space-y-8">
        {days.map(day => (
          <div key={day}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{day}</p>
            <div className="space-y-2">
              {groups[day].map((entry, i) => {
                if (entry.kind === 'task') {
                  const e = entry.data as LogEntry
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${e.event === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <span className="text-lg">{e.event === 'completed' ? '✅' : '⏰'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{e.taskTitle}</p>
                        <p className="text-xs text-gray-500">{e.assignee} · {priorityLabel(e.priority)} · {new Date(e.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${e.event === 'completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {e.event === 'completed' ? 'Tarefa concluída' : 'Atrasada'}
                      </span>
                    </div>
                  )
                }
                const a = entry.data as Achievement
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border bg-blue-50 border-blue-200">
                    <span className="text-lg">⭐</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{a.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(a.doneAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-200 text-blue-800">Realização</span>
                      <button onClick={() => handleDeleteAchievement(a.id)} className="text-gray-400 hover:text-red-500 text-sm px-1" title="Excluir">×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
