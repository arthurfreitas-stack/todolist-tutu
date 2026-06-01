'use client'
import { LogEntry } from '@/lib/types'
import { exportLogCSV } from '@/lib/store'
import { priorityLabel } from '@/lib/utils'

interface Props { log: LogEntry[] }

function groupByDay(log: LogEntry[]) {
  const groups: Record<string, LogEntry[]> = {}
  log.forEach(entry => {
    const day = new Date(entry.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    if (!groups[day]) groups[day] = []
    groups[day].push(entry)
  })
  return groups
}

export default function LogTimeline({ log }: Props) {
  const groups = groupByDay(log)
  const days = Object.keys(groups)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Log de Atividades</h2>
        <button onClick={exportLogCSV} className="text-sm border border-[#52D680] text-[#52D680] rounded-xl px-4 py-1.5 hover:bg-[#52D680] hover:text-white transition font-medium">Exportar CSV</button>
      </div>
      {days.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Nenhuma atividade registrada ainda</p>
          <p className="text-sm">Conclua ou deixe tarefas vencerem para ver o log</p>
        </div>
      )}
      <div className="space-y-8">
        {days.map(day => (
          <div key={day}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{day}</p>
            <div className="space-y-2">
              {groups[day].map((entry, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${entry.event === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-lg">{entry.event === 'completed' ? '✅' : '⏰'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{entry.taskTitle}</p>
                    <p className="text-xs text-gray-500">{entry.assignee} · {priorityLabel(entry.priority)} · {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${entry.event === 'completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {entry.event === 'completed' ? 'Concluída' : 'Atrasada'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
