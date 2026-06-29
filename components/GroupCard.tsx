'use client'
import { Group, Task } from '@/lib/tasks'

type Props = {
  group: Group
  ckDay: Record<string, boolean>
  pal: { a: string; s: string; b: string }
  isNext: boolean
  isPast: boolean
  onToggle: (id: string) => void
  isToday: boolean
}

function isTaskLocked(task: Task, isToday: boolean): boolean {
  if (!task.lockedAfter || !isToday) return false
  const [h, m] = task.lockedAfter.split(':').map(Number)
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes() > h * 60 + m
}

export default function GroupCard({ group, ckDay, pal, isNext, isPast, onToggle, isToday }: Props) {
  const { a, s, b } = pal
  const allDone  = group.tasks.every(t => ckDay[t.id])
  const someDone = group.tasks.some(t => ckDay[t.id])
  const fmt12 = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${m < 10 ? '0' : ''}${m} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-2.5 transition-all"
      style={{
        background: '#fff',
        border: isNext ? `2px solid ${a}` : `1px solid ${allDone ? '#D1FAE5' : b}`,
        boxShadow: isNext ? `0 4px 14px ${a}25` : '0 1px 3px rgba(0,0,0,.04)',
        opacity: isPast && !someDone ? 0.4 : 1,
      }}>

      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{
          background: allDone ? '#F0FDF4' : isNext ? s : '#FAFAFA',
          borderBottom: `1px solid ${allDone ? '#D1FAE5' : isNext ? b : '#F1F5F9'}`,
        }}>
        <span className="text-sm">{group.icon}</span>
        <div className="flex-1">
          <div className="text-[12px] font-semibold" style={{ color: allDone ? '#065F46' : '#1F2937' }}>{group.lbl}</div>
        </div>
        {isNext && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: a, background: s }}>
            up next
          </span>
        )}
        <div className="mono text-[10px] text-gray-400">{fmt12(group.time)}</div>
      </div>

      {/* Tasks */}
      {group.tasks.map((task, i) => {
        const done   = !!ckDay[task.id]
        const locked = isTaskLocked(task, isToday) && !done
        return (
          <div key={task.id}
            onClick={() => !locked && onToggle(task.id)}
            className="flex items-start gap-2.5 px-4 py-2.5 transition-colors task-row"
            style={{
              background: done ? '#F0FDF4' : locked ? '#FAFAFA' : '#fff',
              borderBottom: i < group.tasks.length - 1 ? '1px solid #F8FAFC' : 'none',
              cursor: locked ? 'not-allowed' : 'pointer',
              opacity: locked ? 0.5 : 1,
            }}>

            {/* Checkbox */}
            <div className="cb w-5 h-5 rounded-[6px] flex-shrink-0 mt-0.5 flex items-center justify-center"
              style={{
                background: done ? a : 'transparent',
                border: done ? 'none' : locked ? '1.5px solid #E5E7EB' : '1.5px solid #D1D5DB',
              }}>
              {done   && <span className="text-[10px] text-white leading-none">✓</span>}
              {locked && !done && <span className="text-[10px] text-gray-300 leading-none">🔒</span>}
            </div>

            <span className="text-sm">{task.icon}</span>

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium leading-snug"
                style={{ color: done ? '#9CA3AF' : locked ? '#9CA3AF' : '#1F2937', textDecoration: done ? 'line-through' : 'none' }}>
                {task.label}
                {locked && <span className="text-[10px] text-gray-400 ml-1.5 font-normal">(window closed)</span>}
              </div>
              {!done && task.note && !locked && (
                <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{task.note}</div>
              )}
              {locked && task.lockedAfter && (
                <div className="text-[10px] text-gray-400 mt-0.5">Checkable only before {fmt12(task.lockedAfter)}</div>
              )}
            </div>

            <div className="mono text-[9px] font-semibold pt-0.5" style={{ color: done ? a : '#CBD5E1' }}>
              +{task.pts}pt
            </div>
          </div>
        )
      })}
    </div>
  )
}
