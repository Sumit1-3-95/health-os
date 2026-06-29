import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/daily-log?limit=365
export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') || '365'
  const { data, error } = await supabase
    .from('daily_log')
    .select('*')
    .order('date', { ascending: false })
    .limit(Number(limit))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/daily-log — upsert by date
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date, ...rest } = body
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const { data, error } = await supabase
    .from('daily_log')
    .upsert({ date, ...rest, updated_at: new Date().toISOString() }, { onConflict: 'date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
