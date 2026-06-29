'use client'
import { useState } from 'react'

type FoodItem = {
  name: string
  protein: number   // per 100g or per serving
  serving: string
  cal: number
  category: string
  emoji: string
  tip?: string
}

const FOODS: FoodItem[] = [
  // Dairy
  { name:'Paneer',        protein:18, serving:'100g',  cal:265, category:'dairy',    emoji:'🧀', tip:'Best post-workout. Grill or add to sabzi.' },
  { name:'Greek Yogurt',  protein:10, serving:'100g',  cal:59,  category:'dairy',    emoji:'🥛', tip:'Mid-morning snack. Add berries.' },
  { name:'Low-fat Curd',  protein:11, serving:'200g',  cal:120, category:'dairy',    emoji:'🍶', tip:'With every meal. Gut health + protein.' },
  { name:'Skimmed Milk',  protein:10, serving:'300ml', cal:100, category:'dairy',    emoji:'🥛', tip:'Protein shake base. Adds 10g protein.' },
  { name:'Cottage Cheese',protein:11, serving:'100g',  cal:72,  category:'dairy',    emoji:'🧀', tip:'Light, high protein. Good before bed.' },

  // Legumes
  { name:'Moong Dal',     protein:24, serving:'100g dry', cal:340, category:'legumes', emoji:'🫘', tip:'Easiest to digest. Great for chilla.' },
  { name:'Rajma',         protein:22, serving:'100g dry', cal:333, category:'legumes', emoji:'🫘', tip:'Complete amino acid profile. Lunch staple.' },
  { name:'Chana (Black)', protein:19, serving:'100g dry', cal:364, category:'legumes', emoji:'🫘', tip:'Roast for a snack. Great fibre too.' },
  { name:'Chana (White)', protein:20, serving:'100g dry', cal:378, category:'legumes', emoji:'🫘', tip:'Chole. High satiety.' },
  { name:'Lentils (Masur)',protein:26,serving:'100g dry', cal:353, category:'legumes', emoji:'🫘', tip:'Highest protein lentil. Dal tadka base.' },
  { name:'Soybean',       protein:36, serving:'100g dry', cal:446, category:'legumes', emoji:'🫘', tip:'Highest plant protein. Soy chunks or tofu.' },

  // Soy
  { name:'Tofu (firm)',   protein:17, serving:'100g',  cal:144, category:'soy',      emoji:'🟨', tip:'Marinate and grill. Replaces paneer well.' },
  { name:'Soy Chunks',    protein:52, serving:'100g dry',cal:345,category:'soy',     emoji:'🟨', tip:'Best protein-to-cal ratio. Meal prep.' },
  { name:'Edamame',       protein:11, serving:'100g',  cal:122, category:'soy',      emoji:'🟩', tip:'Steam and eat as snack.' },

  // Grains
  { name:'Quinoa',        protein:14, serving:'100g dry',cal:368,category:'grains',  emoji:'🌾', tip:'Complete protein. Replace rice sometimes.' },
  { name:'Oats',          protein:17, serving:'100g dry',cal:389,category:'grains',  emoji:'🌾', tip:'Breakfast base. Keeps you full longer.' },
  { name:'Amaranth',      protein:14, serving:'100g dry',cal:371,category:'grains',  emoji:'🌾', tip:'Complete amino acids. Rajgira.' },

  // Nuts & seeds
  { name:'Peanut Butter', protein:25, serving:'100g',  cal:588, category:'nuts',     emoji:'🥜', tip:'2 tbsp = 8g protein. Breakfast or snack.' },
  { name:'Almonds',       protein:21, serving:'100g',  cal:579, category:'nuts',     emoji:'🌰', tip:'5–6 soaked daily. Magnesium + protein.' },
  { name:'Hemp Seeds',    protein:31, serving:'100g',  cal:553, category:'nuts',     emoji:'🌱', tip:'Add to smoothies or curd. Complete protein.' },
  { name:'Pumpkin Seeds', protein:19, serving:'100g',  cal:446, category:'nuts',     emoji:'🌱', tip:'Zinc + magnesium + protein. Great snack.' },
  { name:'Chia Seeds',    protein:17, serving:'100g',  cal:486, category:'nuts',     emoji:'🌱', tip:'Add to water or overnight oats.' },

  // Protein supplement
  { name:'Whey Protein',  protein:80, serving:'1 scoop (30g)', cal:120, category:'supplement', emoji:'🥛', tip:'Your 22g per scoop in milk. Post-workout.' },
]

