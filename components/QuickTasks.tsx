'use client'
import { useState } from 'react'

export type QuickTask = {
  id: string
  label: string
  urgency: 'high' | 'medium' | 'low'
  day: string          // 'YYYY-M-D' for specific day, 'any' for any day
  done: boolean
  createdAt: string
  note?: string
}

const URGENCY_CONFIG = {
  high:   { label:'High',   color:'#EF4444', bg:'#FEF2F2', border:'#FECACA', emoji:'🔴' },
  medium: { label:'Medium', color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A', emoji:'🟡' },
  low:    { label:'Low',    color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0', emoji:'🟢' },
}

const DAY_OPTS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Any day']

type Props = {
  todayDk: string
  selDk: string
  accent: string
  soft: string
}

export default function QuickTasks({ todayDk, selDk, accent, soft }: Props) {
  const [tasks, setTasks] = useState<QuickTask[]>(() => {
    try { const s = localStorage.getItem('hos-quick-tasks'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [showAdd, setShowAdd] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newUrgency, setNewUrgency] = useState<QuickTask['urgency']>('medium')
  const [newDay, setNewDay] = useState<string>('Any day')
  const [filter, setFilter] = useState<'all'|'high'|'medium'|'low'|'today'>('all')
  const [editingId, setEditingId] = useState<string|null>(null)

  function save(next: QuickTask[]) {
    setTasks(next); localStorage.setItem('hos-quick-tasks', JSON.stringify(next))
  }

  // Get day label for display
  function dayLabel(day: string): string {
    if (day === 'any') return 'Any day'
    if (day === todayDk) return 'Today'
    const d = new Date(day + 'T00:00:00')
    return `${DAY_OPTS[d.getDay()===0?6:d.getDay()-1]} ${d.getDate()}/${d.getMonth()+1}`
  }

  // Get date key for a day abbreviation offset from today
  function dayOptToDk(opt: string): string {
    if (opt === 'Any day') return 'any'
    const today = new Date(); today.setHours(0,0,0,0)
    const tDi = today.getDay()===0?6:today.getDay()-1
    const di = DAY_OPTS.indexOf(opt)
    if (di === -1) return 'any'
    let diff = di - tDi; if (diff <= 0) diff += 7
    const d = new Date(today); d.setDate(today.getDate() + diff)
    return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()
  }

  function addTask() {
    if (!newLabel.trim()) return
    const task: QuickTask = {
      id: `qt_${Date.now()}`, label: newLabel.trim(), note: newNote.trim()||undefined,
      urgency: newUrgency, day: dayOptToDk(newDay), done: false, createdAt: new Date().toISOString(),
    }
    save([task, ...tasks])
    setNewLabel(''); setNewNote(''); setNewUrgency('medium'); setNewDay('Any day'); setShowAdd(false)
  }

  function toggleDone(id: string) {
    save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id: string) {
    save(tasks.filter(t => t.id !== id))
  }

  // Filter
  const filtered = tasks.filter(t => {
    if (filter === 'today') return t.day === selDk || t.day === 'any'
    if (filter === 'all') return true
    return t.urgency === filter
  }).sort((a,b) => {
    // Sort: undone first, then by urgency
    if (a.done !== b.done) return a.done ? 1 : -1
    const ord = {high:0,medium:1,low:2}
    return ord[a.urgency] - ord[b.urgency]
  })

  const undoneCount = tasks.filter(t=>!t.done).length
  const todayCount  = tasks.filter(t=>!t.done&&(t.day===selDk||t.day==='any')).length

  return (
    <div className="bg-white rounded-2xl overflow-hidden mb-2.5 shadow-sm border border-gray-100">

      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background:'#FAFAFA', borderBottom:'1px solid #F1F5F9' }}>
        <span className="text-sm">📋</span>
        <div className="flex-1">
          <div className="text-[12px] font-semibold text-gray-800">Task List</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{undoneCount} pending · {todayCount} for today</div>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer"
          style={{ background: accent+'20', color: accent }}>
          + Add
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-50 overflow-x-auto">
        {([['all','All'],['today','Today'],['high','🔴 High'],['medium','🟡 Med'],['low','🟢 Low']] as const).map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f as any)}
            className="flex-none text-[10px] font-semibold px-3 py-1 rounded-full cursor-pointer border-none transition-all"
            style={{ background: filter===f?accent:'#F1F5F9', color: filter===f?'#fff':'#6B7280' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="What needs to be done?"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400 mb-2"
            autoFocus onKeyDown={e=>e.key==='Enter'&&addTask()}/>
          <input value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Note (optional)"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:border-green-400 mb-2"/>

          {/* Urgency + Day */}
          <div className="flex gap-2 mb-3">
            {/* Urgency */}
            <div className="flex-1">
              <div className="text-[9px] text-gray-400 font-medium mb-1">Urgency</div>
              <div className="flex gap-1">
                {(['high','medium','low'] as const).map(u=>{
                  const cfg=URGENCY_CONFIG[u]
                  return <button key={u} onClick={()=>setNewUrgency(u)}
                    className="flex-1 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer border-2 transition-all"
                    style={{ border:newUrgency===u?`2px solid ${cfg.color}`:'2px solid #F1F5F9', background:newUrgency===u?cfg.bg:'#fff', color:newUrgency===u?cfg.color:'#9CA3AF' }}>
                    {cfg.emoji}
                  </button>
                })}
              </div>
            </div>
            {/* Day */}
            <div className="flex-1">
              <div className="text-[9px] text-gray-400 font-medium mb-1">For</div>
              <select value={newDay} onChange={e=>setNewDay(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none cursor-pointer">
                {DAY_OPTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addTask} disabled={!newLabel.trim()}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-white border-none cursor-pointer"
              style={{ background: newLabel.trim()?accent:'#E5E7EB' }}>
              Add task
            </button>
            <button onClick={()=>setShowAdd(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-gray-100 border-none cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-400">
            {filter==='all'?'No tasks yet — tap + Add':'No tasks for this filter'}
          </div>
        )}
        {filtered.map(task => {
          const cfg = URGENCY_CONFIG[task.urgency]
          return (
            <div key={task.id} className="flex items-start gap-3 px-4 py-3 group/qt"
              style={{ background: task.done?'#FAFAFA':'#fff' }}>

              {/* Urgency stripe */}
              <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: task.done?'#E5E7EB':cfg.color }}/>

              {/* Checkbox */}
              <div onClick={()=>toggleDone(task.id)}
                className="w-5 h-5 rounded-[6px] flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer flex-none"
                style={{ background: task.done?'#D1D5DB':'transparent', border: task.done?'none':`2px solid ${cfg.color}` }}>
                {task.done && <span className="text-[10px] text-white leading-none">✓</span>}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium" style={{ color: task.done?'#9CA3AF':'#1F2937', textDecoration: task.done?'line-through':'none' }}>
                  {task.label}
                </div>
                {task.note && <div className="text-[10px] text-gray-400 mt-0.5">{task.note}</div>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background:cfg.bg, color:cfg.color }}>{cfg.emoji} {cfg.label}</span>
                  <span className="text-[9px] text-gray-400">{dayLabel(task.day)}</span>
                </div>
              </div>

              {/* Delete */}
              <button onClick={()=>deleteTask(task.id)}
                className="opacity-0 group-hover/qt:opacity-100 transition-opacity text-[10px] text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer flex-shrink-0 mt-0.5">
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Done tasks count */}
      {tasks.filter(t=>t.done).length > 0 && (
        <div className="px-4 py-2 border-t border-gray-50 text-center">
          <span className="text-[10px] text-gray-400">{tasks.filter(t=>t.done).length} completed · </span>
          <button onClick={()=>save(tasks.filter(t=>!t.done))}
            className="text-[10px] text-red-400 border-none bg-transparent cursor-pointer font-medium">
            Clear done
          </button>
        </div>
      )}
    </div>
  )
}
