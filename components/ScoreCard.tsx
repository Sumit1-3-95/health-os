'use client'
import { useState } from 'react'

type Props = {
  score: number
  earned: number
  total: number
  done: number
  taskCount: number
  weight?: number
  wtInput: string
  onWtInput: (v: string) => void
  onLogWt: () => void
  onClearWt: () => void
  accent: string
  border: string
  // Analytics props
  streak: number
  weekAvg: number
  bestDay: string
  workoutDone: boolean
  leftOnTime: boolean | null  // null = not a weekday
}

export default function ScoreCard({
  score, earned, total, done, taskCount,
  weight, wtInput, onWtInput, onLogWt, onClearWt,
  accent, border, streak, weekAvg, bestDay, workoutDone, leftOnTime,
}: Props) {
  const [showWtInput, setShowWtInput] = useState(false)
  const C = 2 * Math.PI * 25
  const offset = C * (1 - score / 100)

  const scoreLabel =
    score >= 80 ? '🔥 On fire' :
    score >= 60 ? '👊 Solid day' :
    score >= 40 ? '⚡ Getting there' :
    score > 0   ? '🌱 Just started' : "Let's go!"

  const pct = taskCount > 0 ? Math.round((done / taskCount) * 100) : 0

  return (
    <div className="mt-3 rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${border}`, boxShadow: `0 2px 12px ${accent}15` }}>

      {/* ── TOP ROW: score ring + key stats ── */}
      <div className="bg-white px-4 py-3 flex items-center gap-4">
        {/* Ring */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="25" fill="none" stroke="#F1F5F9" strokeWidth="5"/>
            <circle cx="32" cy="32" r="25" fill="none" stroke={accent} strokeWidth="5"
              strokeDasharray={String(C)} strokeDashoffset={String(offset)} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset .5s' }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="mono font-bold leading-none" style={{ fontSize: 15, color: accent }}>{score}</span>
            <span className="text-[8px] text-gray-400 leading-none mt-0.5">score</span>
          </div>
        </div>

        {/* Centre: label + task ratio bar */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-gray-900">{scoreLabel}</div>

          {/* Task completion bar */}
          <div className="mt-1.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400 font-medium">Tasks</span>
              <span className="mono text-[10px] font-bold" style={{ color: accent }}>{done}/{taskCount}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: accent }}/>
            </div>
          </div>

          {/* Pts */}
          <div className="text-[10px] text-gray-400 mt-1">{earned} of {total} pts earned today</div>
        </div>

        {/* Weight — always visible, prominent */}
        <div className="flex-shrink-0 text-right">
          <div className="mono text-[9px] text-gray-400 font-medium tracking-wider mb-1">⚖️ WEIGHT</div>
          {weight && !showWtInput ? (
            <div>
              <div className="mono font-bold" style={{ fontSize: 18, color: accent }}>
                {weight}<span className="text-[9px] text-gray-400 font-normal">kg</span>
              </div>
              <button onClick={() => setShowWtInput(true)}
                className="text-[8px] text-gray-300 bg-transparent border-none cursor-pointer mt-0.5 block w-full text-right">
                edit
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <input
                type="number" step="0.1" placeholder="kg" value={wtInput}
                autoFocus={showWtInput}
                onChange={e => onWtInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onLogWt(); setShowWtInput(false) } }}
                className="w-14 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] mono text-gray-700 outline-none text-center"/>
              <div className="flex gap-1">
                <button onClick={() => { onLogWt(); setShowWtInput(false) }}
                  className="flex-1 rounded-lg py-1 text-[10px] font-semibold text-white border-none cursor-pointer" style={{ background: accent }}>✓</button>
                {weight && <button onClick={() => setShowWtInput(false)}
                  className="flex-1 rounded-lg py-1 text-[10px] font-semibold text-gray-400 bg-gray-100 border-none cursor-pointer">✕</button>}
              </div>
            </div>
          )}
          {!weight && !showWtInput && (
            <button onClick={() => setShowWtInput(true)}
              className="text-[10px] font-medium border-none cursor-pointer rounded-lg px-2 py-1 mt-0.5"
              style={{ color: accent, background: accent+'15' }}>
              + log
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW: analytics chips ── */}
      <div className="grid grid-cols-4 divide-x divide-gray-100" style={{ background: accent+'08', borderTop: `1px solid ${border}` }}>
        {/* Streak */}
        <div className="px-2 py-2 text-center">
          <div className="text-base leading-none">{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱'}</div>
          <div className="mono font-bold text-[13px] mt-0.5" style={{ color: accent }}>{streak}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">day streak</div>
        </div>

        {/* Week avg */}
        <div className="px-2 py-2 text-center">
          <div className="text-base leading-none">📊</div>
          <div className="mono font-bold text-[13px] mt-0.5" style={{ color: accent }}>{weekAvg}%</div>
          <div className="text-[9px] text-gray-400 mt-0.5">week avg</div>
        </div>

        {/* Workout today */}
        <div className="px-2 py-2 text-center">
          <div className="text-base leading-none">{workoutDone ? '✅' : '○'}</div>
          <div className="mono font-bold text-[13px] mt-0.5" style={{ color: workoutDone ? '#10B981' : '#D1D5DB' }}>
            {workoutDone ? 'Done' : 'Not yet'}
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5">workout</div>
        </div>

        {/* Left on time — only on weekdays */}
        <div className="px-2 py-2 text-center">
          {leftOnTime === null ? (
            <>
              <div className="text-base leading-none">🏖️</div>
              <div className="mono font-bold text-[13px] mt-0.5 text-gray-300">—</div>
              <div className="text-[9px] text-gray-400 mt-0.5">weekend</div>
            </>
          ) : (
            <>
              <div className="text-base leading-none">{leftOnTime ? '🏠' : '⏰'}</div>
              <div className="mono font-bold text-[13px] mt-0.5" style={{ color: leftOnTime ? '#10B981' : '#F59E0B' }}>
                {leftOnTime ? '6 PM' : 'TBD'}
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5">office exit</div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
