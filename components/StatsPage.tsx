'use client'
import { getTasksForDate, dateToDk, scoreColor, MONTH_FULL } from '@/lib/tasks'

type Props = {
  checked: Record<string, Record<string,boolean>>
  weights: Record<string, number>
  scores:  Record<string, number>
}

export default function StatsPage({ checked, weights, scores }: Props) {
  const today = new Date(); today.setHours(0,0,0,0)

  const d30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (29 - i))
    const dk = dateToDk(d)
    const tasks = getTasksForDate(d, checked)
    const c = checked[dk] || {}
    const tp = tasks.reduce((s,t)=>s+t.pts,0), ep = tasks.filter(t=>c[t.id]).reduce((s,t)=>s+t.pts,0)
    const sc = Object.keys(c).length > 0 ? (tp > 0 ? Math.round((ep/tp)*100) : 0) : (scores[dk] || 0)
    return { date: d, dk, sc, wt: weights[dk] || null }
  })

  const withScore = d30.filter(d => d.sc > 0)
  const avg = withScore.length ? Math.round(withScore.reduce((s,d)=>s+d.sc,0) / withScore.length) : 0
  const wts = d30.filter(d => d.wt)
  const lwt = wts.length ? wts[wts.length-1].wt : null
  const fwt = wts.length ? wts[0].wt : null
  const wDelta = lwt && fwt ? Math.round((lwt - fwt) * 10) / 10 : null
  let streak = 0; for (let i = d30.length-1; i >= 0; i--) { if (d30[i].sc >= 60) streak++; else break }
  const wkdays = d30.filter(d => { const c=checked[d.dk]||{}; return ['strength','badminton','mobility','walk'].some(id=>c[id]) }).length
  const weekdays = d30.filter(d => d.date.getDay() !== 0 && d.date.getDay() !== 6)
  const onTime = weekdays.filter(d => (checked[d.dk]||{})['leave']).length
  const onTimePct = weekdays.length ? Math.round((onTime/weekdays.length)*100) : 0

  // Category breakdown
  const catT: Record<string,number> = {}, catD: Record<string,number> = {}
  d30.forEach(({ dk, date }) => {
    const t = getTasksForDate(date, checked), c = checked[dk] || {}
    t.forEach(task => { if (!task.cat) return; catT[task.cat]=(catT[task.cat]||0)+1; if(c[task.id]) catD[task.cat]=(catD[task.cat]||0)+1 })
  })
  const cats = Object.keys(catT).sort((a,b) => ((catD[b]||0)/catT[b]) - ((catD[a]||0)/catT[a]))

  const d14 = d30.slice(16)
  const maxSc = Math.max(...d14.map(d=>d.sc), 1)

  const catColors: Record<string,string> = { morning:'#F59E0B',nutrition:'#10B981',supplements:'#8B5CF6',workout:'#EF4444',hydration:'#3B82F6',discipline:'#EC4899',recovery:'#6366F1',tracking:'#6B7280',household:'#14B8A6' }

  if (withScore.length === 0) return (
    <div className="mt-4 text-center py-16 text-gray-400">
      <div className="text-4xl mb-3">📊</div>
      <div className="text-sm font-medium">No data yet</div>
      <div className="text-xs mt-2 leading-relaxed">Check off tasks daily and<br/>your stats will appear here.</div>
    </div>
  )

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 font-medium mb-4">{MONTH_FULL[today.getMonth()]} — 30 day overview</div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {[
          { label:'AVG SCORE', val:`${avg}%`, sub:'last 30 days', color: avg>=60?'#10B981':avg>=40?'#F59E0B':'#EF4444' },
          { label:'STREAK',    val:String(streak), sub:'days ≥60% in a row', color:'#6C63FF' },
          { label:'WORKOUTS',  val:String(wkdays), sub:'sessions this month', color:'#10B981' },
          { label:'WEIGHT',    val:lwt?`${lwt}kg`:'—', sub:wDelta!=null?(wDelta>0?'+':'')+wDelta+'kg (30d)':'log weight daily', color:wDelta&&wDelta<0?'#10B981':wDelta&&wDelta>0?'#EF4444':'#6B7280' },
        ].map(({ label, val, sub, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="mono text-[10px] text-gray-400 font-bold tracking-wider">{label}</div>
            <div className="mono text-[28px] font-semibold mt-1" style={{ color }}>{val}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
        <div className="mono text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-3">Score — Last 14 Days</div>
        <div className="flex items-end gap-1 h-14">
          {d14.map(d => {
            const h = d.sc > 0 ? Math.max(4, Math.round((d.sc/maxSc)*52)) : 4
            const c = scoreColor(d.sc), isTd = d.dk === dateToDk(today)
            return (
              <div key={d.dk} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="flex-1 w-full flex items-end">
                  <div className="w-full rounded-t" style={{ height: h, background: d.sc>0?c:'#F1F5F9' }}/>
                </div>
                <div className="mono text-[7px]" style={{ color: isTd?c:'#9CA3AF', fontWeight: isTd?700:400 }}>{d.date.getDate()}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weight trend */}
      {wts.length >= 2 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
          <div className="mono text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-3">Weight Trend</div>
          <div className="flex items-end gap-1 h-12">
            {wts.slice(-14).map(d => {
              const minW = Math.min(...wts.slice(-14).map(x=>x.wt!)) - 0.5
              const maxW = Math.max(...wts.slice(-14).map(x=>x.wt!)) + 0.5
              const range = maxW - minW || 1
              const h = Math.max(4, Math.round(((d.wt!-minW)/range)*44))
              return (
                <div key={d.dk} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="flex-1 w-full flex items-end">
                    <div className="w-full rounded-t" style={{ height: h, background: '#6C63FF33', borderTop: '2px solid #6C63FF' }}/>
                  </div>
                  <div className="mono text-[7px] text-gray-400">{d.wt}</div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400">{fwt}kg</span>
            <span className="text-[9px] font-semibold" style={{ color: wDelta&&wDelta<0?'#10B981':wDelta&&wDelta>0?'#EF4444':'#6B7280' }}>{wDelta!=null?(wDelta>0?'↑ +':wDelta<0?'↓ ':'')+Math.abs(wDelta)+'kg':'stable'}</span>
            <span className="text-[9px] text-gray-400">{lwt}kg</span>
          </div>
        </div>
      )}

      {/* Habit consistency */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
        <div className="mono text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-3">Habit Consistency — 30 Days</div>
        {cats.map(cat => {
          const pct = catT[cat] ? Math.round(((catD[cat]||0)/catT[cat])*100) : 0
          const col = catColors[cat] || '#6B7280'
          return (
            <div key={cat} className="flex items-center py-1.5 border-b border-gray-50 last:border-0">
              <div className="text-[12px] font-medium text-gray-700 capitalize" style={{ minWidth:90 }}>{cat}</div>
              <div className="flex-1 bg-gray-100 rounded h-2 mx-2.5 overflow-hidden">
                <div className="h-full rounded transition-all" style={{ width:`${pct}%`, background:col }}/>
              </div>
              <div className="mono text-[11px] font-semibold" style={{ color:col, minWidth:36, textAlign:'right' }}>{pct}%</div>
            </div>
          )
        })}
      </div>

      {/* Office on time */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="mono text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-3">Left Office On Time</div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="mono text-3xl font-semibold" style={{ color: onTimePct>=70?'#10B981':onTimePct>=50?'#F59E0B':'#EF4444' }}>{onTimePct}%</div>
            <div className="text-[10px] text-gray-400 mt-0.5">by 6 PM</div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-gray-600 mb-2">{onTime} of {weekdays.length} weekdays</div>
            <div className="bg-gray-100 rounded h-2 overflow-hidden">
              <div className="h-full rounded transition-all" style={{ width:`${onTimePct}%`, background: onTimePct>=70?'#10B981':onTimePct>=50?'#F59E0B':'#EF4444' }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
