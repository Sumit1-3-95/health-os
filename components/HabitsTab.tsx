'use client'
import { useState, useEffect } from 'react'

export type Habit = {
  id: string
  name: string
  icon: string
  description: string
  goal: 7 | 21
  category: string
  startDate: string        // YYYY-MM-DD
  completedDays: string[]  // array of YYYY-MM-DD strings
  active: boolean
  createdAt: string
  color: string
}

const PRESET_HABITS = [
  { name:'No alcohol',          icon:'🚫🍺', description:'Zero alcohol for the full challenge period', category:'health',    color:'#EF4444' },
  { name:'Sleep before 11:30',  icon:'🌙',   description:'In bed with lights off by 11:30 PM',        category:'sleep',     color:'#6C63FF' },
  { name:'Wake up before 7 AM', icon:'☀️',   description:'Out of bed before 7:00 AM',                 category:'morning',   color:'#F59E0B' },
  { name:'30 min workout',      icon:'💪',   description:'At least 30 minutes of exercise',            category:'fitness',   color:'#10B981' },
  { name:'Badminton everyday',  icon:'🏸',   description:'Play badminton session',                     category:'fitness',   color:'#10B981' },
  { name:'Gym everyday',        icon:'🏋️',  description:'Full gym session',                           category:'fitness',   color:'#EF4444' },
  { name:'No sugar',            icon:'🍭',   description:'Zero added sugar all day',                   category:'nutrition', color:'#EC4899' },
  { name:'Reach office by 9',   icon:'🏢',   description:'At desk and working by 9:00 AM',            category:'work',      color:'#3B82F6' },
  { name:'Read 20 pages',       icon:'📖',   description:'Read at least 20 pages of a book',          category:'learning',  color:'#8B5CF6' },
  { name:'Meditate 10 min',     icon:'🧘',   description:'10 minutes of meditation or breathwork',     category:'mental',    color:'#14B8A6' },
  { name:'No phone after 10 PM',icon:'📵',   description:'No screen time after 10 PM',                category:'sleep',     color:'#6C63FF' },
  { name:'Drink 3L water',      icon:'💧',   description:'Hit 3 litres of water daily',               category:'health',    color:'#3B82F6' },
  { name:'Walk 8000 steps',     icon:'🚶',   description:'At least 8000 steps',                       category:'fitness',   color:'#10B981' },
  { name:'No junk food',        icon:'🥗',   description:'Zero processed or junk food',               category:'nutrition', color:'#F59E0B' },
  { name:'Cold shower',         icon:'🚿',   description:'Start day with a cold shower',              category:'health',    color:'#06B6D4' },
]

const CAT_COLORS: Record<string,string> = {
  health:'#10B981', sleep:'#6C63FF', morning:'#F59E0B', fitness:'#EF4444',
  nutrition:'#EC4899', work:'#3B82F6', learning:'#8B5CF6', mental:'#14B8A6',
}

const EMOJIS = ['💪','🧘','🏸','🏋️','🚶','🍎','💧','📖','🌙','☀️','🚫','🏢','🎯','✅','⭐','🔥','🧠','❤️','🌿','🎵']

function todayStr() {
  const d = new Date()
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
}

function dateStr(date: Date) {
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')
}

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function getCurrentStreak(habit: Habit): number {
  if (habit.completedDays.length === 0) return 0
  const today = todayStr()
  const sorted = [...habit.completedDays].sort().reverse()
  let streak = 0
  let expected = today
  for (const d of sorted) {
    if (d === expected) {
      streak++
      const prev = new Date(expected); prev.setDate(prev.getDate() - 1)
      expected = dateStr(prev)
    } else if (d < expected) {
      break
    }
  }
  return streak
}

function getLongestStreak(habit: Habit): number {
  if (habit.completedDays.length === 0) return 0
  const sorted = [...habit.completedDays].sort()
  let max = 1, cur = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i-1], sorted[i])
    if (diff === 1) { cur++; max = Math.max(max, cur) }
    else if (diff > 1) cur = 1
  }
  return max
}

