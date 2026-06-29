'use client'
import { Habit } from './HabitsTab'

function getCurrentStreak(habit: Habit): number {
  if (habit.completedDays.length === 0) return 0
  const today = new Date()
  const todayStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0')
  const sorted = [...habit.completedDays].sort().reverse()
  let streak = 0
  let expected = todayStr
  for (const d of sorted) {
    if (d === expected) {
      streak++
      const prev = new Date(expected+'T00:00:00'); prev.setDate(prev.getDate()-1)
      expected = prev.getFullYear()+'-'+String(prev.getMonth()+1).padStart(2,'0')+'-'+String(prev.getDate()).padStart(2,'0')
    } else break
  }
  return streak
}

type Props = {
  habits: Habit[]
  accent: string
  onNavigate: () => void
}

export default function ActiveHabitsWidget({ habits, accent, onNavigate }: Props) {
  if (habits.length === 0) return null

  const todayStr = (() => {
    const d = new Date()
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
  })()

  const doneCount = habits.filter(h => h.completedDays.includes(todayStr)).length

  return (
    <div className="mt-3 mb-1">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Challenges</div>
        <button onClick={onNavigate} className="text-xs font-semibold border-none bg-transparent cursor-pointer" style={{color:accent}}>
          See all →
        </button>
      </div>

      {/* Habit pills */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
        {habits.map(h => {
          const streak  = getCurrentStreak(h)
          const done    = h.completedDays.includes(todayStr)
          const pct     = Math.min(100, Math.round((streak/h.goal)*100))

          return (
            <button key={h.id} onClick={onNavigate}
              className="flex-none flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border-2 cursor-pointer transition-all min-w-[80px]"
              style={{
                border: done ? `2px solid ${h.color}` : '2px solid #F1F5F9',
                background: done ? h.color+'12' : '#fff',
              }}>
              <span className="text-2xl">{h.icon}</span>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:h.color}}/>
              </div>
              <div className="mono text-[9px] font-bold" style={{color:done?h.color:'#9CA3AF'}}>
                {streak}/{h.goal}d {done?'✓':''}
              </div>
            </button>
          )
        })}

        {/* Summary pill */}
        <div className="flex-none flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-2xl bg-gray-50 border-2 border-gray-100 min-w-[70px]">
          <div className="text-lg">{doneCount===habits.length?'🔥':'⚡'}</div>
          <div className="mono text-[9px] font-bold text-gray-500">{doneCount}/{habits.length}</div>
          <div className="text-[8px] text-gray-400">today</div>
        </div>
      </div>
    </div>
  )
}
