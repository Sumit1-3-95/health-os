export type Task = {
  id: string
  label: string
  icon: string
  time: string
  cat: string
  pts: number
  days: string        // 'all' | 'Mon,Thu' | etc
  gid: string
  glabel: string
  gicon: string
  order: number
  note?: string
  co?: string         // 'sun_carryover' if carries to Sunday
  lockedAfter?: string // 'HH:MM' — cannot check after this time (today only)
}

export const TASKS: Task[] = [
  // ── MORNING ──────────────────────────────────────────────────────────────────
  { id:'wake',      label:'Wake up by 7 AM',      icon:'☀️',  time:'07:00', cat:'morning',    pts:3,  days:'all',                 gid:'morning_start', glabel:'Rise & Fuel',         gicon:'🌅', order:1,  note:'Only checkable before 7:15 AM.', lockedAfter:'07:15' },

  // ── WORKOUT ──────────────────────────────────────────────────────────────────
  { id:'strength',  label:'Strength training',    icon:'🏋️', time:'07:30', cat:'workout',    pts:15, days:'Mon,Thu',               gid:'workout',       glabel:'Strength Session',    gicon:'⚡', order:2,  note:'Squats x3, Push-ups x3, Lunges x3, Rows x3, Plank x3. 60s rest.' },
  { id:'badminton', label:'Badminton session',    icon:'🏸',  time:'07:30', cat:'workout',    pts:15, days:'Tue,Fri,Sat',           gid:'workout',       glabel:'Badminton',           gicon:'🏸', order:2,  note:'5-min dynamic warmup first. 7:30–8:30 AM.' },
  { id:'mobility',  label:'Yoga & mobility',      icon:'🧘',  time:'07:30', cat:'workout',    pts:12, days:'Wed',                   gid:'workout',       glabel:'Mobility Flow',       gicon:'🧘', order:2,  note:'30 min · Hips, hamstrings, thoracic. YouTube: Yoga with Adriene.' },
  { id:'walk',      label:'Family morning walk',  icon:'👨‍👩‍👧', time:'07:30', cat:'workout',    pts:8,  days:'Sun',                   gid:'workout',       glabel:'Family Walk',         gicon:'🌿', order:2,  note:'20–30 min with family.' },

  // ── MORNING SUPPLEMENTS ───────────────────────────────────────────────────────
  { id:'brekfast',  label:'Breakfast',            icon:'🥣',  time:'08:45', cat:'nutrition',  pts:4,  days:'all',                   gid:'morning_meds',  glabel:'Morning Supplements', gicon:'💊', order:3,  note:'Moong dal chilla x3 + curd OR oats + milk + PB + banana.' },
  { id:'multi',     label:'Multivitamin (HK)',    icon:'💊',  time:'08:50', cat:'supplements',pts:4,  days:'all',                   gid:'morning_meds',  glabel:'Morning Supplements', gicon:'💊', order:4,  note:'HK Vitals multivitamin. 1 tablet with breakfast — fat-soluble vitamins need food.' },
  { id:'neurobion', label:'Neurobion (B+B12)',    icon:'🧬',  time:'08:52', cat:'supplements',pts:4,  days:'all',                   gid:'morning_meds',  glabel:'Morning Supplements', gicon:'💊', order:5,  note:'Neurobion B-complex + B12. Take with breakfast for morning energy metabolism.' },
  { id:'protein',   label:'Protein shake',        icon:'🥛',  time:'09:00', cat:'supplements',pts:5,  days:'all',                   gid:'morning_meds',  glabel:'Morning Supplements', gicon:'💊', order:6,  note:'1 scoop whey in 300ml milk (~20g protein). Best within 45 min post-workout.' },

  // ── LUNCH SUPPLEMENTS ─────────────────────────────────────────────────────────
  { id:'omega',     label:'Fish Oil (HK)',        icon:'🐟',  time:'13:10', cat:'supplements',pts:4,  days:'all',                   gid:'lunch_supps',   glabel:'Lunch Supplements',   gicon:'🐟', order:7,  note:'HK Vitals Fish Oil (180mg EPA + 120mg DHA). Take with lunch — fatty food prevents fishy burps.' },

  // ── WATER ─────────────────────────────────────────────────────────────────────
  { id:'water_morn',label:'Water — morning (1L)', icon:'💧',  time:'10:00', cat:'hydration',  pts:3,  days:'all',                   gid:'water_track',   glabel:'Water Tracker',       gicon:'💧', order:7,  note:'1 litre by 10 AM.' },
  { id:'water_aft', label:'Water — afternoon (1L)',icon:'💧', time:'15:00', cat:'hydration',  pts:3,  days:'all',                   gid:'water_track',   glabel:'Water Tracker',       gicon:'💧', order:8,  note:'Another litre by 3 PM.' },
  { id:'water_eve', label:'Water — evening (1L)', icon:'💧',  time:'19:00', cat:'hydration',  pts:3,  days:'all',                   gid:'water_track',   glabel:'Water Tracker',       gicon:'💧', order:9,  note:'Final litre by 7 PM. Total = 3L+.' },

  // ── OFFICE ────────────────────────────────────────────────────────────────────
  { id:'leave',     label:'Leave office by 6 PM', icon:'🚗',  time:'18:00', cat:'discipline', pts:8,  days:'Mon,Tue,Wed,Thu,Fri',   gid:'leave_office',  glabel:'Leave Office',        gicon:'🏠', order:10, note:'Close laptop. Out the door. 20 min travel.' },

  // ── EVENING ───────────────────────────────────────────────────────────────────
  { id:'walk_mira', label:'Walk with Mira',       icon:'🚶',  time:'20:00', cat:'recovery',   pts:6,  days:'all',                   gid:'evening_walk',  glabel:'Evening & Mira',      gicon:'🌙', order:11, note:'8:00–8:30 PM walk in the colony. No phone.' },
  { id:'mira_sleep',label:'Mira to sleep by 9',  icon:'🌙',  time:'20:30', cat:'recovery',   pts:5,  days:'all',                   gid:'evening_walk',  glabel:'Evening & Mira',      gicon:'🌙', order:12, note:'Bedtime routine done. Mira asleep by 9 PM.' },

  // ── PNC BLOCK ─────────────────────────────────────────────────────────────────
  { id:'pnc_focus', label:'PNC — Deep Focus',     icon:'🎯',  time:'21:00', cat:'discipline', pts:8,  days:'all',                   gid:'pnc_block',     glabel:'PNC Block',           gicon:'🧠', order:13, note:'Pick ONE: Apply for jobs | Write articles | Build AI product.' },

  // ── WIND DOWN (10 PM) ─────────────────────────────────────────────────────────
  { id:'wd_brush',  label:'Brush teeth',          icon:'🦷',  time:'22:00', cat:'recovery',   pts:3,  days:'all',                   gid:'wind_down',     glabel:'Wind Down',           gicon:'🌙', order:14, note:'2 min. Non-negotiable before bed.' },
  { id:'wd_read',   label:'Read',                 icon:'📖',  time:'22:05', cat:'recovery',   pts:5,  days:'all',                   gid:'wind_down',     glabel:'Wind Down',           gicon:'🌙', order:15, note:'20–30 min. Physical book preferred. No screens.' },
  { id:'wd_walk',   label:'Night walk (optional)',icon:'🌙',  time:'22:10', cat:'recovery',   pts:4,  days:'all',                   gid:'wind_down',     glabel:'Wind Down',           gicon:'🌙', order:16, note:'5–10 min gentle walk. Helps wind down cortisol.' },
  { id:'wd_bath',   label:'Bath / shower',        icon:'🚿',  time:'22:15', cat:'recovery',   pts:3,  days:'all',                   gid:'wind_down',     glabel:'Wind Down',           gicon:'🌙', order:17, note:'Warm shower. Body temperature drop helps sleep onset.' },
  { id:'magnesium', label:'Magnesium Glycinate',  icon:'💊',  time:'22:20', cat:'supplements',pts:4,  days:'all',                   gid:'wind_down',     glabel:'Wind Down',           gicon:'🌙', order:18, note:'HK Vitals Magnesium Glycinate. Take 30–45 min before sleep. Best form for sleep quality.' },
  { id:'sleep',     label:'In bed by 11 PM',      icon:'😴',  time:'23:00', cat:'recovery',   pts:6,  days:'all',                   gid:'wind_down',     glabel:'Wind Down',           gicon:'🌙', order:19, note:'Consistent bedtime matters most.' },

  // ── HEALTH LOG ────────────────────────────────────────────────────────────────
  { id:'log_health',label:'Log steps & calories', icon:'📊',  time:'22:00', cat:'tracking',   pts:3,  days:'all',                   gid:'health_log',    glabel:'Health Log',          gicon:'⌚', order:16, note:'Run the Health OS shortcut on your iPhone to sync Apple Watch data.' },

  // ── SATURDAY CHORES ───────────────────────────────────────────────────────────
  { id:'laundry',   label:'Laundry + iron clothes',icon:'👕', time:'09:00', cat:'household',  pts:6,  days:'Sat',                   gid:'sat_chores',    glabel:'Saturday Chores',     gicon:'🏡', order:2,  note:'Start laundry first, iron while it runs.', co:'sun_carryover' },
  { id:'iron',      label:'Clothes ironed',        icon:'👔', time:'10:00', cat:'household',  pts:4,  days:'Sat',                   gid:'sat_chores',    glabel:'Saturday Chores',     gicon:'🏡', order:3,  note:'All clothes ironed and put away.', co:'sun_carryover' },
  { id:'carwash',   label:'Car cleaning',          icon:'🚗', time:'10:30', cat:'household',  pts:5,  days:'Sat',                   gid:'sat_chores',    glabel:'Saturday Chores',     gicon:'🏡', order:4,  note:'Exterior wash + interior wipe. Done by 11 AM.', co:'sun_carryover' },
]

