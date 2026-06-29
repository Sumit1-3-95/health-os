'use client'
import { useState } from 'react'

export type MealOption = {
  id: string
  name: string
  protein: number
  calories: number
  category: 'lunch' | 'dinner' | 'snack' | 'breakfast'
  emoji: string
  custom?: boolean
}

const DEFAULT_MEALS: MealOption[] = [
  // Whey shakes (2x daily - auto counted)
  { id:'whey_am',    name:'Whey shake (morning)',  protein:20, calories:160, category:'breakfast', emoji:'🥛' },
  { id:'whey_pm',    name:'Whey shake (post WO)',  protein:20, calories:160, category:'snack',     emoji:'🥛' },
  // Lunch
  { id:'paneer_sal', name:'Paneer salad',          protein:18, calories:220, category:'lunch',     emoji:'🥗' },
  { id:'chick_sal',  name:'Chickpea salad',        protein:14, calories:280, category:'lunch',     emoji:'🫘' },
  // Dinner
  { id:'pan_roll',   name:'Paneer roll',           protein:20, calories:380, category:'dinner',    emoji:'🌯' },
  { id:'tofu_stir',  name:'Tofu stir fry',         protein:16, calories:260, category:'dinner',    emoji:'🥡' },
  { id:'chick_curr', name:'Chickpea curry',        protein:14, calories:320, category:'dinner',    emoji:'🍛' },
]

const DAILY_TARGET_PROTEIN  = 95   // grams
const DAILY_TARGET_CALORIES = 2000 // kcal

type Props = {
  accent: string
  checkedMeals: Record<string, boolean>
  onToggleMeal: (id: string, meal: MealOption) => void
}

