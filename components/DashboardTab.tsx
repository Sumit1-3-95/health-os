'use client'
import { useEffect, useState } from 'react'

type Metric = {
  date: string
  steps: number | null
  active_calories: number | null
  exercise_minutes: number | null
  resting_heart_rate: number | null
  sleep_hours: number | null
  stand_hours: number | null
  weight_kg: number | null
}

type DailyScore = { date: string; score: number }

type Props = { accent: string }

const GOALS = {
  steps: 10000,
  active_calories: 600,
  exercise_minutes: 30,
  sleep_hours: 7,
  stand_hours: 12,
}

function last(arr: number[]) { return arr.length ? arr[arr.length - 1] : null }
function avg(arr: number[]) { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0 }
function pct(val: number, goal: number) { return Math.min(100, Math.round((val / goal) * 100)) }

type ChartProps = {
  data: { date: string; value: number | null }[]
  color: string
  goal?: number
  unit: string
  height?: number
}

function SparkLine({ data, color, goal, unit, height = 56 }: ChartProps) {
  const valid = data.filter(d => d.value != null) as { date: string; value: number }[]
  if (valid.length < 2) return <div style={{ height }} className="flex items-center justify-center text-xs text-gray-300">Not enough data yet</div>

  const vals = valid.map(d => d.value)
  const min = Math.min(...vals) * 0.9
  const max = goal ? Math.max(Math.max(...vals), goal) * 1.05 : Math.max(...vals) * 1.1
  const range = max - min || 1
  const w = 100 / data.length

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {/* Goal line */}
      {goal && (
        <line
          x1="0" y1={height - ((goal - min) / range) * height}
          x2="100" y2={height - ((goal - min) / range) * height}
          stroke={color} strokeWidth="0.5" strokeDasharray="2,1" opacity="0.4"/>
      )}
      {/* Area */}
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      {valid.length > 1 && (
        <polyline
          fill={`url(#g-${color.replace('#','')})`}
          stroke="none"
          points={[
            ...valid.map((d, i) => {
              const xi = data.findIndex(dd => dd.date === d.date)
              const x = (xi + 0.5) * w
              const y = height - ((d.value - min) / range) * (height - 4) - 2
              return `${x},${y}`
            }),
            `${(data.findIndex(d => d.date === valid[valid.length-1].date) + 0.5) * w},${height}`,
            `${(data.findIndex(d => d.date === valid[0].date) + 0.5) * w},${height}`,
          ].join(' ')}
        />
      )}
      {/* Line */}
      <polyline
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        points={valid.map((d, i) => {
          const xi = data.findIndex(dd => dd.date === d.date)
          const x = (xi + 0.5) * w
          const y = height - ((d.value - min) / range) * (height - 4) - 2
          return `${x},${y}`
        }).join(' ')}
      />
      {/* Last point dot */}
      {valid.length > 0 && (() => {
        const d = valid[valid.length - 1]
        const xi = data.findIndex(dd => dd.date === d.date)
        const x = (xi + 0.5) * w
        const y = height - ((d.value - min) / range) * (height - 4) - 2
        return <circle cx={x} cy={y} r="2" fill={color} stroke="white" strokeWidth="1"/>
      })()}
    </svg>
  )
}

function RingProgress({ value, goal, color, size = 56 }: { value: number; goal: number; color: string; size?: number }) {
  const p = pct(value, goal)
  const r = (size - 8) / 2
  const C = 2 * Math.PI * r
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={String(C)} strokeDashoffset={String(C * (1 - p / 100))} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .5s' }}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="mono text-[10px] font-bold" style={{ color }}>{p}%</span>
      </div>
    </div>
  )
}

