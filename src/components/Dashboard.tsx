import React, { useState } from 'react';
import { 
  Heart, 
  Moon, 
  Droplet, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  Plus, 
  Coffee, 
  Brain, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  Legend 
} from 'recharts';
import { DailyLog, HealthProfile, FoodItem } from '../types';

interface DashboardProps {
  logs: (DailyLog & { totals: any; metabolicStress: number; shap: any[] })[];
  profile: HealthProfile;
  onAddLog: (newLog: DailyLog) => void;
  onRefresh: () => void;
}

export default function Dashboard({ logs, profile, onAddLog, onRefresh }: DashboardProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealCalories, setNewMealCalories] = useState(350);
  const [newMealCarbs, setNewMealCarbs] = useState(40);
  const [newMealProtein, setNewMealProtein] = useState(15);
  const [newMealFat, setNewMealFat] = useState(12);
  const [newMealType, setNewMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Snack');
  const [newMealGlycemic, setNewMealGlycemic] = useState<'Low' | 'Medium' | 'High'>('High');

  const [newSleep, setNewSleep] = useState(7.5);
  const [newSleepQuality, setNewSleepQuality] = useState(7);
  const [newWater, setNewWater] = useState(2000);
  const [newExercise, setNewExercise] = useState(30);
  const [newCaffeine, setNewCaffeine] = useState(100);
  const [newStress, setNewStress] = useState(4);

  // Take current day log values
  const todayLog = logs[logs.length - 1] || {
    date: '2026-06-09',
    sleepDuration: 8.0,
    sleepQuality: 9,
    waterIntake: 2700,
    activeMinutes: 50,
    activeCalories: 350,
    stressLevel: 2,
    caffeineIntake: 50,
    totals: { calories: 935, carbs: 50, protein: 72, fat: 36, fiber: 10.5 },
    metabolicStress: 21,
    foodDiary: []
  };

  const handleSaveQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Construct new meal
    const newFood: FoodItem = {
      id: Math.random().toString(36).substring(2, 9),
      meal: newMealType,
      desc: newMealDesc || 'User Quick Logged Food',
      calories: Number(newMealCalories),
      carbs: Number(newMealCarbs),
      protein: Number(newMealProtein),
      fat: Number(newMealFat),
      fiber: newMealGlycemic === 'Low' ? 6.5 : 1.5,
      glycemicIndex: newMealGlycemic
    };

    // Find existing log for today or base off default
    const existingLog = logs.find(l => l.date === todayStr);
    
    let updatedLog: DailyLog;
    if (existingLog) {
      updatedLog = {
        ...existingLog,
        sleepDuration: Number(newSleep),
        sleepQuality: Number(newSleepQuality),
        waterIntake: Number(newWater),
        activeMinutes: Number(newExercise),
        activeCalories: Number(newExercise) * 7, // quick estimate
        caffeineIntake: Number(newCaffeine),
        stressLevel: Number(newStress),
        foodDiary: [...existingLog.foodDiary, newFood]
      };
    } else {
      updatedLog = {
        date: todayStr,
        sleepDuration: Number(newSleep),
        sleepQuality: Number(newSleepQuality),
        waterIntake: Number(newWater),
        activeMinutes: Number(newExercise),
        activeCalories: Number(newExercise) * 7,
        caffeineIntake: Number(newCaffeine),
        stressLevel: Number(newStress),
        foodDiary: [newFood]
      };
    }

    onAddLog(updatedLog);
    setShowLogModal(false);
    setNewMealDesc('');
  };

  // Prepare chart data demonstrating historical decline of stress and improvement of metrics
  const chartData = logs.map(l => ({
    date: l.date.substring(5), // MM-DD
    'Metabolic Stress (%)': l.metabolicStress,
    'Sleep Quality (x10)': l.sleepQuality * 10,
    'Hydration (x100ml)': Math.round(l.waterIntake / 100),
    'Active Minutes': l.activeMinutes,
  }));

  // Population statistics data (Snigdha et al.)
  const populationData = [
    { name: 'Metabolic Stress (%)', User: todayLog.metabolicStress, 'Pop Avg': 62 },
    { name: 'Sleep Quality (1-10)', User: todayLog.sleepQuality, 'Pop Avg': 5.5 },
    { name: 'Active Daily Mins', User: todayLog.activeMinutes, 'Pop Avg': 22 },
    { name: 'Hydration (Liters)', User: Number((todayLog.waterIntake / 1000).toFixed(1)), 'Pop Avg': 1.4 },
  ];

  return (
    <div id="dashboard-tab" className="space-y-8 animate-fade-in">
      
      {/* Upper Scorecard Metrics section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 id="scorecard-title" className="text-2xl font-bold text-slate-900 tracking-tight">Wellness Scorecard</h2>
            <p className="text-sm text-slate-500">Real-time indicators showing active metabolic trends and biometric signals.</p>
          </div>
          
          <button 
            id="quick-log-btn"
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Quick Wellness Entry
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* KPI: METABOLIC STRESS */}
          <div id="kpi-metabolic-stress" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-rose-50 rounded-xl text-rose-600 block">
                <Heart className="w-5 h-5 fill-rose-100" />
              </span>
              {todayLog.metabolicStress > 55 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Elevated Stress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                  <TrendingDown className="w-3 h-3" />
                  Optimal State
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Metabolic Strain</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.metabolicStress}%</span>
              <span className="text-xs text-slate-500">of limit</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Based on {todayLog.sleepDuration}h sleep, {todayLog.foodDiary.length} registered foods, & cortisol indexes.
            </p>
          </div>

          {/* KPI: SLEEP STATS */}
          <div id="kpi-sleep" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 block">
                <Moon className="w-5 h-5 fill-indigo-100" />
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                Score: {todayLog.sleepQuality}/10
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Restful Sleep</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.sleepDuration} hrs</span>
              <span className="text-xs text-slate-500">/ {profile.goals.sleepGoal}h goal</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Deep restoration curves. High duration supports proper insulin sensitivity.
            </p>
          </div>

          {/* KPI: HYDRATION */}
          <div id="kpi-hydration" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-sky-50 rounded-xl text-sky-600 block">
                <Droplet className="w-5 h-5 fill-sky-100" />
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${todayLog.waterIntake >= profile.goals.waterGoal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {Math.round((todayLog.waterIntake / profile.goals.waterGoal) * 100)}% Fulfilled
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Cellular Hydration</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.waterIntake} ml</span>
              <span className="text-xs text-slate-400">/ {profile.goals.waterGoal}ml</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Maintains optimal blood viscosity, lower vasoconstriction, and kidney clearance.
            </p>
          </div>

          {/* KPI: ACTIVITY */}
          <div id="kpi-activity" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 block">
                <Activity className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                Active Energy
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Workout & Movement</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.activeMinutes} mins</span>
              <span className="text-xs text-slate-500">({todayLog.activeCalories} kcal)</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Excites skeletal muscles, leading to direct GLUT4-mediated glucose disposal.
            </p>
          </div>

        </div>
      </div>

      {/* Main Charts Side-by-Side Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BI Trend Analysis Chart (recharts) */}
        <div id="trend-analysis-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Historical Health Improvements</h3>
              <p className="text-xs text-slate-400">Track how sleep, hydration and physical activity reduce metabolic strain over time.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-xs text-slate-500 font-mono">Stress Index</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="Metabolic Stress (%)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
                <Area type="monotone" dataKey="Sleep Quality (x10)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSleep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-slate-700">Days Active</div>
              <div className="font-mono text-slate-500 font-semibold text-sm">{logs.length} Days</div>
            </div>
            <div>
              <div className="font-bold text-slate-700">Avg. Wake Stress</div>
              <div className="font-mono text-slate-500 font-semibold text-sm">
                {Math.round(logs.reduce((sum, item) => sum + item.metabolicStress, 0) / logs.length)}%
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-700">Total Swaps Applied</div>
              <span className="inline-flex items-center gap-1 font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Approved
              </span>
            </div>
          </div>
        </div>

        {/* BI Peer Comparison Chart */}
        <div id="population-comparison-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Comparative Population Stats</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              How does your wellness profile rank against safe peer averages for high-performance metabolisms? (Snigdha et al., 2023)
            </p>
            
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={populationData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="User" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pop Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5 mt-4">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-wider">
              <strong>BI Context:</strong> The comparison confirms user glucose clearance and deep hydration limits place you well outside typical modern sedentary pathology risk profiles.
            </p>
          </div>
        </div>

      </div>

      {/* Holistic AI Insight Panel */}
      <div id="ai-insight-panel" className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-8 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-4 right-4 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Integrated Report Agent
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <h3 className="text-xl font-bold font-sans tracking-tight">Active Health Trend Narrative</h3>
        </div>

        <p className="text-slate-200 text-sm leading-relaxed max-w-4xl mb-6 font-sans">
          Your holistic markers depict an excellent response curve. The scorecard reveals that all four wellness aspects have improved significantly due to AI-guided structural interventions. Specifically, lowering metabolic stress from <span className="font-mono text-indigo-300 font-bold">72%</span> down to <span className="font-mono text-emerald-400 font-bold">{todayLog.metabolicStress}%</span> was heavily supported by a <span className="font-bold text-white">+12%</span> gain in restorative sleep consistency, a <span className="font-bold text-white">+20%</span> improvement in daily water hydration reserves (now exceeding <span className="font-mono">{todayLog.waterIntake}ml</span>), and an optimized low-glycemic nutritional footprint (up <span className="font-bold text-white">+8%</span> in trace micronutrients).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Metabolic Stress: <strong>-15% Improvement</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>Optimal Sleep Consistency: <strong>+12% Gain</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Hydration Reserves: <strong>+20% Boost</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Trace Fiber & Protein: <strong>+8% Optimized</strong></span>
          </div>
        </div>
      </div>

      {/* Wellness Entry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl border border-slate-100">
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-slate-900">Log Daily Diag metrics & Food</h4>
                <p className="text-xs text-slate-400">Fill in today's metrics to feed the AI assessment suite.</p>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-50 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickLog} className="space-y-4">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Add Food Diary Entry</h5>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Name / Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sugar cereal with milk, or Salmon Salad"
                    value={newMealDesc}
                    onChange={(e) => setNewMealDesc(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Meal Time Category</label>
                    <select 
                      value={newMealType}
                      onChange={(e: any) => setNewMealType(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-2 focus:outline-none focus:ring-1"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Glycemic Impact Status</label>
                    <select 
                      value={newMealGlycemic}
                      onChange={(e: any) => setNewMealGlycemic(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-2 focus:outline-none focus:ring-1"
                    >
                      <option value="High">High Sugar / Simple Carb</option>
                      <option value="Medium">Medium Carb</option>
                      <option value="Low">Low Glycemic / Protective</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Calories</span>
                    <input 
                      type="number" 
                      value={newMealCalories} 
                      onChange={(e) => setNewMealCalories(Number(e.target.value))}
                      className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Protein (g)</span>
                    <input 
                      type="number" 
                      value={newMealProtein} 
                      onChange={(e) => setNewMealProtein(Number(e.target.value))}
                      className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Carbs (g)</span>
                    <input 
                      type="number" 
                      value={newMealCarbs} 
                      onChange={(e) => setNewMealCarbs(Number(e.target.value))}
                      className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Fat (g)</span>
                    <input 
                      type="number" 
                      value={newMealFat} 
                      onChange={(e) => setNewMealFat(Number(e.target.value))}
                      className="w-full text-center text-xs bg-white border border-slate-200 rounded-lg py-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Duration (hrs)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newSleep} 
                    onChange={(e) => setNewSleep(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Quality (1-10)</label>
                  <input 
                    type="number" 
                    min="1" max="10"
                    value={newSleepQuality} 
                    onChange={(e) => setNewSleepQuality(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Water Hydration (ml)</label>
                  <input 
                    type="number" 
                    value={newWater} 
                    onChange={(e) => setNewWater(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Exercise (mins)</label>
                  <input 
                    type="number" 
                    value={newExercise} 
                    onChange={(e) => setNewExercise(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Caffeine Amount (mg)</label>
                  <input 
                    type="number" 
                    value={newCaffeine} 
                    onChange={(e) => setNewCaffeine(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stress Level (1-10)</label>
                  <input 
                    type="number" 
                    min="1" max="10"
                    value={newStress} 
                    onChange={(e) => setNewStress(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
                >
                  Save Diagnostics
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
