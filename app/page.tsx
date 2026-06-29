'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  TASKS, DAYS, DAY_FULL, MONTHS, MONTH_FULL, PAL, CAT_COL,
  getDayType, getTasksForDate, buildGroups, dateToDk, dateToIso,
  toMin, scoreColor, weekStart, Task, Group
} from '@/lib/tasks'
import Header from '@/components/Header'
import ScoreCard from '@/components/ScoreCard'
import GroupCard from '@/components/GroupCard'
import MedCard from '@/components/MedCard'
import PastPills from '@/components/PastPills'
import DashboardTab from '@/components/DashboardTab'
import DietTab from '@/components/DietTab'
import TaskEditor, { CustomTask } from '@/components/TaskEditor'
import WindDownCard from '@/components/WindDownCard'
import HabitsTab from '@/components/HabitsTab'
import ActiveHabitsWidget, { } from '@/components/ActiveHabitsWidget'
import { Habit } from '@/components/HabitsTab'
import ProteinTracker, { MealOption } from '@/components/ProteinTracker'
import QuickTasks from '@/components/QuickTasks'

type Checked = Record<string, Record<string, boolean>>
type Weights = Record<string, number>
type Scores  = Record<string, number>
type Page    = 'home' | 'dashboard' | 'diet'

export default function Home() {
  const today = new Date(); today.setHours(0,0,0,0)
  const todayDk = dateToDk(today)

  const [page,        setPage]        = useState<Page>('home')
  const [view,        setView]        = useState<'week'|'month'>('week')
  const [weekOffset,  setWeekOffset]  = useState(0)
  const [selDi,       setSelDi]       = useState(() => today.getDay() === 0 ? 6 : today.getDay() - 1)
  const [monthView,   setMonthView]   = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [checked,     setChecked]     = useState<Checked>({})
  const [weights,     setWeights]     = useState<Weights>({})
  const [scores,      setScores]      = useState<Scores>({})
  const [wtInput,     setWtInput]     = useState('')
  const [customTasks, setCustomTasks] = useState<CustomTask[]>(() => {
    try { const s = localStorage.getItem('hos-custom-tasks'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [showEditor,  setShowEditor]  = useState(false)
  const [activeHabits, setActiveHabits] = useState<Habit[]>(() => {
    try { const s = localStorage.getItem('hos-habits'); return s ? JSON.parse(s).filter((h:Habit)=>h.active) : [] } catch { return [] }
  })
  const [checkedMeals, setCheckedMeals] = useState<Record<string,boolean>>(() => {
    try { const s = localStorage.getItem('hos-checked-meals'); return s ? JSON.parse(s) : {} } catch { return {} }
  })
  const [editingTask, setEditingTask] = useState<CustomTask | null>(null)
  const [syncStatus,  setSyncStatus]  = useState<'loading'|'ok'|'error'>('loading')
  const [clock,       setClock]       = useState('')
  const nextRef = useRef<HTMLDivElement>(null)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id)
  }, [])

  // ── Load history ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const lc = localStorage.getItem('hos-ck'), lw = localStorage.getItem('hos-wt')
    if (lc) setChecked(JSON.parse(lc))
    if (lw) setWeights(JSON.parse(lw))

    fetch('/api/daily-log?limit=365')
      .then(r => r.json())
      .then((rows: any[]) => {
        if (!Array.isArray(rows)) { setSyncStatus('error'); return }
        const ck2: Checked = {}, wt2: Weights = {}, sc2: Scores = {}
        rows.forEach(r => {
          if (!r.date) return
          try {
            const ids = r.completed_tasks || []
            if (ids.length > 0) ck2[r.date] = Object.fromEntries(ids.map((id: string) => [id, true]))
          } catch {}
          if (r.weight_kg) wt2[r.date] = r.weight_kg
          if (r.score)     sc2[r.date] = r.score
        })
        setChecked(prev => {
          const localToday = prev[todayDk]
          const merged = { ...ck2 }
          if (localToday && Object.keys(localToday).length > Object.keys(ck2[todayDk] || {}).length) merged[todayDk] = localToday
          localStorage.setItem('hos-ck', JSON.stringify(merged))
          return merged
        })
        setWeights(() => { localStorage.setItem('hos-wt', JSON.stringify(wt2)); return wt2 })
        setScores(sc2)
        setSyncStatus('ok')
      })
      .catch(() => setSyncStatus('error'))
  }, [])

  // ── Selected date ─────────────────────────────────────────────────────────────
  const curWeekMon  = weekStart(today)
  const viewWeekMon = new Date(curWeekMon); viewWeekMon.setDate(curWeekMon.getDate() + weekOffset * 7)
  const selDate     = new Date(viewWeekMon); selDate.setDate(viewWeekMon.getDate() + selDi)
  const selDk       = dateToDk(selDate)
  const isToday     = selDk === todayDk
  const dtype       = getDayType(selDate)
  const pal         = PAL[dtype] || PAL.rest
  const tasks       = getTasksForDate(selDate, checked, customTasks as any)
  const groups      = buildGroups(tasks, selDate, checked)
  const ckDay       = checked[selDk] || {}
  const totalPts    = tasks.reduce((s, t) => s + t.pts, 0)
  const earnedPts   = tasks.filter(t => ckDay[t.id]).reduce((s, t) => s + t.pts, 0)
  const score       = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 0
  const nowMin      = new Date().getHours() * 60 + new Date().getMinutes()

  const nextGroup = isToday ? groups.find(g => {
    const u = g.tasks.some(t => !ckDay[t.id]) || (g.bk && !ckDay[g.bk.id])
    return u && toMin(g.time) >= nowMin - 25
  }) : undefined
  const pastGroups     = isToday ? groups.filter(g => toMin(g.time) < nowMin - 15) : []
  const upcomingGroups = groups.filter(g => !pastGroups.includes(g))

  useEffect(() => {
    if (nextRef.current && page === 'home') {
      setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
    }
  }, [selDi, weekOffset, syncStatus, page])

  // ── Save ──────────────────────────────────────────────────────────────────────
  const saveToSupabase = useCallback((dateKey: string, ck2: Record<string,boolean>, wt: number | null, date: Date) => {
    const ts   = getTasksForDate(date, checked)
    const ids  = Object.entries(ck2).filter(([, v]) => v).map(([k]) => k)
    const tp   = ts.reduce((s, t) => s + t.pts, 0)
    const ep   = ts.filter(t => ck2[t.id]).reduce((s, t) => s + t.pts, 0)
    const sc   = tp > 0 ? Math.round((ep / tp) * 100) : 0
    const dt   = getDayType(date)
    const wkDone = ['strength','badminton','mobility','walk'].some(id => ck2[id])
    const payload: any = { date: dateKey, completed_tasks: ids, score: sc, day_type: dt, task_total: tp, task_done: ids.length, workout_done: wkDone, left_on_time: !!ck2['leave'] }
    if (wt !== null) payload.weight_kg = wt
    if (saveTimers.current[dateKey]) clearTimeout(saveTimers.current[dateKey])
    saveTimers.current[dateKey] = setTimeout(() => {
      setSyncStatus('loading')
      fetch('/api/daily-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(() => { setSyncStatus('ok'); setScores(prev => ({ ...prev, [dateKey]: sc })) })
        .catch(() => setSyncStatus('error'))
    }, 1200)
  }, [checked])

  // ── Toggle task ───────────────────────────────────────────────────────────────
  const toggleTask = useCallback((taskId: string) => {
    const was  = !!(checked[selDk] || {})[taskId]
    const next: Checked = { ...checked, [selDk]: { ...(checked[selDk] || {}), [taskId]: !was } }
    setChecked(next)
    localStorage.setItem('hos-ck', JSON.stringify(next))
    const ck2 = next[selDk] || {}
    saveToSupabase(selDk, ck2, weights[selDk] ?? null, selDate)
    const now  = new Date()
    const ep   = tasks.filter(t => ck2[t.id]).reduce((s, t) => s + t.pts, 0)
    const tp   = tasks.reduce((s, t) => s + t.pts, 0)
    const task = tasks.find(t => t.id === taskId)
    fetch('/api/task-events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateToIso(selDate), timestamp: now.toISOString(), hour: now.getHours(), task_id: taskId, category: task?.cat || '', score_at_event: tp > 0 ? Math.round((ep/tp)*100) : 0, day_type: dtype, action: was ? 'uncheck' : 'check' })
    }).catch(() => {})
  }, [checked, selDk, selDate, tasks, dtype, weights, saveToSupabase])

  // ── Log weight ────────────────────────────────────────────────────────────────
  const logWeight = useCallback(() => {
    const val = parseFloat(wtInput)
    if (isNaN(val) || val < 30 || val > 250) return
    const next = { ...weights, [selDk]: val }
    setWeights(next); setWtInput('')
    localStorage.setItem('hos-wt', JSON.stringify(next))
    saveToSupabase(selDk, checked[selDk] || {}, val, selDate)
  }, [wtInput, weights, selDk, selDate, checked, saveToSupabase])

  // ── Score for any date ────────────────────────────────────────────────────────
  function toggleMeal(id: string, meal: MealOption) {
    const next = { ...checkedMeals, [id]: !checkedMeals[id] }
    setCheckedMeals(next)
    localStorage.setItem('hos-checked-meals', JSON.stringify(next))
  }

  function scoreForDate(date: Date): number {
    const d = dateToDk(date), t = getTasksForDate(date, checked, customTasks as any), c = checked[d] || {}
    const tp = t.reduce((s, t) => s + t.pts, 0), ep = t.filter(t => c[t.id]).reduce((s, t) => s + t.pts, 0)
    if (Object.keys(c).length > 0) return tp > 0 ? Math.round((ep / tp) * 100) : 0
    return scores[d] || 0
  }

  function handleSaveTask(task: CustomTask) {
    const next = customTasks.some(t => t.id === task.id)
      ? customTasks.map(t => t.id === task.id ? task : t)
      : [...customTasks, task]
    setCustomTasks(next)
    localStorage.setItem('hos-custom-tasks', JSON.stringify(next))
  }

  function handleDeleteTask(taskId: string, removeAll: boolean) {
    if (removeAll) {
      const next = customTasks.filter(t => t.id !== taskId)
      setCustomTasks(next)
      localStorage.setItem('hos-custom-tasks', JSON.stringify(next))
    } else {
      // Mark as today-only deleted by removing from today
      const next = customTasks.map(t => t.id === taskId ? { ...t, days: `skip:${selDk}` } : t)
      setCustomTasks(next)
      localStorage.setItem('hos-custom-tasks', JSON.stringify(next))
    }
  }

  const weekLabel = (() => {
    if (weekOffset === 0) return 'This week'
    if (weekOffset === -1) return 'Last week'
    const sun = new Date(viewWeekMon); sun.setDate(viewWeekMon.getDate() + 6)
    return `${MONTHS[viewWeekMon.getMonth()]} ${viewWeekMon.getDate()} – ${MONTHS[sun.getMonth()]} ${sun.getDate()}`
  })()

  function gotoDate(y: number, m: number, d: number) {
    const date = new Date(y, m, d)
    const di   = date.getDay() === 0 ? 6 : date.getDay() - 1
    const wOff = Math.round((weekStart(date).getTime() - weekStart(today).getTime()) / (7 * 86400000))
    setWeekOffset(wOff); setSelDi(di); setView('week')
  }

  const { y: mY, m: mM } = monthView
  const daysInMonth  = new Date(mY, mM + 1, 0).getDate()
  const monthStartDi = (() => { const d = new Date(mY, mM, 1).getDay(); return d === 0 ? 6 : d - 1 })()

  // ── ScoreCard analytics ───────────────────────────────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(viewWeekMon); d.setDate(viewWeekMon.getDate() + i); return d })
  const weekScores = weekDays.map(d => scoreForDate(d)).filter(s => s > 0)
  const weekAvg = weekScores.length ? Math.round(weekScores.reduce((a,b)=>a+b,0)/weekScores.length) : 0
  let streak = 0
  for (let i = 0; i < 30; i++) { const d = new Date(today); d.setDate(today.getDate() - i); if (scoreForDate(d) >= 60) streak++; else break }
  const workoutDone  = ['strength','badminton','mobility','walk'].some(id => ckDay[id])
  const isWeekday    = selDate.getDay() !== 0 && selDate.getDay() !== 6
  const leftOnTime   = isWeekday ? !!ckDay['leave'] : null
  const bestDayScore = Math.max(...weekScores, 0)
  const bestDay      = bestDayScore > 0 ? DAYS[weekDays.findIndex(d => scoreForDate(d) === bestDayScore)] : '—'

  // ── NAV TABS ─────────────────────────────────────────────────────────────────
  const navTabs: { id: Page; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home', label: 'Home',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    {
      id: 'dashboard', label: 'Stats',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    },
    {
      id: 'habits', label: 'Habits',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    },
    {
      id: 'diet', label: 'Diet',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
    },
  ]

  return (
    <div style={{ background: page === 'home' ? pal.bg : '#F8FAFC', minHeight: '100vh', transition: 'background 0.3s' }}>
      <Header
        title={page === 'home' ? `${isToday ? 'Today — ' : ''}${DAY_FULL[selDi]}` : page === 'dashboard' ? 'Dashboard' : page === 'habits' ? 'Habit Challenges' : 'Diet & Nutrition'}
        date={selDate} dtype={dtype} clock={clock} syncStatus={syncStatus} accent={pal.a}
      />

      <main className="max-w-lg mx-auto px-4">

        {/* ── HOME TAB ── */}
        {page === 'home' && (
          <>
            {/* View toggle + week nav */}
            <div className="flex gap-2 mt-4 items-center">
              {(['week','month'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className="px-4 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ border: view===v ? `2px solid ${pal.a}` : '1px solid #E5E7EB', background: view===v ? pal.s : '#fff', color: view===v ? pal.a : '#9CA3AF' }}>
                  {v.charAt(0).toUpperCase()+v.slice(1)}
                </button>
              ))}
              <div className="flex-1"/>
              {view === 'week' ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeekOffset(w => w - 1)} className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center text-sm">‹</button>
                  <span className="mono text-xs text-gray-500 font-medium min-w-[90px] text-center">{weekLabel}</span>
                  <button onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} disabled={weekOffset === 0} className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center text-sm disabled:opacity-30">›</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setMonthView(({ y, m }) => { const d = new Date(y,m-1,1); return {y:d.getFullYear(),m:d.getMonth()} })} className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center text-sm">‹</button>
                  <span className="mono text-xs text-gray-500 font-medium min-w-[72px] text-center">{MONTH_FULL[mM].slice(0,3)} {mY}</span>
                  <button onClick={() => setMonthView(({ y, m }) => { const d = new Date(y,m+1,1); return {y:d.getFullYear(),m:d.getMonth()} })} className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center text-sm">›</button>
                </div>
              )}
            </div>

            {view === 'week' ? (
              <>
                {/* Day tabs */}
                <div className="flex gap-1 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
                  {DAYS.map((d, i) => {
                    const date = new Date(viewWeekMon); date.setDate(viewWeekMon.getDate() + i)
                    const ws = scoreForDate(date), dt = getDayType(date), dc = PAL[dt] || PAL.rest
                    const isSel = i === selDi, isTd = dateToDk(date) === todayDk
                    return (
                      <button key={d} onClick={() => setSelDi(i)} className="flex-none px-2 py-2 rounded-xl text-center min-w-[50px] transition-all"
                        style={{ border: isSel ? `2px solid ${dc.a}` : '1px solid #E5E7EB', background: isSel ? dc.s : '#fff', color: isSel ? dc.a : '#9CA3AF' }}>
                        <div className="mono text-[9px] font-bold" style={{ color: isTd ? dc.a : isSel ? dc.a : '#9CA3AF' }}>{d}</div>
                        <div className="mono text-[9px] mt-0.5" style={{ color: isTd ? dc.a : '#9CA3AF' }}>{date.getDate()}</div>
                        <div className="text-xs mt-0.5">{dc === PAL.strength ? '⚡' : dc === PAL.badminton ? '🏸' : dc === PAL.mobility ? '🧘' : dc === PAL.saturday ? '🏡' : '🌿'}</div>
                        {ws > 0 && <div className="mono text-[8px] font-bold mt-0.5" style={{ color: dc.a }}>{ws}%</div>}
                      </button>
                    )
                  })}
                </div>

                {/* Score card */}
                <ScoreCard
                  score={score} earned={earnedPts} total={totalPts}
                  done={tasks.filter(t=>ckDay[t.id]).length} taskCount={tasks.length}
                  weight={weights[selDk]} wtInput={wtInput} onWtInput={setWtInput}
                  onLogWt={logWeight}
                  onClearWt={() => { const n={...weights}; delete n[selDk]; setWeights(n); localStorage.setItem('hos-wt',JSON.stringify(n)) }}
                  accent={pal.a} border={pal.b}
                  streak={streak} weekAvg={weekAvg} bestDay={bestDay}
                  workoutDone={workoutDone} leftOnTime={leftOnTime}
                />

                {/* Active Habits Widget */}
                <ActiveHabitsWidget
                  habits={activeHabits}
                  accent={pal.a}
                  onNavigate={() => setPage('habits')}
                />

                {/* Past pills */}
                {pastGroups.length > 0 && <PastPills groups={pastGroups} ckDay={ckDay} accent={pal.a} onToggle={toggleTask}/>}

                {/* Next up banner */}
                {nextGroup && (
                  <div className="rounded-xl px-4 py-3 flex items-center gap-3 my-3 border" style={{ background: pal.s+'99', borderColor: pal.a+'40' }}>
                    <span className="text-2xl">{nextGroup.icon}</span>
                    <div className="flex-1">
                      <div className="mono text-[9px] font-bold uppercase tracking-wider" style={{ color: pal.a }}>
                        next up · {(() => { const [h,m]=nextGroup.time.split(':').map(Number); return `${h%12||12}:${m<10?'0':''}${m} ${h>=12?'PM':'AM'}` })()}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-0.5">{nextGroup.lbl}</div>
                    </div>
                    <div className="mono text-xs font-bold" style={{ color: pal.a }}>+{nextGroup.tasks.reduce((s,t)=>s+t.pts,0)}pt</div>
                  </div>
                )}

                {/* Task groups */}
                <div className="mt-3 flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-400 font-medium">Tasks</div>
                  <button onClick={() => { setEditingTask(null); setShowEditor(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-none transition-all"
                    style={{ background: pal.s, color: pal.a }}>
                    <span className="text-base leading-none">+</span> Add task
                  </button>
                </div>
                <div className="mt-1">
                  {upcomingGroups.map(g => {
                    const isNext = nextGroup?.gid === g.gid
                    const isPast = isToday && toMin(g.time) < nowMin - 15
                    const isCustomGroup = g.tasks.some(t => (t as any).custom)
                    const isWindDown    = g.gid === 'wind_down'
                    return (
                      <div key={g.gid} ref={isNext ? nextRef : undefined} className="relative group/card">
                        {isWindDown
                          ? <WindDownCard group={g} ckDay={ckDay} accent={pal.a} soft={pal.s} border={pal.b} onToggle={toggleTask}/>
                          : g.isMed
                          ? <MedCard group={g} ckDay={ckDay} pal={pal} onToggle={toggleTask}/>
                          : <GroupCard group={g} ckDay={ckDay} pal={pal} isNext={isNext} isPast={isPast} onToggle={toggleTask} isToday={isToday}/>
                        }
                        {isCustomGroup && (
                          <button
                            onClick={() => { const ct = g.tasks.find(t=>(t as any).custom) as CustomTask; if(ct){setEditingTask(ct);setShowEditor(true)} }}
                            className="absolute top-2 right-10 opacity-0 group-hover/card:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-[10px] cursor-pointer z-10">
                            ✏️
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {tasks.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-2">✨</div>
                      <div className="text-sm font-medium">Loading tasks...</div>
                    </div>
                  )}
                </div>

                {/* Protein Tracker */}
                <ProteinTracker
                  accent={pal.a}
                  checkedMeals={checkedMeals}
                  onToggleMeal={toggleMeal}
                />

                {/* Quick Tasks / Laundry List */}
                <QuickTasks
                  todayDk={todayDk}
                  selDk={selDk}
                  accent={pal.a}
                  soft={pal.s}
                />
              </>
            ) : (
              /* Month grid */
              <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-center text-sm font-semibold mb-3">{MONTH_FULL[mM]} {mY}</div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className="text-center text-[9px] font-bold text-gray-400 mono">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(monthStartDi).fill(null).map((_,i) => <div key={'e'+i}/>)}
                  {Array(daysInMonth).fill(null).map((_,i) => {
                    const dn = i+1, date = new Date(mY,mM,dn), ddkk = dateToDk(date)
                    const sc = scoreForDate(date), isTd = ddkk === todayDk, isSel = ddkk === selDk
                    const ww = weights[ddkk], c = scoreColor(sc), isFut = date > today
                    return (
                      <div key={dn} onClick={() => !isFut && gotoDate(mY,mM,dn)}
                        className="aspect-square rounded-lg flex flex-col items-center justify-center gap-[1px] transition-all"
                        style={{ border: isSel?`2px solid ${pal.a}`:isTd?'2px solid #9CA3AF':'1px solid #F1F5F9', background: isFut?'#FAFAFA':sc>0?c+'18':'#FAFAFA', opacity: isFut?.35:1, cursor: isFut?'default':'pointer' }}>
                        <div className="mono text-[10px] font-medium" style={{ color: isTd?pal.a:sc>0?c:'#9CA3AF', fontWeight: isTd?700:500 }}>{dn}</div>
                        {sc > 0 && <div className="mono text-[7px] font-bold leading-none" style={{ color: c }}>{sc}%</div>}
                        {ww && <div className="text-[6px] text-gray-400 leading-none">{ww}kg</div>}
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 justify-center flex-wrap">
                  {[['#10B981','≥80%'],['#F59E0B','≥50%'],['#EF4444','<50%'],['#E5E7EB','No data']].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: c }}/><span className="text-[9px] text-gray-400">{l}</span></div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── DASHBOARD TAB ── */}
        {page === 'dashboard' && <DashboardTab accent={pal.a}/>}

        {/* ── DIET TAB ── */}
        {page === 'diet' && <DietTab/>}

        {/* ── HABITS TAB ── */}
        {page === 'habits' && (
          <HabitsTab
            accent={pal.a}
            onActiveHabits={setActiveHabits}
          />
        )}

      </main>

      {/* ── BOTTOM NAV ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
        {navTabs.map(tab => (
          <button key={tab.id} onClick={() => setPage(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[9px] font-bold uppercase tracking-wider transition-colors border-none bg-transparent"
            style={{ color: page === tab.id ? pal.a : '#9CA3AF' }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Editor Modal */}
      {showEditor && (
        <TaskEditor
          editingTask={editingTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => { setShowEditor(false); setEditingTask(null) }}
          todayDk={todayDk}
        />
      )}
    </div>
  )
}