function getStatusEmoji(streak: number, goal: number): string {
  const pct = streak / goal
  if (pct >= 1)    return '🏆'
  if (pct >= 0.7)  return '🔥'
  if (pct >= 0.4)  return '⚡'
  if (pct >= 0.1)  return '🌱'
  return '💤'
}

function isBroken(habit: Habit): boolean {
  if (habit.completedDays.length === 0) return false
  const today = todayStr()
  const yesterday = dateStr(new Date(new Date(today).getTime() - 86400000))
  return !habit.completedDays.includes(today) && !habit.completedDays.includes(yesterday)
}

type Props = { accent: string; onActiveHabits?: (habits: Habit[]) => void }

export default function HabitsTab({ accent, onActiveHabits }: Props) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try { const s = localStorage.getItem('hos-habits'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [view, setView]         = useState<'dashboard'|'add'|'detail'>('dashboard')
  const [selected, setSelected] = useState<Habit | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  // New habit form
  const [newName,  setNewName]  = useState('')
  const [newIcon,  setNewIcon]  = useState('💪')
  const [newDesc,  setNewDesc]  = useState('')
  const [newGoal,  setNewGoal]  = useState<7|21>(7)
  const [newCat,   setNewCat]   = useState('health')
  const [newColor, setNewColor] = useState('#10B981')
  const [showEmojiPick, setShowEmojiPick] = useState(false)

  function save(next: Habit[]) {
    setHabits(next)
    localStorage.setItem('hos-habits', JSON.stringify(next))
    onActiveHabits?.(next.filter(h => h.active))
  }

  useEffect(() => {
    onActiveHabits?.(habits.filter(h => h.active))
  }, [])

  function addHabit(preset?: typeof PRESET_HABITS[0]) {
    const name  = preset?.name  || newName.trim()
    const icon  = preset?.icon  || newIcon
    const desc  = preset?.description || newDesc.trim()
    const color = preset?.color || newColor
    if (!name) return
    const habit: Habit = {
      id: `habit_${Date.now()}`, name, icon, description: desc,
      goal: newGoal, category: preset?.category || newCat,
      startDate: todayStr(), completedDays: [], active: true,
      createdAt: new Date().toISOString(), color,
    }
    save([habit, ...habits])
    setNewName(''); setNewDesc(''); setView('dashboard'); setShowPresets(false)
  }

  function toggleToday(habitId: string) {
    const today = todayStr()
    save(habits.map(h => {
      if (h.id !== habitId) return h
      const has = h.completedDays.includes(today)
      return { ...h, completedDays: has ? h.completedDays.filter(d=>d!==today) : [...h.completedDays, today] }
    }))
  }

  function deleteHabit(habitId: string) {
    save(habits.filter(h => h.id !== habitId))
    setView('dashboard')
  }

  function archiveHabit(habitId: string) {
    save(habits.map(h => h.id === habitId ? { ...h, active: false } : h))
    setView('dashboard')
  }

  const today        = todayStr()
  const activeHabits = habits.filter(h => h.active)
  const doneToday    = activeHabits.filter(h => h.completedDays.includes(today)).length
  const totalStreak  = activeHabits.reduce((s,h) => s + getCurrentStreak(h), 0)

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    const h       = habits.find(x=>x.id===selected.id) || selected
    const streak  = getCurrentStreak(h)
    const longest = getLongestStreak(h)
    const done    = h.completedDays.includes(today)
    const broken  = isBroken(h)
    const pct     = Math.min(100, Math.round((streak/h.goal)*100))
    const C       = 2*Math.PI*38
    const offset  = C*(1-pct/100)

    // Build last 21 days grid
    const days = Array.from({length:21},(_,i)=>{
      const d = new Date(); d.setDate(d.getDate()-(20-i))
      return dateStr(d)
    })

    return (
      <div className="mt-4 pb-4">
        <button onClick={()=>setView('dashboard')} className="flex items-center gap-2 text-sm text-gray-400 mb-4 border-none bg-transparent cursor-pointer">
          ← Back
        </button>

        {/* Hero card */}
        <div className="rounded-3xl p-5 mb-4 text-white relative overflow-hidden" style={{ background:`linear-gradient(135deg, ${h.color}, ${h.color}99)` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize:'20px 20px' }}/>
          <div className="flex items-start justify-between relative">
            <div>
              <div className="text-4xl mb-2">{h.icon}</div>
              <div className="text-xl font-bold">{h.name}</div>
              <div className="text-white/70 text-sm mt-1">{h.description}</div>
            </div>
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg width="96" height="96" style={{transform:'rotate(-90deg)'}}>
                <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6"/>
                <circle cx="48" cy="48" r="38" fill="none" stroke="white" strokeWidth="6"
                  strokeDasharray={String(C)} strokeDashoffset={String(offset)} strokeLinecap="round"
                  style={{transition:'stroke-dashoffset .5s'}}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-white">{streak}</div>
                <div className="text-[10px] text-white/70">/ {h.goal}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 relative">
            {[
              {label:'Current streak', val:`${streak} days`},
              {label:'Longest',        val:`${longest} days`},
              {label:'Total done',     val:`${h.completedDays.length} days`},
            ].map(s=>(
              <div key={s.label} className="flex-1 bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                <div className="text-sm font-bold text-white">{s.val}</div>
                <div className="text-[9px] text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today check-in */}
        <button onClick={()=>toggleToday(h.id)}
          className="w-full py-4 rounded-2xl text-base font-bold mb-4 border-none cursor-pointer transition-all"
          style={{ background: done?h.color+'20':'#fff', color: done?h.color:'#374151', border:`2px solid ${done?h.color:'#E5E7EB'}` }}>
          {done ? `✓ Done today — ${streak} day streak ${getStatusEmoji(streak,h.goal)}` : `Mark today as done`}
        </button>

        {broken && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
            ⚠️ Streak broken — you missed yesterday. Start fresh from today!
          </div>
        )}

        {/* 21-day calendar grid */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Last 21 Days</div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map(d => {
              const isToday = d===today, isDone=h.completedDays.includes(d), isFut=d>today
              return (
                <div key={d} className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{ background: isDone?h.color:isFut?'#F8FAFC':'#F1F5F9', color: isDone?'#fff':isFut?'#E5E7EB':'#9CA3AF', border: isToday?`2px solid ${h.color}`:'2px solid transparent' }}>
                  {isDone ? '✓' : new Date(d+'T00:00:00').getDate()}
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{background:h.color}}/><span className="text-[9px] text-gray-400">Done</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-200"/><span className="text-[9px] text-gray-400">Missed</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-100"/><span className="text-[9px] text-gray-400">Upcoming</span></div>
          </div>
        </div>

        {/* Milestone badges */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Milestones</div>
          <div className="flex gap-2">
            {[
              {days:1, emoji:'🌱', label:'Day 1'},
              {days:3, emoji:'⚡', label:'Day 3'},
              {days:7, emoji:'🔥', label:'Week 1'},
              {days:14, emoji:'💪', label:'Day 14'},
              {days:21, emoji:'🏆', label:'Day 21'},
            ].map(m=>{
              const achieved = h.completedDays.length >= m.days || streak >= m.days
              return (
                <div key={m.days} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{ background: achieved?h.color+'18':'#F8FAFC', opacity: achieved?1:0.4 }}>
                  <div className="text-lg">{m.emoji}</div>
                  <div className="text-[9px] font-bold" style={{ color: achieved?h.color:'#9CA3AF' }}>{m.label}</div>
                  {achieved && <div className="text-[8px]" style={{color:h.color}}>✓</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={()=>archiveHabit(h.id)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 border-none cursor-pointer">
            Archive
          </button>
          <button onClick={()=>deleteHabit(h.id)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-500 border-none cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    )
  }

  // ── ADD VIEW ──────────────────────────────────────────────────────────────────
  if (view === 'add') return (
    <div className="mt-4 pb-4">
      <button onClick={()=>setView('dashboard')} className="flex items-center gap-2 text-sm text-gray-400 mb-4 border-none bg-transparent cursor-pointer">← Back</button>

      {/* Presets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
        <button onClick={()=>setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between px-4 py-3 border-none bg-transparent cursor-pointer">
          <div>
            <div className="text-sm font-semibold text-gray-800 text-left">Quick add from presets</div>
            <div className="text-xs text-gray-400 mt-0.5 text-left">15 ready-made habits to choose from</div>
          </div>
          <span className="text-gray-400">{showPresets?'▲':'▼'}</span>
        </button>
        {showPresets && (
          <div className="border-t border-gray-100 divide-y divide-gray-50">
            {PRESET_HABITS.map(p=>(
              <button key={p.name} onClick={()=>addHabit(p)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-none bg-transparent cursor-pointer">
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.description}</div>
                </div>
                <div className="text-xs font-bold px-2 py-1 rounded-full" style={{background:p.color+'18',color:p.color}}>+ Add</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom form */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="text-sm font-semibold text-gray-800 mb-4">Or create custom habit</div>

        {/* Icon + Name */}
        <div className="flex gap-3 mb-4">
          <button onClick={()=>setShowEmojiPick(!showEmojiPick)}
            className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer">
            {newIcon}
          </button>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Habit name..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"/>
        </div>

        {showEmojiPick && (
          <div className="grid grid-cols-10 gap-1.5 p-3 bg-gray-50 rounded-xl mb-4">
            {EMOJIS.map(e=>(
              <button key={e} onClick={()=>{setNewIcon(e);setShowEmojiPick(false)}}
                className="text-xl w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
                style={{background:newIcon===e?accent+'20':'transparent'}}>
                {e}
              </button>
            ))}
          </div>
        )}

        <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4 focus:border-green-400"/>

        {/* Goal */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Challenge Length</div>
          <div className="grid grid-cols-2 gap-3">
            {([7,21] as const).map(g=>(
              <button key={g} onClick={()=>setNewGoal(g)}
                className="py-4 rounded-2xl text-center border-2 cursor-pointer transition-all"
                style={{border:newGoal===g?`2px solid ${accent}`:'2px solid #F1F5F9',background:newGoal===g?accent+'12':'#FAFAFA'}}>
                <div className="text-2xl mb-1">{g===7?'🔥':'🏆'}</div>
                <div className="text-lg font-bold" style={{color:newGoal===g?accent:'#374151'}}>{g} Days</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{g===7?'Weekly challenge':'21-day habit'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</div>
          <div className="flex gap-2 flex-wrap">
            {['#10B981','#6C63FF','#F59E0B','#EF4444','#EC4899','#3B82F6','#8B5CF6','#14B8A6','#F97316','#06B6D4'].map(c=>(
              <button key={c} onClick={()=>setNewColor(c)}
                className="w-8 h-8 rounded-full border-4 cursor-pointer"
                style={{background:c,borderColor:newColor===c?'#374151':'transparent'}}>
              </button>
            ))}
          </div>
        </div>

        <button onClick={()=>addHabit()} disabled={!newName.trim()}
          className="w-full py-3 rounded-xl text-sm font-bold text-white border-none cursor-pointer"
          style={{background:newName.trim()?accent:'#E5E7EB'}}>
          Start {newGoal}-Day Challenge
        </button>
      </div>
    </div>
  )

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
  const completedHabits = habits.filter(h=>!h.active&&h.completedDays.length>=h.goal)

  return (
    <div className="mt-4 pb-4">

      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          {label:'Active',  val:activeHabits.length, emoji:'⚡', color:accent},
          {label:'Done today', val:`${doneToday}/${activeHabits.length}`, emoji:'✅', color:'#10B981'},
          {label:'Total streak', val:totalStreak, emoji:'🔥', color:'#F59E0B'},
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="mono text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button onClick={()=>setView('add')}
        className="w-full py-3 rounded-2xl text-sm font-bold mb-4 border-2 cursor-pointer transition-all flex items-center justify-center gap-2"
        style={{border:`2px dashed ${accent}`, color:accent, background:accent+'08'}}>
        <span className="text-lg">+</span> Start a new habit challenge
      </button>

      {/* Active habits */}
      {activeHabits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🌱</div>
          <div className="text-sm font-medium">No active habits yet</div>
          <div className="text-xs mt-1">Start a challenge above</div>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {activeHabits.map(h=>{
            const streak  = getCurrentStreak(h)
            const done    = h.completedDays.includes(today)
            const broken  = isBroken(h)
            const pct     = Math.min(100, Math.round((streak/h.goal)*100))
            const statusE = getStatusEmoji(streak, h.goal)
            const daysLeft = h.goal - h.completedDays.length
            const C = 2*Math.PI*20
            return (
              <div key={h.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {/* Top: info + mini ring */}
                <div className="flex items-center gap-3 px-4 pt-3 pb-2 cursor-pointer" onClick={()=>{setSelected(h);setView('detail')}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:h.color+'18'}}>
                    {h.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-800">{h.name}</div>
                      {broken && <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">Broken</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {streak} day streak {statusE} · {daysLeft} days left
                    </div>
                  </div>
                  {/* Mini ring */}
                  <div className="relative w-11 h-11 flex-shrink-0">
                    <svg width="44" height="44" style={{transform:'rotate(-90deg)'}}>
                      <circle cx="22" cy="22" r="17" fill="none" stroke="#F1F5F9" strokeWidth="4"/>
                      <circle cx="22" cy="22" r="17" fill="none" stroke={h.color} strokeWidth="4"
                        strokeDasharray={String(2*Math.PI*17)} strokeDashoffset={String(2*Math.PI*17*(1-pct/100))} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="mono text-[9px] font-bold" style={{color:h.color}}>{pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:h.color}}/>
                  </div>
                  {/* Mini day dots */}
                  <div className="flex gap-1 mt-2 overflow-x-auto">
                    {Array.from({length:h.goal},(_,i)=>{
                      const d = new Date(h.startDate+'T00:00:00'); d.setDate(d.getDate()+i)
                      const ds = dateStr(d)
                      const isDone = h.completedDays.includes(ds)
                      const isPast = ds < today
                      const isTd   = ds === today
                      return (
                        <div key={i} className="w-5 h-5 flex-none rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{background:isDone?h.color:isTd?h.color+'30':isPast?'#FEE2E2':'#F1F5F9',color:isDone?'#fff':isTd?h.color:isPast?'#FCA5A5':'#D1D5DB'}}>
                          {isDone?'✓':i+1}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Check today button */}
                <div className="px-4 pb-3 mt-2">
                  <button onClick={e=>{e.stopPropagation();toggleToday(h.id)}}
                    className="w-full py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer"
                    style={{background:done?h.color+'15':'#fff',color:done?h.color:'#374151',border:`2px solid ${done?h.color:'#E5E7EB'}`}}>
                    {done?`✓ Done today — tap to undo`:`Mark today as done`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed / archived */}
      {completedHabits.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Completed 🏆</div>
          <div className="space-y-2">
            {completedHabits.map(h=>(
              <div key={h.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center gap-3 opacity-70">
                <span className="text-xl">{h.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{h.name}</div>
                  <div className="text-xs text-gray-400">{h.goal}-day challenge completed</div>
                </div>
                <span className="text-xl">🏆</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
