'use client'
import { useState } from 'react'
import { Group } from '@/lib/tasks'

type WindDownActivity = {
  id: string
  label: string
  icon: string
  pts: number
}

const DEFAULT_ACTIVITIES: WindDownActivity[] = [
  { id:'wd_brush', label:'Brush teeth',           icon:'🦷', pts:3 },
  { id:'wd_read',  label:'Read',                  icon:'📖', pts:5 },
  { id:'wd_walk',  label:'Night walk (optional)', icon:'🌙', pts:4 },
  { id:'wd_bath',  label:'Bath / shower',         icon:'🚿', pts:3 },
]

const EMOJI_OPTS = ['🦷','📖','🌙','🚿','🧘','😌','📝','🎵','🕯️','☕','🌿','💆','🧴','📱','✍️','🎧']

type Props = {
  group: Group
  ckDay: Record<string, boolean>
  accent: string
  soft: string
  border: string
  onToggle: (id: string) => void
}

export default function WindDownCard({ group, ckDay, accent, soft, border, onToggle }: Props) {
  // Load activities from localStorage or use defaults
  const [activities, setActivities] = useState<WindDownActivity[]>(() => {
    try {
      const s = localStorage.getItem('hos-winddown-activities')
      return s ? JSON.parse(s) : DEFAULT_ACTIVITIES
    } catch { return DEFAULT_ACTIVITIES }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingAct, setEditingAct] = useState<WindDownActivity | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newIcon, setNewIcon] = useState('📖')
  const [newPts, setNewPts] = useState(3)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function saveActivities(next: WindDownActivity[]) {
    setActivities(next)
    localStorage.setItem('hos-winddown-activities', JSON.stringify(next))
  }

  function startAdd() {
    setEditingAct(null)
    setNewLabel(''); setNewIcon('📖'); setNewPts(3)
    setIsEditing(true); setShowEmojiPicker(false)
  }

  function startEdit(act: WindDownActivity) {
    setEditingAct(act)
    setNewLabel(act.label); setNewIcon(act.icon); setNewPts(act.pts)
    setIsEditing(true); setShowEmojiPicker(false)
  }

  function handleSave() {
    if (!newLabel.trim()) return
    if (editingAct) {
      saveActivities(activities.map(a => a.id === editingAct.id ? { ...a, label: newLabel.trim(), icon: newIcon, pts: newPts } : a))
    } else {
      saveActivities([...activities, { id: `wd_${Date.now()}`, label: newLabel.trim(), icon: newIcon, pts: newPts }])
    }
    setIsEditing(false); setEditingAct(null)
  }

  function handleDelete(id: string) {
    saveActivities(activities.filter(a => a.id !== id))
    setIsEditing(false); setEditingAct(null)
  }

  const doneCount = activities.filter(a => ckDay[a.id]).length
  const allDone = doneCount === activities.length
  const fmt12 = (t: string) => { const [h,m]=t.split(':').map(Number); return `${h%12||12}:${m<10?'0':''}${m} ${h>=12?'PM':'AM'}` }

  // Magnesium task from the group
  const magTask = group.tasks.find(t => t.id === 'magnesium')
  const sleepTask = group.tasks.find(t => t.id === 'sleep')

  return (
    <div className="rounded-2xl overflow-hidden mb-2.5 shadow-sm" style={{ border: `1px solid ${allDone?'#D1FAE5':border}`, background:'#fff' }}>

      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: allDone?'#F0FDF4':'#FAFAFA', borderBottom:`1px solid ${allDone?'#D1FAE5':'#F1F5F9'}` }}>
        <span className="text-sm">🌙</span>
        <div className="flex-1">
          <div className="text-[12px] font-semibold" style={{ color: allDone?'#065F46':'#1F2937' }}>Wind Down</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{fmt12(group.time)} · {doneCount}/{activities.length} done</div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-none cursor-pointer transition-all"
          style={{ background: isEditing ? accent+'20' : '#F1F5F9', color: isEditing ? accent : '#6B7280' }}>
          {isEditing ? 'Done' : '✏️ Edit'}
        </button>
      </div>

      {/* Activity list */}
      <div>
        {activities.map((act, i) => {
          const done = !!ckDay[act.id]
          return (
            <div key={act.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors"
              style={{ borderBottom: i < activities.length - 1 ? '1px solid #F8FAFC' : 'none', background: done ? '#F0FDF4' : '#fff' }}>

              {/* Checkbox — only clickable when not editing */}
              {!isEditing ? (
                <div onClick={() => onToggle(act.id)} className="flex items-center gap-2.5 flex-1 cursor-pointer">
                  <div className="w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center"
                    style={{ background: done ? accent : 'transparent', border: done ? 'none' : '1.5px solid #D1D5DB' }}>
                    {done && <span className="text-[10px] text-white leading-none">✓</span>}
                  </div>
                  <span className="text-sm">{act.icon}</span>
                  <span className="text-[13px] font-medium" style={{ color: done?'#9CA3AF':'#1F2937', textDecoration: done?'line-through':'none' }}>{act.label}</span>
                  <span className="ml-auto mono text-[9px] font-semibold" style={{ color: done?accent:'#CBD5E1' }}>+{act.pts}pt</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="text-sm">{act.icon}</span>
                  <span className="text-[13px] text-gray-700 flex-1">{act.label}</span>
                  <span className="mono text-[9px] text-gray-400">+{act.pts}pt</span>
                  <button onClick={() => startEdit(act)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border-none cursor-pointer font-semibold">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(act.id)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-500 border-none cursor-pointer font-semibold">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit / Add form */}
      {isEditing && (
        <div className="px-4 py-3 border-t border-gray-100" style={{ background: '#FAFAFA' }}>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {editingAct ? 'Edit activity' : 'Add activity'}
          </div>
          <div className="flex items-center gap-2 mb-2">
            {/* Emoji button */}
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg flex-shrink-0 cursor-pointer">
              {newIcon}
            </button>
            {/* Label input */}
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)}
              placeholder="Activity name..."
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-400"/>
            {/* Points */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-2">
              <button onClick={()=>setNewPts(p=>Math.max(1,p-1))} className="text-gray-400 border-none bg-transparent cursor-pointer text-sm leading-none">−</button>
              <span className="mono text-xs font-bold text-gray-700 min-w-[20px] text-center">{newPts}</span>
              <button onClick={()=>setNewPts(p=>Math.min(12,p+1))} className="text-gray-400 border-none bg-transparent cursor-pointer text-sm leading-none">+</button>
            </div>
          </div>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-white rounded-xl border border-gray-100 mb-2">
              {EMOJI_OPTS.map(e => (
                <button key={e} onClick={()=>{setNewIcon(e);setShowEmojiPicker(false)}}
                  className="text-lg w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors"
                  style={{ background: newIcon===e ? accent+'20' : 'transparent' }}>
                  {e}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!newLabel.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: newLabel.trim() ? accent : '#E5E7EB' }}>
              {editingAct ? '✓ Save' : '+ Add'}
            </button>
            {editingAct && (
              <button onClick={()=>{setEditingAct(null);setNewLabel('');setNewIcon('📖');setNewPts(3)}}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 border-none cursor-pointer">
                Cancel
              </button>
            )}
            <button onClick={startAdd}
              className="px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer"
              style={{ background: accent+'15', color: accent }}>
              New
            </button>
          </div>
        </div>
      )}

      {/* Magnesium row */}
      {magTask && (
        <div onClick={() => onToggle(magTask.id)}
          className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors"
          style={{ borderTop:'1px solid #F1F5F9', background: ckDay[magTask.id]?'#F5F3FF':'#fff' }}>
          <div className="w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center"
            style={{ background: ckDay[magTask.id]?'#8B5CF6':'transparent', border: ckDay[magTask.id]?'none':'1.5px solid #D1D5DB' }}>
            {ckDay[magTask.id] && <span className="text-[10px] text-white leading-none">✓</span>}
          </div>
          <span className="text-sm">{magTask.icon}</span>
          <div className="flex-1">
            <div className="text-[13px] font-medium" style={{ color: ckDay[magTask.id]?'#9CA3AF':'#1F2937', textDecoration:ckDay[magTask.id]?'line-through':'none' }}>{magTask.label}</div>
            {!ckDay[magTask.id] && <div className="text-[10px] text-gray-400 mt-0.5">{magTask.note}</div>}
          </div>
          <span className="mono text-[9px] font-semibold" style={{ color: ckDay[magTask.id]?'#8B5CF6':'#CBD5E1' }}>+{magTask.pts}pt</span>
        </div>
      )}

      {/* Sleep row */}
      {sleepTask && (
        <div onClick={() => onToggle(sleepTask.id)}
          className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors"
          style={{ borderTop:'1px solid #F1F5F9', background: ckDay[sleepTask.id]?'#F0FDF4':'#fff' }}>
          <div className="w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center"
            style={{ background: ckDay[sleepTask.id]?accent:'transparent', border: ckDay[sleepTask.id]?'none':'1.5px solid #D1D5DB' }}>
            {ckDay[sleepTask.id] && <span className="text-[10px] text-white leading-none">✓</span>}
          </div>
          <span className="text-sm">{sleepTask.icon}</span>
          <span className="text-[13px] font-medium flex-1" style={{ color: ckDay[sleepTask.id]?'#9CA3AF':'#1F2937', textDecoration:ckDay[sleepTask.id]?'line-through':'none' }}>{sleepTask.label}</span>
          <span className="mono text-[9px] font-semibold" style={{ color: ckDay[sleepTask.id]?accent:'#CBD5E1' }}>+{sleepTask.pts}pt</span>
        </div>
      )}
    </div>
  )
}