export default function DashboardTab({ accent }: Props) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'today'|'week'|'month'>('week')

  useEffect(() => {
    fetch('/api/health-metrics?days=90')
      .then(r => r.json())
      .then(d => { setMetrics(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="text-3xl mb-3">📊</div>
      <div className="text-sm font-medium">Loading metrics...</div>
    </div>
  )

  if (metrics.length === 0) return (
    <div className="mt-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
        <div className="text-4xl mb-3">⌚</div>
        <div className="text-sm font-semibold text-gray-700 mb-2">No Apple Watch data yet</div>
        <div className="text-xs text-gray-400 leading-relaxed mb-4">
          Run the Health OS shortcut on your iPhone to sync your Apple Watch data. It takes 10 seconds.
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Setup steps</div>
          <div className="space-y-2">
            {['Install the Apple Shortcut (link below)', 'Open Shortcuts app → tap Health OS Sync', 'Data appears here instantly'].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[9px] font-bold" style={{ background: accent }}>{i+1}</div>
                <div className="text-[11px] text-gray-600">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Prepare data slices
  const today = new Date().toISOString().slice(0,10)
  const todayM = metrics.find(m => m.date === today)

  const sliceMap = { today: 1, week: 7, month: 30 }
  const slice = metrics.slice(-sliceMap[tab])

  const steps     = slice.map(m => ({ date: m.date, value: m.steps }))
  const cals      = slice.map(m => ({ date: m.date, value: m.active_calories }))
  const exMin     = slice.map(m => ({ date: m.date, value: m.exercise_minutes }))
  const hr        = slice.map(m => ({ date: m.date, value: m.resting_heart_rate }))
  const sleep     = slice.map(m => ({ date: m.date, value: m.sleep_hours }))
  const weight    = slice.map(m => ({ date: m.date, value: m.weight_kg }))

  const stepsVals  = steps.filter(d=>d.value!=null).map(d=>d.value!) 
  const calsVals   = cals.filter(d=>d.value!=null).map(d=>d.value!)
  const sleepVals  = sleep.filter(d=>d.value!=null).map(d=>d.value!)
  const wtVals     = weight.filter(d=>d.value!=null).map(d=>d.value!)

  // KPI strip for today
  const todayKpis = [
    { label:'Steps', val: todayM?.steps?.toLocaleString() ?? '—', goal: GOALS.steps, raw: todayM?.steps ?? 0, color:'#10B981', icon:'👟' },
    { label:'Calories', val: todayM?.active_calories ? `${todayM.active_calories} cal` : '—', goal: GOALS.active_calories, raw: todayM?.active_calories ?? 0, color:'#F97316', icon:'🔥' },
    { label:'Exercise', val: todayM?.exercise_minutes ? `${todayM.exercise_minutes}m` : '—', goal: GOALS.exercise_minutes, raw: todayM?.exercise_minutes ?? 0, color:'#6C63FF', icon:'⚡' },
    { label:'Sleep', val: todayM?.sleep_hours ? `${todayM.sleep_hours}h` : '—', goal: GOALS.sleep_hours, raw: todayM?.sleep_hours ?? 0, color:'#3B82F6', icon:'😴' },
  ]

  const charts = [
    { key:'steps',    label:'Steps',              data:steps,  color:'#10B981', unit:'steps', goal:GOALS.steps },
    { key:'cals',     label:'Active Calories',    data:cals,   color:'#F97316', unit:'cal',   goal:GOALS.active_calories },
    { key:'ex',       label:'Exercise Minutes',   data:exMin,  color:'#6C63FF', unit:'min',   goal:GOALS.exercise_minutes },
    { key:'sleep',    label:'Sleep',              data:sleep,  color:'#3B82F6', unit:'hrs',   goal:GOALS.sleep_hours },
    { key:'hr',       label:'Resting Heart Rate', data:hr,     color:'#EF4444', unit:'bpm' },
    { key:'weight',   label:'Weight',             data:weight, color:'#8B5CF6', unit:'kg' },
  ]

  return (
    <div className="mt-4 pb-4">

      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        {(['today','week','month'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
            style={{ border: tab===t ? `2px solid ${accent}` : '1px solid #E5E7EB', background: tab===t ? accent : '#fff', color: tab===t ? '#fff' : '#9CA3AF' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Today rings */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Today's Rings</div>
        <div className="grid grid-cols-4 gap-2">
          {todayKpis.map(k => (
            <div key={k.label} className="flex flex-col items-center gap-1.5">
              <RingProgress value={k.raw} goal={k.goal} color={k.color} size={52}/>
              <div className="text-center">
                <div className="text-[10px] font-bold" style={{ color: k.raw > 0 ? k.color : '#9CA3AF' }}>{k.val}</div>
                <div className="text-[8px] text-gray-400">{k.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Averages strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label:'Avg steps', val: avg(stepsVals).toLocaleString(), color:'#10B981', icon:'👟' },
          { label:'Avg sleep', val: `${(sleepVals.length ? (sleepVals.reduce((a,b)=>a+b,0)/sleepVals.length).toFixed(1) : '—')}h`, color:'#3B82F6', icon:'😴' },
          { label:'Avg cals', val: `${avg(calsVals)} cal`, color:'#F97316', icon:'🔥' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <div className="text-base mb-0.5">{k.icon}</div>
            <div className="mono font-bold text-sm" style={{ color: k.color }}>{k.val}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Trend charts */}
      {charts.map(c => {
        const validVals = c.data.filter(d=>d.value!=null).map(d=>d.value!)
        if (validVals.length === 0) return null
        const latest = last(validVals), avg_ = avg(validVals)
        const trend = validVals.length >= 2 ? validVals[validVals.length-1] - validVals[validVals.length-2] : 0
        return (
          <div key={c.key} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</div>
                <div className="mono font-bold text-xl mt-0.5" style={{ color: c.color }}>
                  {c.key === 'weight' ? `${latest?.toFixed(1)} ${c.unit}` :
                   c.key === 'sleep'  ? `${latest?.toFixed(1)} ${c.unit}` :
                   c.key === 'hr'     ? `${latest} ${c.unit}` :
                   `${latest?.toLocaleString()} ${c.unit}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-gray-400 mb-0.5">avg ({tab})</div>
                <div className="mono text-xs font-medium text-gray-600">{c.key==='weight'||c.key==='sleep'||c.key==='hr' ? avg_.toFixed(1) : avg_.toLocaleString()} {c.unit}</div>
                {trend !== 0 && (
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: trend > 0 ? (c.key==='hr'||c.key==='weight'?'#EF4444':'#10B981') : (c.key==='hr'||c.key==='weight'?'#10B981':'#EF4444') }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(c.key==='weight'||c.key==='sleep'||c.key==='hr'?1:0)}
                  </div>
                )}
              </div>
            </div>
            <SparkLine data={c.data as any} color={c.color} goal={c.goal} unit={c.unit}/>
            {c.goal && (
              <div className="flex items-center justify-between mt-2">
                <div className="text-[9px] text-gray-400">Goal: {c.goal.toLocaleString()} {c.unit}</div>
                <div className="text-[9px] font-semibold" style={{ color: c.color }}>
                  {latest ? pct(latest, c.goal) : 0}% of goal
                </div>
              </div>
            )}
          </div>
        )
      })}

    </div>
  )
}
