'use client'
import { useState } from 'react'

export type CustomTask = {
  id: string
  label: string
  icon: string
  time: string
  cat: string
  pts: number
  days: string        // 'today:YYYY-M-D' | 'daily' | 'Mon,Wed,Fri' | etc
  gid: string
  glabel: string
  gicon: string
  order: number
  note?: string
  size: 'small' | 'medium' | 'large'
  custom: true        // marks as user-created
  createdAt: string
}

const CATS = [
  { id:'health',    label:'Health',     icon:'💊', color:'#8B5CF6' },
  { id:'workout',   label:'Workout',    icon:'⚡', color:'#EF4444' },
  { id:'nutrition', label:'Nutrition',  icon:'🥗', color:'#10B981' },
  { id:'work',      label:'Work',       icon:'💼', color:'#3B82F6' },
  { id:'personal',  label:'Personal',   icon:'🌱', color:'#F59E0B' },
  { id:'family',    label:'Family',     icon:'👨‍👩‍👧', color:'#EC4899' },
  { id:'learning',  label:'Learning',   icon:'📖', color:'#6366F1' },
  { id:'household', label:'Household',  icon:'🏡', color:'#14B8A6' },
]

const SIZES = [
  { id:'small',  label:'Small',  pts:3,  desc:'Quick — under 5 min',   icon:'🟢' },
  { id:'medium', label:'Medium', pts:6,  desc:'Normal — 15–30 min',    icon:'🟡' },
  { id:'large',  label:'Large',  pts:12, desc:'Big task — 30+ min',    icon:'🔴' },
]

const FREQ_OPTIONS = [
  { id:'today',    label:'Today only',   desc:'One-time, just for today',        icon:'📅' },
  { id:'daily',    label:'Every day',    desc:'Shows up every single day',        icon:'🔁' },
  { id:'weekdays', label:'Weekdays',     desc:'Mon–Fri only',                    icon:'💼' },
  { id:'weekends', label:'Weekends',     desc:'Sat & Sun only',                  icon:'🏖️' },
  { id:'custom',   label:'Custom days',  desc:'Pick specific days',              icon:'🗓️' },
]

const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const EMOJI_OPTIONS = ['✅','⭐','🎯','💪','🧘','🏃','📝','💡','🔔','🌟','❤️','🎵','🌿','☀️','🍎','💧','📚','🛠️','✈️','🤝']

type Props = {
  editingTask?: CustomTask | null
  onSave: (task: CustomTask) => void
  onDelete?: (taskId: string, removeAll: boolean) => void
  onClose: () => void
  todayDk: string
}

