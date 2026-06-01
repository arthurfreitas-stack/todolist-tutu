'use client'
import { useState, useEffect, useCallback } from 'react'
import { Task } from '@/lib/types'
import { getTasks, createTask, updateTask, completeTask, deleteTask, checkOverdueTasks, getLog } from '@/lib/store'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import LogTimeline from '@/components/LogTimeline'
import StatsPanel from '@/components/StatsPanel'
import { LogEntry } from '@/lib/types'

type Tab = 'board' | 'log' | 'stats'
type Filter = { search: string; priority: string; assignee: string }

const AlluLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
    <path d="M50 10 C30 10 10 28 10 50 C10 62 18 70 30 74 C26 68 24 60 26 52 C28 42 36 36 44 34 C48 33 50 30 50 26 C50 30 52 33 56 34 C64 36 72 42 74 52 C76 60 74 68 70 74 C82 70 90 62 90 50 C90 28 70 10 50 10Z" fill="#52D680"/>
    <path d="M50 74 C44 70 36 64 34 56 C32 48 36 40 44 38 C47 37 50 34 50 30 C50 34 53 37 56 38 C64 40 68 48 66 56 C64 64 56 70 50 74Z" fill="#52D680" opacity="0.7"/>
  </svg>
)

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [tab, setTab] = useState<Tab>('board')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<Filter>({ search: '', priority: '', assignee: '' })
  const [statsKey, setStatsKey] = useState(0)

  const reload = useCallback(() => {
    checkOverdueTasks()
    setTasks(getTasks())
    setLog(getLog())
    setStatsKey(k => k + 1)
  }, [])

  useEffect(() => {
    reload()
    const interval = setInterval(reload, 60000)
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setEditTask(null); setModalOpen(true) } }
    window.addEventListener('keydown', onKey)
    return () => { clearInterval(interval); window.removeEventListener('keydown', onKey) }
  }, [reload])

  function handleSave(data: Omit<Task, 'id' | 'createdAt' | 'status'>) {
    if (editTask) { updateTask(editTask.id, data) } else { createTask(data) }
    reload()
  }

  function handleComplete(id: string) { completeTask(id); reload() }
  function handleDelete(id: string) { if (confirm('Excluir tarefa?')) { deleteTask(id); reload() } }
  function handleEdit(task: Task) { setEditTask(task); setModalOpen(true) }

  const filtered = tasks.filter(t => {
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    if (filter.priority && t.priority !== filter.priority) return false
    if (filter.assignee && !t.assignee.toLowerCase().includes(filter.assignee.toLowerCase())) return false
    return true
  })

  const urgent = filtered.filter(t => t.status === 'pending' && t.priority === 'urgent')
  const overdue = filtered.filter(t => t.status === 'overdue')
  const pending = filtered.filter(t => t.status === 'pending' && t.priority !== 'urgent')
  const done = filtered.filter(t => t.status === 'done')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlluLogo />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Allu Tasks</h1>
              <p className="text-xs text-gray-400">{tasks.filter(t => t.status === 'pending').length} pendentes · {tasks.filter(t => t.status === 'overdue').length} atrasadas</p>
            </div>
          </div>
          <button onClick={() => { setEditTask(null); setModalOpen(true) }} className="bg-[#52D680] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#3ec46d] transition flex items-center gap-1">
            <span className="text-lg leading-none">+</span> Nova tarefa
            <span className="hidden md:inline text-xs opacity-70 ml-1">⌘K</span>
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {(['board', 'log', 'stats'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t ? 'border-[#52D680] text-[#52D680]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'board' ? 'Tarefas' : t === 'log' ? 'Log' : 'Dashboard'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'board' && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680] flex-1 min-w-32" placeholder="Buscar tarefas..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
              <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680]" value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
                <option value="">Todas prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
              <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52D680] w-36" placeholder="Responsável..." value={filter.assignee} onChange={e => setFilter(f => ({ ...f, assignee: e.target.value }))} />
            </div>

            {urgent.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">🔥 Urgentes ({urgent.length})</p>
                <div className="space-y-3">
                  {urgent.map(t => <TaskCard key={t.id} task={t} onComplete={handleComplete} onEdit={handleEdit} onDelete={handleDelete} />)}
                </div>
              </div>
            )}

            {overdue.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-red-600 mb-3">⚠ Atrasadas ({overdue.length})</p>
                <div className="space-y-3">
                  {overdue.map(t => <TaskCard key={t.id} task={t} onComplete={handleComplete} onEdit={handleEdit} onDelete={handleDelete} />)}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">Pendentes ({pending.length})</p>
                {pending.length === 0 && urgent.length === 0 && <p className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">Nenhuma tarefa pendente</p>}
                <div className="space-y-3">
                  {pending.map(t => <TaskCard key={t.id} task={t} onComplete={handleComplete} onEdit={handleEdit} onDelete={handleDelete} />)}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">Concluídas ({done.length})</p>
                {done.length === 0 && <p className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">Nenhuma tarefa concluída</p>}
                <div className="space-y-3">
                  {done.map(t => <TaskCard key={t.id} task={t} onComplete={handleComplete} onEdit={handleEdit} onDelete={handleDelete} />)}
                </div>
              </div>
            </div>
          </>
        )}
        {tab === 'log' && <LogTimeline log={log} />}
        {tab === 'stats' && <StatsPanel key={statsKey} />}
      </main>

      <TaskModal
        open={modalOpen}
        task={editTask}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