export default function ProteinTracker({ accent, checkedMeals, onToggleMeal }: Props) {
  const [meals, setMeals] = useState<MealOption[]>(() => {
    try { const s = localStorage.getItem('hos-meals'); return s ? JSON.parse(s) : DEFAULT_MEALS } catch { return DEFAULT_MEALS }
  })
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newProtein, setNewProtein] = useState(15)
  const [newCals, setNewCals] = useState(250)
  const [newCat, setNewCat] = useState<MealOption['category']>('lunch')
  const [newEmoji, setNewEmoji] = useState('🥗')
  const [activeTab, setActiveTab] = useState<'breakfast'|'lunch'|'dinner'|'snack'>('lunch')

  function saveMeals(next: MealOption[]) {
    setMeals(next); localStorage.setItem('hos-meals', JSON.stringify(next))
  }

  function addMeal() {
    if (!newName.trim()) return
    const meal: MealOption = { id:`meal_${Date.now()}`, name:newName.trim(), protein:newProtein, calories:newCals, category:newCat, emoji:newEmoji, custom:true }
    saveMeals([...meals, meal])
    setNewName(''); setNewProtein(15); setNewCals(250); setShowAdd(false)
  }

  function deleteMeal(id: string) {
    saveMeals(meals.filter(m => m.id !== id))
    if (checkedMeals[id]) onToggleMeal(id, meals.find(m=>m.id===id)!)
  }

  // Compute totals from checked meals
  const checkedMealObjs = meals.filter(m => checkedMeals[m.id])
  const totalProtein  = checkedMealObjs.reduce((s,m)=>s+m.protein,0)
  const totalCalories = checkedMealObjs.reduce((s,m)=>s+m.calories,0)
  const proteinPct    = Math.min(100, Math.round((totalProtein/DAILY_TARGET_PROTEIN)*100))
  const caloriePct    = Math.min(100, Math.round((totalCalories/DAILY_TARGET_CALORIES)*100))

  const proteinEmoji  = proteinPct>=100?'🏆':proteinPct>=75?'💪':proteinPct>=50?'⚡':'🌱'
  const proteinLabel  = proteinPct>=100?'Target hit!':proteinPct>=75?'Almost there':proteinPct>=50?'Good progress':'Keep going'

  const filteredMeals = meals.filter(m => m.category === activeTab)

  const MEAL_EMOJIS = ['🥗','🫘','🌯','🥡','🍛','🥣','🥩','🐟','🧀','🥚','🥜','🥦','🍱','🫕','🥘']

  const catColors: Record<string,string> = { breakfast:'#F59E0B', lunch:'#10B981', dinner:'#6C63FF', snack:'#EC4899' }

  return (
    <div className="bg-white rounded-2xl overflow-hidden mb-2.5 shadow-sm border border-gray-100">

      {/* Header with gamified progress */}
      <div className="px-4 pt-3 pb-2" style={{ background: `linear-gradient(135deg, ${accent}12, ${accent}05)` }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Protein Tracker</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl">{proteinEmoji}</span>
              <div>
                <span className="mono text-lg font-bold" style={{ color: accent }}>{totalProtein}g</span>
                <span className="text-xs text-gray-400"> / {DAILY_TARGET_PROTEIN}g · {proteinLabel}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 mb-0.5">Calories</div>
            <div className="mono text-sm font-bold text-gray-600">{totalCalories}<span className="text-xs font-normal text-gray-400"> / {DAILY_TARGET_CALORIES}</span></div>
          </div>
        </div>

        {/* Protein bar */}
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] text-gray-400 font-medium">Protein</span>
              <span className="text-[9px] font-bold" style={{ color: accent }}>{proteinPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width:`${proteinPct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-white opacity-20 rounded-full" style={{ width:'30%', left:'-10%' }}/>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] text-gray-400 font-medium">Calories</span>
              <span className="text-[9px] font-bold text-orange-500">{caloriePct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width:`${caloriePct}%`, background:'#F97316' }}/>
            </div>
          </div>
        </div>

        {/* Milestone badges */}
        <div className="flex gap-1.5 mt-2">
          {[25,50,75,100].map(m => (
            <div key={m} className="flex-1 py-0.5 rounded-full text-center text-[8px] font-bold transition-all"
              style={{ background: proteinPct>=m ? accent : '#F1F5F9', color: proteinPct>=m ? '#fff' : '#CBD5E1' }}>
              {m}%
            </div>
          ))}
        </div>
      </div>

      {/* Meal tabs */}
      <div className="flex border-b border-gray-100">
        {(['breakfast','lunch','dinner','snack'] as const).map(t => {
          const mealCount = meals.filter(m=>m.category===t).length
          const doneCount = meals.filter(m=>m.category===t&&checkedMeals[m.id]).length
          return (
            <button key={t} onClick={()=>setActiveTab(t)}
              className="flex-1 py-2 text-[10px] font-semibold capitalize transition-all border-none cursor-pointer border-b-2"
              style={{ borderBottom: activeTab===t?`2px solid ${catColors[t]}`:'2px solid transparent', color: activeTab===t?catColors[t]:'#9CA3AF', background:'transparent' }}>
              {t === 'breakfast' ? '🌅' : t === 'lunch' ? '☀️' : t === 'dinner' ? '🌙' : '🍎'}
              {doneCount > 0 && <span className="ml-1 mono text-[8px]">{doneCount}/{mealCount}</span>}
            </button>
          )
        })}
      </div>

      {/* Meal chips */}
      <div className="px-4 py-3">
        {filteredMeals.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-400">No meals for this slot yet</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredMeals.map(meal => {
              const checked = !!checkedMeals[meal.id]
              const col = catColors[meal.category]
              return (
                <div key={meal.id} className="group/chip relative">
                  <button onClick={() => onToggleMeal(meal.id, meal)}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all cursor-pointer border-2"
                    style={{
                      border: checked ? `2px solid ${col}` : '2px solid #F1F5F9',
                      background: checked ? col+'18' : '#FAFAFA',
                    }}>
                    <span className="text-base">{meal.emoji}</span>
                    <div className="text-left">
                      <div className="text-[11px] font-semibold" style={{ color: checked?col:'#374151' }}>{meal.name}</div>
                      <div className="mono text-[9px] text-gray-400">
                        <span style={{ color: checked?col:'#9CA3AF', fontWeight:600 }}>{meal.protein}g</span> protein · {meal.calories} cal
                      </div>
                    </div>
                    {checked && <span className="text-[10px]">✓</span>}
                  </button>
                  {/* Delete button on hover (custom meals only) */}
                  {meal.custom && (
                    <button onClick={() => deleteMeal(meal.id)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity border-none cursor-pointer z-10">
                      ✕
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add meal button */}
        {!showAdd ? (
          <button onClick={()=>{setNewCat(activeTab);setShowAdd(true)}}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold border-none bg-transparent cursor-pointer"
            style={{ color: catColors[activeTab] }}>
            <span className="text-base">+</span> Add meal
          </button>
        ) : (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">New meal</div>

            {/* Emoji + name */}
            <div className="flex gap-2 mb-2">
              <select value={newEmoji} onChange={e=>setNewEmoji(e.target.value)}
                className="w-10 bg-white border border-gray-200 rounded-lg text-center text-sm outline-none cursor-pointer">
                {MEAL_EMOJIS.map(e=><option key={e} value={e}>{e}</option>)}
              </select>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Meal name..."
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400"/>
            </div>

            {/* Protein + calories */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-[9px] text-gray-400 mb-1">Protein (g)</div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                  <button onClick={()=>setNewProtein(p=>Math.max(0,p-1))} className="text-gray-400 border-none bg-transparent cursor-pointer">−</button>
                  <span className="mono text-xs font-bold text-gray-700 flex-1 text-center">{newProtein}</span>
                  <button onClick={()=>setNewProtein(p=>p+1)} className="text-gray-400 border-none bg-transparent cursor-pointer">+</button>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 mb-1">Calories</div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                  <button onClick={()=>setNewCals(c=>Math.max(0,c-10))} className="text-gray-400 border-none bg-transparent cursor-pointer">−</button>
                  <span className="mono text-xs font-bold text-gray-700 flex-1 text-center">{newCals}</span>
                  <button onClick={()=>setNewCals(c=>c+10)} className="text-gray-400 border-none bg-transparent cursor-pointer">+</button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex gap-1.5 mb-3">
              {(['breakfast','lunch','dinner','snack'] as const).map(c=>(
                <button key={c} onClick={()=>setNewCat(c)}
                  className="flex-1 py-1 rounded-lg text-[9px] font-semibold capitalize cursor-pointer border-2 transition-all"
                  style={{ border:newCat===c?`2px solid ${catColors[c]}`:'2px solid #F1F5F9', background:newCat===c?catColors[c]+'18':'#fff', color:newCat===c?catColors[c]:'#9CA3AF' }}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={addMeal} disabled={!newName.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white border-none cursor-pointer"
                style={{ background: newName.trim() ? catColors[activeTab] : '#E5E7EB' }}>
                Add meal
              </button>
              <button onClick={()=>setShowAdd(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-gray-100 border-none cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
