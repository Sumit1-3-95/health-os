'use client'
import { Group } from '@/lib/tasks'

type Props = { group: Group; ckDay: Record<string,boolean>; pal: {a:string,s:string,b:string}; onToggle: (id:string)=>void }

export default function MedCard({ group, ckDay, pal, onToggle }: Props) {
  const { a, s, b } = pal
  const bk = group.bk
  const fmt12 = (t: string) => { const [h,m]=t.split(':').map(Number); return `${h%12||12}:${m<10?'0':''}${m} ${h>=12?'PM':'AM'}` }

  return (
    <div className="rounded-2xl overflow-hidden mb-2.5 shadow-sm" style={{ background: '#fff', border: `1px solid ${b}` }}>
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: s, borderBottom: `1px solid ${b}` }}>
        <span className="text-[15px]">💊</span>
        <div className="flex-1">
          <div className="text-[12px] font-semibold text-gray-900">Morning Supplements</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Take with breakfast</div>
        </div>
        <div className="mono text-[10px] font-semibold" style={{ color: a }}>{fmt12(group.time)}</div>
      </div>
      {/* Breakfast row */}
      {bk && (
        <div onClick={() => onToggle(bk.id)} className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer task-row"
          style={{ background: ckDay[bk.id] ? '#F0FDF4' : '#fff', borderBottom: '1px solid #F1F5F9' }}>
          <div className="cb w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center"
            style={{ background: ckDay[bk.id] ? '#10B981' : 'transparent', border: ckDay[bk.id] ? 'none' : '1.5px solid #D1D5DB' }}>
            {ckDay[bk.id] && <span className="text-[10px] text-white">✓</span>}
          </div>
          <span className="text-sm">🥣</span>
          <div className="flex-1">
            <div className="text-[13px] font-medium" style={{ color: ckDay[bk.id] ? '#9CA3AF' : '#1F2937', textDecoration: ckDay[bk.id] ? 'line-through' : 'none' }}>{bk.label}</div>
            {!ckDay[bk.id] && bk.note && <div className="text-[11px] text-gray-400 mt-0.5">{bk.note}</div>}
          </div>
          <div className="mono text-[10px] text-gray-400">+{bk.pts}pt</div>
        </div>
      )}
      {/* Dual tiles */}
      <div className="grid grid-cols-2">
        {group.tasks.map((task, i) => {
          const done = !!ckDay[task.id]
          return (
            <div key={task.id} onClick={() => onToggle(task.id)}
              className="flex flex-col items-center py-3 px-2 cursor-pointer transition-colors"
              style={{ background: done ? '#F5F3FF' : '#fff', borderTop: '1px solid #F1F5F9', borderRight: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
              <div className="w-8 h-8 rounded-[9px] mb-1.5 flex items-center justify-center transition-all"
                style={{ background: done ? a : 'transparent', border: done ? 'none' : '2px solid #E5E7EB' }}>
                {done ? <span className="text-base text-white">✓</span> : <span className="text-base">{task.icon}</span>}
              </div>
              <div className="text-[11px] font-semibold text-center" style={{ color: done ? '#8B5CF6' : '#374151' }}>{task.label}</div>
              <div className="mono text-[9px] text-gray-400 mt-0.5">+{task.pts}pt</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
