'use client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getStats } from '@/lib/store'
import { priorityLabel } from '@/lib/utils'

const PRIORITY_COLORS: Record<string, string> = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#9ca3af' }

export default function StatsPanel() {
  const s = getStats()

  const pieData = [
    { name: 'Concluídas', value: s.done, color: '#52D680' },
    { name: 'Atrasadas', value: s.overdue, color: '#ef4444' },
    { name: 'Pendentes', value: s.pending, color: '#e5e7eb' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: s.total, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Concluídas hoje', value: s.completedToday, color: 'text-[#52D680]', bg: 'bg-green-50' },
          { label: 'Atrasadas', value: s.overdue, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Urgentes', value: s.urgentPending, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Status geral</p>
          {s.total === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Tarefas criadas (últimos 7 dias)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={s.last7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#52D680" radius={[6, 6, 0, 0]} name="Tarefas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Tarefas por prioridade</p>
        <div className="space-y-2">
          {s.byPriority.map(({ priority, count }) => (
            <div key={priority} className="flex items-center gap-3">
              <span className="text-xs w-16 text-gray-500">{priorityLabel(priority as any)}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${s.total ? (count / s.total) * 100 : 0}%`, backgroundColor: PRIORITY_COLORS[priority] }} />
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