export default function TaskEditor({ editingTask, onSave, onDelete, onClose, todayDk }: Props) {
  const isEdit = !!editingTask

  const [label,    setLabel]    = useState(editingTask?.label    || '')
  const [icon,     setIcon]     = useState(editingTask?.icon     || '✅')
  const [time,     setTime]     = useState(editingTask?.time     || '09:00')
  const [cat,      setCat]      = useState(editingTask?.cat      || 'personal')
  const [size,     setSize]     = useState<'small'|'medium'|'large'>(editingTask?.size || 'medium')
  const [freq,     setFreq]     = useState(() => {
    if (!editingTask) return 'daily'
    const d = editingTask.days
    if (d.startsWith('today:')) return 'today'
    if (d === 'all') return 'daily'
    if (d === 'Mon,Tue,Wed,Thu,Fri') return 'weekdays'
    if (d === 'Sat,Sun') return 'weekends'
    return 'custom'
  })
  const [customDays, setCustomDays] = useState<string[]>(() => {
    if (!editingTask) return []
    const d = editingTask.days
    if (d === 'all' || d.startsWith('today:') || d === 'Mon,Tue,Wed,Thu,Fri' || d === 'Sat,Sun') return []
    return d.split(',').map(s=>s.trim())
  })
  const [note,     setNote]     = useState(editingTask?.note     || '')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [step,     setStep]     = useState(1)  // 1=basics, 2=schedule, 3=details

  const selectedCat = CATS.find(c=>c.id===cat) || CATS[4]
  const selectedSize = SIZES.find(s=>s.id===size) || SIZES[1]

  function getDaysValue(): string {
    if (freq === 'today')    return `today:${todayDk}`
    if (freq === 'daily')    return 'all'
    if (freq === 'weekdays') return 'Mon,Tue,Wed,Thu,Fri'
    if (freq === 'weekends') return 'Sat,Sun'
    if (freq === 'custom')   return customDays.length > 0 ? customDays.join(',') : 'all'
    return 'all'
  }

  function toggleDay(day: string) {
    setCustomDays(prev => prev.includes(day) ? prev.filter(d=>d!==day) : [...prev, day])
  }

  function handleSave() {
    if (!label.trim()) return
    const task: CustomTask = {
      id:        editingTask?.id || `custom_${Date.now()}`,
      label:     label.trim(),
      icon,
      time,
      cat,
      pts:       selectedSize.pts,
      days:      getDaysValue(),
      gid:       `custom_${cat}`,
      glabel:    selectedCat.label,
      gicon:     selectedCat.icon,
      order:     editingTask?.order || 50,
      note:      note.trim() || undefined,
      size,
      custom:    true,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    }
    onSave(task)
    onClose()
  }

  const fmt12 = (t: string) => {
    const [h,m] = t.split(':').map(Number)
    return `${h%12||12}:${m<10?'0':''}${m} ${h>=12?'PM':'AM'}`
  }

  const canProceed1 = label.trim().length > 0
  const canProceed2 = freq !== 'custom' || customDays.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 16px)' }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full"/>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <div className="text-base font-semibold text-gray-900">{isEdit ? 'Edit task' : 'New task'}</div>
            <div className="text-xs text-gray-400 mt-0.5">Step {step} of 3</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm border-none cursor-pointer">✕</button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${(step/3)*100}%` }}/>
        </div>

        <div className="px-5 py-4">

          {/* ── STEP 1: BASICS ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">What's the task?</div>

                {/* Icon + Label row */}
                <div className="flex gap-3 items-start">
                  <button onClick={() => setShowEmoji(!showEmoji)}
                    className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer">
                    {icon}
                  </button>
                  <input
                    value={label} onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Evening meditation"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-400"
                    autoFocus
                  />
                </div>

                {/* Emoji picker */}
                {showEmoji && (
                  <div className="grid grid-cols-10 gap-2 mt-3 p-3 bg-gray-50 rounded-xl">
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} onClick={() => { setIcon(e); setShowEmoji(false) }}
                        className="text-xl w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center border-none cursor-pointer bg-transparent"
                        style={{ background: icon===e ? '#fff' : 'transparent', boxShadow: icon===e ? '0 1px 3px rgba(0,0,0,0.1)':'' }}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</div>
                <div className="grid grid-cols-4 gap-2">
                  {CATS.map(c => (
                    <button key={c.id} onClick={() => setCat(c.id)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all cursor-pointer"
                      style={{ border: cat===c.id ? `2px solid ${c.color}` : '2px solid #F1F5F9', background: cat===c.id ? c.color+'15' : '#FAFAFA' }}>
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-[9px] font-semibold" style={{ color: cat===c.id ? c.color : '#9CA3AF' }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Task size</div>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map(s => (
                    <button key={s.id} onClick={() => setSize(s.id as any)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer"
                      style={{ border: size===s.id ? '2px solid #10B981' : '2px solid #F1F5F9', background: size===s.id ? '#ECFDF5' : '#FAFAFA' }}>
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: size===s.id ? '#065F46' : '#374151' }}>{s.label}</span>
                      <span className="text-[9px] text-gray-400">{s.desc}</span>
                      <span className="mono text-[10px] font-bold" style={{ color: size===s.id ? '#10B981' : '#9CA3AF' }}>+{s.pts}pt</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: SCHEDULE ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Time */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">What time?</div>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-xl">🕐</span>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none"/>
                  <span className="mono text-xs text-gray-400 font-medium">{fmt12(time)}</span>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">How often?</div>
                <div className="space-y-2">
                  {FREQ_OPTIONS.map(f => (
                    <button key={f.id} onClick={() => setFreq(f.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left"
                      style={{ border: freq===f.id ? '2px solid #10B981' : '2px solid #F1F5F9', background: freq===f.id ? '#ECFDF5' : '#FAFAFA' }}>
                      <span className="text-xl flex-shrink-0">{f.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: freq===f.id ? '#065F46' : '#374151' }}>{f.label}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{f.desc}</div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ border: freq===f.id ? '2px solid #10B981' : '2px solid #D1D5DB', background: freq===f.id ? '#10B981' : 'transparent' }}>
                        {freq===f.id && <span className="text-white text-[10px]">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom day picker */}
                {freq === 'custom' && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">Select days:</div>
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map(d => (
                        <button key={d} onClick={() => toggleDay(d)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border-2"
                          style={{ border: customDays.includes(d) ? '2px solid #10B981' : '2px solid #F1F5F9', background: customDays.includes(d) ? '#ECFDF5' : '#FAFAFA', color: customDays.includes(d) ? '#065F46' : '#9CA3AF' }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: DETAILS + REVIEW ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Note */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Note / reminder (optional)</div>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add a helpful reminder or detail..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none resize-none focus:border-green-400"/>
              </div>

              {/* Review card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Review</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: selectedCat.color+'20' }}>{icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{label || '(no title)'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{selectedCat.icon} {selectedCat.label}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="mono text-sm font-bold text-green-600">+{selectedSize.pts}pt</div>
                    <div className="text-[10px] text-gray-400">{selectedSize.label}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <div className="text-gray-400 mb-0.5">Time</div>
                    <div className="font-semibold text-gray-700">{fmt12(time)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <div className="text-gray-400 mb-0.5">Frequency</div>
                    <div className="font-semibold text-gray-700">
                      {freq === 'today' ? 'Today only' : freq === 'daily' ? 'Every day' : freq === 'weekdays' ? 'Weekdays' : freq === 'weekends' ? 'Weekends' : `${customDays.join(', ')}`}
                    </div>
                  </div>
                </div>
                {note && <div className="mt-2 text-xs text-gray-500 bg-white rounded-lg p-2 border border-gray-100">{note}</div>}
              </div>

              {/* Delete option (edit mode only) */}
              {isEdit && onDelete && (
                <div>
                  {!showDelete ? (
                    <button onClick={() => setShowDelete(true)}
                      className="w-full py-2.5 rounded-xl border-2 border-red-100 bg-red-50 text-red-500 text-sm font-semibold cursor-pointer">
                      🗑️ Delete this task
                    </button>
                  ) : (
                    <div className="bg-red-50 rounded-xl p-4 border-2 border-red-100">
                      <div className="text-sm font-semibold text-red-700 mb-3">Remove this task from:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { onDelete(editingTask!.id, false); onClose() }}
                          className="py-2.5 rounded-xl bg-orange-100 text-orange-700 text-sm font-semibold cursor-pointer border-none">
                          Today only
                        </button>
                        <button onClick={() => { onDelete(editingTask!.id, true); onClose() }}
                          className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold cursor-pointer border-none">
                          All days
                        </button>
                      </div>
                      <button onClick={() => setShowDelete(false)} className="w-full mt-2 text-xs text-gray-400 bg-transparent border-none cursor-pointer py-1">Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── NAVIGATION BUTTONS ── */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-600 text-sm font-semibold cursor-pointer">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step===1 ? !canProceed1 : !canProceed2}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold cursor-pointer border-none transition-all"
                style={{ background: (step===1?canProceed1:canProceed2) ? '#10B981' : '#E5E7EB', color: (step===1?canProceed1:canProceed2) ? '#fff' : '#9CA3AF' }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSave} disabled={!label.trim()}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold cursor-pointer border-none"
                style={{ background: label.trim() ? '#10B981' : '#E5E7EB', color: label.trim() ? '#fff' : '#9CA3AF' }}>
                {isEdit ? '✓ Save changes' : '✓ Add task'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
