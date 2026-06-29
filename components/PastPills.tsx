'use client'
import { Group } from '@/lib/tasks'

type Props = { groups: Group[]; ckDay: Record<string,boolean>; accent: string; onToggle: (id:string)=>void }

export default function PastPills({ groups, ckDay, accent, onToggle }: Props) {
  const allTasks = groups.flatMap(g => [...g.tasks, ...(g.bk ? [g.bk] : [])])
  return (
    <div className="mt-4">
      <div className="mono text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Earlier today</div>
      <div className="flex flex-wrap gap-1.5">
        {allTasks.map(task => {
          const done = !!ckDay[task.id]
          return (
            <span key={task.id} onClick={() => onToggle(task.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all"
              style={{ background: done ? accent+'18' : '#F1F5F9', border: `1px solid ${done ? accent+'50' : '#E2E8F0'}`, opacity: done ? 1 : 0.65 }}>
              <span style={{ width:13, height:13, borderRadius:4, background: done ? accent : 'transparent', border: done ? 'none' : '1.5px solid #CBD5E1', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', flexShrink:0 }}>{done?'✓':''}</span>
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: done ? '#374151' : '#94A3B8' }}>{task.icon} {task.label}</span>
            </span>
          )
        })}
      </div>
      <div className="h-px bg-gray-100 mt-4"/>
    </div>
  )
}
