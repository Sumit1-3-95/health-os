import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/health-metrics?days=30
export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get('days') || '90')
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .order('date', { ascending: true })
    .limit(days)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/health-metrics — upsert by date (called by Apple Shortcut)
export async function POST(req: NextRequest) {
  // Accept both JSON and plain text from Shortcuts
  let body: any = {}
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const text = await req.text()
    try { body = JSON.parse(text) } catch { body = {} }
  }

  const {
    date,
    steps,
    active_calories,
    exercise_minutes,
    resting_heart_rate,
    sleep_hours,
    stand_hours,
    weight_kg,
  } = body

  if (!date) return NextResponse.json({ error: 'date required (YYYY-MM-DD)' }, { status: 400 })

  const payload: any = { updated_at: new Date().toISOString() }
  if (steps              != null) payload.steps              = Number(steps)
  if (active_calories    != null) payload.active_calories    = Number(active_calories)
  if (exercise_minutes   != null) payload.exercise_minutes   = Number(exercise_minutes)
  if (resting_heart_rate != null) payload.resting_heart_rate = Number(resting_heart_rate)
  if (sleep_hours        != null) payload.sleep_hours        = Number(sleep_hours)
  if (stand_hours        != null) payload.stand_hours        = Number(stand_hours)
  if (weight_kg          != null) payload.weight_kg          = Number(weight_kg)

  const { data, error } = await supabase
    .from('health_metrics')
    .upsert({ date, ...payload }, { onConflict: 'date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
