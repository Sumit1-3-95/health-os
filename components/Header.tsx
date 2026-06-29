'use client'
import { MONTHS, DAY_ICON } from '@/lib/tasks'

type Props = {
  title: string
  date: Date
  dtype: string
  clock: string
  syncStatus: 'loading'|'ok'|'error'
  accent: string
}

export default function Header({ title, date, dtype, clock, syncStatus, accent }: Props) {
  const syncEl =
    syncStatus === 'ok'      ? <span style={{ color: '#10B981' }}>● live</span> :
    syncStatus === 'loading' ? <span style={{ color: '#F59E0B' }}>◌ saving...</span> :
                               <span style={{ color: '#9CA3AF' }}>● local</span>

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <div className="mono text-[9px] text-gray-400 uppercase tracking-widest">Health OS · Sumit</div>
          <div className="text-[15px] font-semibold text-gray-900 mt-0.5">
            {title}
            <span className="text-[10px] text-gray-400 font-normal ml-2">
              {date.getDate()} {MONTHS[date.getMonth()]} {date.getFullYear()}
            </span>
            <span className="text-[10px] font-medium ml-2" style={{ color: accent }}>
              {DAY_ICON[dtype]} {dtype}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-lg font-semibold" style={{ color: accent }}>{clock}</div>
          <div className="mono text-[9px] mt-0.5">{syncEl}</div>
        </div>
      </div>
    </div>
  )
}