const CATEGORIES = ['all','dairy','legumes','soy','grains','nuts','supplement']
const CAT_LABELS: Record<string,string> = { all:'All', dairy:'Dairy 🧀', legumes:'Legumes 🫘', soy:'Soy 🟨', grains:'Grains 🌾', nuts:'Nuts & Seeds 🌰', supplement:'Supplements 🥛' }

export default function DietTab() {
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<'protein'|'cal'>('protein')
  const [search, setSearch] = useState('')

  const filtered = FOODS
    .filter(f => cat === 'all' || f.category === cat)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'protein' ? b.protein - a.protein : a.cal - b.cal)

  // Daily protein planner numbers
  const target = 95
  const sources = [
    { food:'Whey shake in milk', protein:22 },
    { food:'Curd (200g)', protein:11 },
    { food:'Rajma / Dal (1 bowl)', protein:14 },
    { food:'Paneer (75g)', protein:13 },
    { food:'2 roti + sabzi', protein:8 },
    { food:'Snacks (chana/nuts)', protein:7 },
  ]
  const total = sources.reduce((s, x) => s + x.protein, 0)

  return (
    <div className="mt-4 pb-4">

      {/* Daily protein planner */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Daily Protein Plan — Target {target}g</div>
        {sources.map(s => (
          <div key={s.food} className="flex items-center py-1.5 border-b border-gray-50 last:border-0">
            <div className="text-[12px] text-gray-700 flex-1">{s.food}</div>
            <div className="bg-green-50 rounded-full px-2 py-0.5 mono text-[11px] font-bold text-green-600">{s.protein}g</div>
          </div>
        ))}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-medium">Total daily</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(100, Math.round((total/target)*100))}%` }}/>
            </div>
            <div className="mono text-sm font-bold text-green-600">{total}g <span className="text-gray-400 font-normal text-[10px]">/ {target}g</span></div>
          </div>
        </div>
      </div>

      {/* Quick tip */}
      <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-100 mb-3">
        <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">💡 Vegetarian tip</div>
        <div className="text-[11px] text-green-800 leading-relaxed">
          Combine legumes + grains in the same meal (dal + roti, rajma + rice) to get a complete amino acid profile. As a no-egg veg, this is your biggest lever after whey.
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search foods..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none"/>
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-400 text-sm bg-none border-none cursor-pointer">✕</button>}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className="flex-none px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all"
            style={{ border: cat===c ? '2px solid #10B981' : '1px solid #E5E7EB', background: cat===c ? '#ECFDF5' : '#fff', color: cat===c ? '#065F46' : '#9CA3AF' }}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-gray-400 font-medium">Sort by</span>
        {(['protein','cal'] as const).map(s => (
          <button key={s} onClick={() => setSort(s)}
            className="px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
            style={{ border: sort===s ? '2px solid #10B981' : '1px solid #E5E7EB', background: sort===s ? '#ECFDF5' : '#fff', color: sort===s ? '#065F46' : '#9CA3AF' }}>
            {s === 'protein' ? '↓ Protein' : '↓ Calories'}
          </button>
        ))}
      </div>

      {/* Food list */}
      <div className="space-y-2">
        {filtered.map(f => (
          <div key={f.name} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{f.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-gray-800">{f.name}</div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="bg-green-50 rounded-full px-2 py-0.5">
                      <span className="mono text-[11px] font-bold text-green-600">{f.protein}g</span>
                      <span className="text-[9px] text-green-400"> protein</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{f.serving} · {f.cal} kcal</div>
                {f.tip && <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">{f.tip}</div>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No foods found</div>
        )}
      </div>
    </div>
  )
}
