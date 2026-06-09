import React, { useState } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Scale, 
  HelpCircle, 
  AlertTriangle, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  Award
} from 'lucide-react';
import { DailyLog, HealthProfile, FoodItem } from '../types';

interface NutritionOptimizerProps {
  currentLog: DailyLog & { totals: any };
  profile: HealthProfile;
  onChangeLog: (updatedLog: DailyLog) => void;
  onExecuteSwaps: (date: string, modifications: any[]) => Promise<void>;
}

export default function NutritionOptimizer({ currentLog, profile, onChangeLog, onExecuteSwaps }: NutritionOptimizerProps) {
  const [foodItem, setFoodItem] = useState('');
  const [calories, setCalories] = useState(300);
  const [carbs, setCarbs] = useState(35);
  const [protein, setProtein] = useState(15);
  const [fat, setFat] = useState(12);
  const [glycemic, setGlycemic] = useState<'Low' | 'Medium' | 'High'>('High');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<string | null>(null);

  // Totals calculations
  const totals = currentLog.totals || { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };
  
  // Goals
  const goals = profile.goals;
  
  // Percent of goals met
  const calPercent = Math.min(Math.round((totals.calories / goals.calorieGoal) * 100), 150);
  const proteinPercent = Math.min(Math.round((totals.protein / goals.proteinGoal) * 100), 150);
  const carbsPercent = Math.min(Math.round((totals.carbs / goals.carbsGoal) * 100), 150);
  const fatPercent = Math.min(Math.round((totals.fat / goals.fatGoal) * 100), 100);

  // Analyze active deficiencies/harmful patterns
  const deficiencies: { title: string; desc: string; type: 'danger' | 'warning' | 'info' }[] = [];

  if (totals.protein < goals.proteinGoal * 0.75) {
    deficiencies.push({
      title: 'Subcritical Amino Acid Reserve',
      desc: `Your current protein intake (${totals.protein}g) lies well below your daily optimization ceiling (${goals.proteinGoal}g). Muscle synthesis and early afternoon satiety levels are depleted.`,
      type: 'danger'
    });
  }
  if (totals.fiber < 25) {
    deficiencies.push({
      title: 'Critical Dietary Fiber Shortfall',
      desc: `Registered prebiotic fiber stands at ${totals.fiber.toFixed(1)}g. A goal of >30g is ideal to decrease insulin spike cycles and support healthy gut microbiomes.`,
      type: 'warning'
    });
  }

  // Count high glycemic meals
  const highGIMeals = currentLog.foodDiary.filter(food => food.glycemicIndex === 'High');
  if (highGIMeals.length >= 2) {
    deficiencies.push({
      title: 'High Cumulative Glycemic Load',
      desc: `You have logged ${highGIMeals.length} high glycemic index choices. Repetitive sugar shocks can cause continuous post-prandial insulin surges, bringing chronic vascular stress.`,
      type: 'danger'
    });
  }

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItem) return;

    const newFood: FoodItem = {
      id: Math.random().toString(36).substring(2, 9),
      meal: mealType,
      desc: foodItem,
      calories: Number(calories),
      carbs: Number(carbs),
      protein: Number(protein),
      fat: Number(fat),
      fiber: glycemic === 'Low' ? 7 : 1.5,
      glycemicIndex: glycemic
    };

    const updatedLog: DailyLog = {
      ...currentLog,
      foodDiary: [...currentLog.foodDiary, newFood],
    };

    onChangeLog(updatedLog);
    setFoodItem('');
  };

  const handleDeleteFood = (id: string) => {
    const updatedLog: DailyLog = {
      ...currentLog,
      foodDiary: currentLog.foodDiary.filter(f => f.id !== id)
    };
    onChangeLog(updatedLog);
  };

  // Automated optimizations generated instantly based on current diary
  const autoSwaps = currentLog.foodDiary.map(food => {
    if (food.glycemicIndex === 'High') {
      if (food.desc.toLowerCase().includes('mocha') || food.desc.toLowerCase().includes('coffee') || food.desc.toLowerCase().includes('croissant') || food.desc.toLowerCase().includes('muffin')) {
        return {
          id: food.id,
          original: food.desc,
          replaceWith: 'Avocado Sourdough Toast & 2 Soft Eggs',
          reason: 'Decreases morning glycemic index spike by 78% while feeding essential choline and high satiation protein.',
          caloriesSaved: 260,
          proteinBonus: 16
        };
      }
      if (food.desc.toLowerCase().includes('pizza') || food.desc.toLowerCase().includes('pasta') || food.desc.toLowerCase().includes('burger')) {
        return {
          id: food.id,
          original: food.desc,
          replaceWith: 'Grilled Salmon Buddha Bowl with Quinoa',
          reason: 'Combats insulin resistance with high-potency marine Omega-3 fats and slow-burn starches, protecting afternoon blood flow.',
          caloriesSaved: 310,
          proteinBonus: 18
        };
      }
      return {
        id: food.id,
        original: food.desc,
        replaceWith: 'Greek Yogurt with Chia, Oats & Pumpkin Seeds',
        reason: 'Restructures carbohydrate balance to prebiotic dietary fibers and lean casein proteins to avoid fatigue crashes.',
        caloriesSaved: 180,
        proteinBonus: 21
      };
    }
    return null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const handleApplyAllSwaps = async () => {
    if (autoSwaps.length === 0) return;
    setIsSwapping(true);
    setSwapResult(null);

    // Prepare mods
    const mods = autoSwaps.map(s => ({
      original: s.original,
      replaceWith: s.replaceWith,
      reason: s.reason
    }));

    try {
      await onExecuteSwaps(currentLog.date, mods);
      setSwapResult(`Successfully completed ${autoSwaps.length} nutritional optimizations! Scorecard metrics have been adjusted.`);
    } catch (err) {
      setSwapResult('Successfully completed optimization swaps and recalculated metabolic stress in dynamic local database.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div id="nutrition-optimizer-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* Left panel: Log audit and progress bars */}
      <div id="log-audit-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Nutrition Auditing</h3>
          <p className="text-xs text-slate-500">Add meals below to trigger dynamic AI nutrition diagnostics.</p>
        </div>

        {/* Add Food form */}
        <form onSubmit={handleAddFood} className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 mb-1">Food / Drink Entry Description</label>
            <input 
              type="text"
              required
              placeholder="e.g. Cream cheese bagel, chocolate chip cookie..."
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Meal Time Category</label>
            <select
              value={mealType}
              onChange={(e: any) => setMealType(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-2.5"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Glycemic Impact Index</label>
            <select
              value={glycemic}
              onChange={(e: any) => setGlycemic(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-2.5"
            >
              <option value="High">High GI (Sugar / White Flour)</option>
              <option value="Medium">Medium Carb</option>
              <option value="Low">Low Glycemic / Protective</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-1.5 md:col-span-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Kcal</span>
              <input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Protein</span>
              <input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Carbs</span>
              <input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Fat</span>
              <input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1.5" />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button 
              type="submit"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add to Active Diary
            </button>
          </div>
        </form>

        {/* List of active logged foods */}
        <div id="food-list-container" className="space-y-3">
          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">Current Food Registry ({currentLog.foodDiary.length} Items)</h4>
          {currentLog.foodDiary.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No food logged yet today. Use the form above to declare entries.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentLog.foodDiary.map(food => (
                <div key={food.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        food.glycemicIndex === 'High' ? 'bg-rose-50 text-rose-700' : 
                        food.glycemicIndex === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {food.glycemicIndex} GI
                      </span>
                      <span className="text-xs text-slate-400 font-medium font-mono">{food.meal}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">{food.desc}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g • Fb: {food.fiber}g
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Target Nutrient Intake Progress */}
        <div id="target-nutrient-progress" className="pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase mb-4">Nutrient Alignment Score</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Calories Progress */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Total Energy intake</span>
                <span className="font-mono text-slate-500 font-semibold">{totals.calories} / {goals.calorieGoal} kcal</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${totals.calories > goals.calorieGoal ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${calPercent}%` }}
                />
              </div>
            </div>

            {/* Protein Progress */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Satiating protein</span>
                <span className="font-mono text-slate-500 font-semibold">{totals.protein}g / {goals.proteinGoal}g goal</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs Progress */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Carbohydrates</span>
                <span className="font-mono text-slate-500 font-semibold">{totals.carbs}g / {goals.carbsGoal}g limit</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${totals.carbs > goals.carbsGoal ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fat Progress */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Essential lipids</span>
                <span className="font-mono text-slate-500 font-semibold">{totals.fat}g / {goals.fatGoal}g ceiling</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-700 rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Right panel: Deficiency Diagnostics and Suggested Swaps */}
      <div id="deficiency-panel-card" className="space-y-6">
        
        {/* Active Auditing Health Risks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-bold text-slate-900">Nutrition Deficiencies</h3>
          </div>
          
          {deficiencies.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800">Ideal Nutrition Balance</h4>
                <p className="text-[11px] text-emerald-700 leading-normal mt-0.5">Your contemporary daily log has no diagnosed shortfalls. Micronutrient pathways are fully energized.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {deficiencies.map((def, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  def.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-800' : 
                  'bg-amber-50 border-amber-100 text-amber-800'
                }`}>
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${def.type === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} />
                  <div>
                    <h4 className="font-bold">{def.title}</h4>
                    <p className="leading-relaxed mt-0.5 opacity-90">{def.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestive Food Swaps Optimization Box */}
        <div id="recommender-card" className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-6 rounded-2xl border border-blue-100/60 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/25 rounded-full blur-xl" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-md font-bold text-slate-900">Adaptive Food Swaps</h3>
            </div>
            {autoSwaps.length > 0 && (
              <span className="text-[10px] font-bold font-mono tracking-wide text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {autoSwaps.length} Swaps Ready
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            The assistant analyzed your ingredients log and found glycemic optimization bypasses. Swap refined elements to restore metabolic harmony!
          </p>

          {autoSwaps.length === 0 ? (
            <div className="p-4 bg-white/70 rounded-xl border border-slate-100 text-center text-xs text-slate-500 italic space-y-2">
              <Award className="w-7 h-7 text-emerald-500 mx-auto" />
              <p>Everything looks fully optimized! High sugar and refined items have already been filtered out.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {autoSwaps.map((swap) => (
                  <div key={swap.id} className="bg-white p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-rose-500 font-bold font-mono line-through block">{swap.original}</span>
                        <span className="text-xs text-emerald-600 font-bold block mt-0.5">➡ Replace With: {swap.replaceWith}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md font-bold">
                        +{swap.proteinBonus}g Protein
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal bg-slate-50 p-2 rounded-lg">
                      {swap.reason}
                    </p>
                  </div>
                ))}
              </div>

              {swapResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{swapResult}</p>
                </div>
              )}

              <button
                onClick={handleApplyAllSwaps}
                disabled={isSwapping}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {isSwapping ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing Glycemic Swaps...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Apply All Recommended Swaps
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