export const DAYS     = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
export const DAY_FULL = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
export const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const DAY_TYPE: Record<string,string> = { Mon:'strength',Tue:'badminton',Wed:'mobility',Thu:'strength',Fri:'badminton',Sat:'saturday',Sun:'rest' }
export const DAY_ICON: Record<string,string> = { strength:'⚡',badminton:'🏸',mobility:'🧘',rest:'🌿',saturday:'🏡' }
export const PAL: Record<string,{a:string,s:string,b:string,bg:string}> = {
  strength: {a:'#6C63FF',s:'#EEF0FF',b:'#D4D1FF',bg:'#F8F8FF'},
  badminton:{a:'#10B981',s:'#ECFDF5',b:'#A7F3D0',bg:'#F0FDF4'},
  mobility: {a:'#F59E0B',s:'#FFFBEB',b:'#FDE68A',bg:'#FEFCE8'},
  rest:     {a:'#3B82F6',s:'#EFF6FF',b:'#BFDBFE',bg:'#F0F9FF'},
  saturday: {a:'#EC4899',s:'#FDF2F8',b:'#FBCFE8',bg:'#FFF0F7'},
}
export const CAT_COL: Record<string,string> = {
  morning:'#F59E0B', nutrition:'#10B981', supplements:'#8B5CF6',
  workout:'#EF4444', hydration:'#3B82F6', discipline:'#EC4899',
  recovery:'#6366F1', tracking:'#6B7280', household:'#14B8A6',
}

export function getDayType(date: Date): string {
  const di = date.getDay() === 0 ? 6 : date.getDay() - 1
  return DAY_TYPE[DAYS[di]] || 'rest'
}

export function getTasksForDate(date: Date, checkedMap: Record<string, Record<string,boolean>>, customTasks: Task[] = []): Task[] {
  const di    = date.getDay() === 0 ? 6 : date.getDay() - 1
  const day   = DAYS[di]
  const isSun = di === 6
  const dateDk = dateToDk(date)
  let missed: string[] = []

  if (isSun) {
    const sat = new Date(date); sat.setDate(sat.getDate() - 1)
    const satKey = dateToDk(sat)
    const satCk  = checkedMap[satKey] || {}
    missed = TASKS.filter(t => t.co === 'sun_carryover').filter(t => !satCk[t.id]).map(t => t.id)
  }

  const allTasks = [...TASKS, ...customTasks]

  return allTasks.filter(t => {
    const d = (t.days || '')
    // today-only custom task
    if (d.startsWith('today:')) return d === `today:${dateDk}`
    const days = d.split(',').map(s => s.trim())
    if (days.includes('all') || days.includes(day)) return true
    if (isSun && t.co === 'sun_carryover' && missed.includes(t.id)) return true
    return false
  }).sort((a, b) => (a.order || 0) - (b.order || 0))
}

export type Group = {
  gid: string
  lbl: string
  icon: string
  cat: string
  time: string
  tasks: Task[]
  bk?: Task
  isMed?: boolean
  isCo?: boolean
}

export function buildGroups(tasks: Task[], date: Date, checkedMap: Record<string, Record<string,boolean>>, _customTasks: Task[] = []): Group[] {
  const di    = date.getDay() === 0 ? 6 : date.getDay() - 1
  const isSun = di === 6
  let coLabel: string | null = null

  if (isSun) {
    const sat = new Date(date); sat.setDate(sat.getDate() - 1)
    const satCk = checkedMap[dateToDk(sat)] || {}
    const co = tasks.filter(t => t.co === 'sun_carryover')
    if (co.length > 0) coLabel = 'Carried from Saturday'
  }

  const map: Record<string, Group> = {}
  const order: string[] = []

  tasks.forEach(t => {
    const g = t.gid || t.id
    if (!map[g]) {
      map[g] = { gid: g, lbl: t.glabel || g, icon: t.gicon || t.icon, cat: t.cat, time: t.time, tasks: [], isCo: t.co === 'sun_carryover' }
      order.push(g)
    }
    if (g === 'morning_meds' && t.id === 'brekfast') { map[g].bk = t; map[g].isMed = true }
    else if (g === 'morning_meds' && (t.id === 'multi' || t.id === 'protein')) { map[g].isMed = true; map[g].tasks.push(t) }
    else map[g].tasks.push(t)
  })

  const groups = order.map(g => map[g]).filter(g => g.tasks.length > 0 || g.bk)
  groups.sort((a, b) => toMin(a.time) - toMin(b.time))
  if (coLabel) { const cg = groups.find(g => g.isCo); if (cg) cg.lbl = coLabel + ' 🔄' }
  return groups
}

// ── Date utils ────────────────────────────────────────────────────────────────
export function dateToDk(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}
export function dateToIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
export function toMin(t: string): number {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
export function scoreColor(s: number): string {
  if (s >= 80) return '#10B981'
  if (s >= 50) return '#F59E0B'
  if (s > 0)   return '#EF4444'
  return '#E5E7EB'
}
export function weekStart(date: Date): Date {
  const d = new Date(date), day = d.getDay(), diff = d.getDate() - (day === 0 ? 6 : day - 1)
  d.setDate(diff); d.setHours(0, 0, 0, 0)
  return d
}
