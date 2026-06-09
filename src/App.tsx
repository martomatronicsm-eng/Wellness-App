import { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Sparkles, 
  User, 
  Brain, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  Info
} from 'lucide-react';
import { HealthProfile, DailyLog } from './types';
import Dashboard from './components/Dashboard';
import NutritionOptimizer from './components/NutritionOptimizer';
import AgentChat from './components/AgentChat';
import ProfileSettings from './components/ProfileSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'optimizer' | 'chat' | 'profile'>('dashboard');
  
  // State from database
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [logs, setLogs] = useState<(DailyLog & { totals: any; metabolicStress: number; shap: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const fetchAppData = async () => {
    try {
      const [profileRes, logsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/logs')
      ]);

      if (!profileRes.ok || !logsRes.ok) {
        throw new Error('Server data loading error. Falling back to local replication engine.');
      }

      const profileData = await profileRes.json();
      const logsData = await logsRes.json();

      setProfile(profileData);
      setLogs(logsData);
      setErrorStatus(null);
    } catch (err) {
      console.warn("API Server unavailable, active simulation offline fallback active.");
      setErrorStatus("Simulated Local Memory Engine Active (Development Sandboxed)");
      
      // Let's load the client-side default states so we are completely operational
      const { DEFAULT_PROFILE, PAST_DAYS_LOGS, calculateMetabolicStress, generateShapValues, calculateTotalsForDay } = await import('./utils/mockData');
      
      setProfile(DEFAULT_PROFILE);
      
      const hydrated = PAST_DAYS_LOGS.map(l => ({
        ...l,
        totals: calculateTotalsForDay(l),
        metabolicStress: calculateMetabolicStress(l),
        shap: generateShapValues(l)
      }));
      setLogs(hydrated);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handleUpdateProfile = async (updated: HealthProfile) => {
    setProfile(updated);
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      fetchAppData();
    } catch (err) {
      console.error("Local sync saved.", err);
    }
  };

  const handleAddLog = async (newLog: DailyLog) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      fetchAppData();
    } catch (err) {
      // Offline fallback state update
      const { calculateTotalsForDay, calculateMetabolicStress, generateShapValues } = await import('./utils/mockData');
      const idx = logs.findIndex(l => l.date === newLog.date);
      const hydratedLog = {
        ...newLog,
        totals: calculateTotalsForDay(newLog),
        metabolicStress: calculateMetabolicStress(newLog),
        shap: generateShapValues(newLog)
      };

      if (idx >= 0) {
        const copy = [...logs];
        copy[idx] = hydratedLog;
        setLogs(copy);
      } else {
        setLogs(prev => [...prev, hydratedLog].sort((a,b) => a.date.localeCompare(b.date)));
      }
    }
  };

  const handleExecuteSwaps = async (date: string, modifications: any[]) => {
    try {
      const res = await fetch('/api/execute-swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, modifications })
      });
      if (res.ok) {
        fetchAppData();
      } else {
        throw new Error("Failed to execute swaps on server");
      }
    } catch (err) {
      // Local simulated execution for offline resilience
      const targetLog = logs.find(l => l.date === date);
      if (!targetLog) return;

      const { calculateTotalsForDay, calculateMetabolicStress, generateShapValues } = await import('./utils/mockData');

      const updatedDiary = targetLog.foodDiary.map(food => {
        const modification = modifications.find(m => 
          food.desc.toLowerCase().includes(m.original.toLowerCase()) || 
          m.original.toLowerCase().includes(food.desc.toLowerCase())
        );
        if (modification) {
          return {
            ...food,
            desc: `${modification.replaceWith} (AI Optimized Swapped)`,
            glycemicIndex: 'Low' as const,
            calories: Math.max(Math.round(food.calories * 0.65), 180),
            carbs: Math.max(Math.round(food.carbs * 0.45), 15),
            protein: Math.max(Math.round(food.protein * 1.5), 20),
            fiber: food.fiber + 5,
          };
        }
        return food;
      });

      const updatedLog: DailyLog = {
        ...targetLog,
        foodDiary: updatedDiary,
        waterIntake: Math.max(targetLog.waterIntake, 2600),
        sleepQuality: Math.min(targetLog.sleepQuality + 1, 10),
        stressLevel: Math.max(targetLog.stressLevel - 2, 2)
      };

      handleAddLog(updatedLog);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-md font-bold text-slate-800">Initializing Health Monitoring Workspace</h2>
        <p className="text-xs text-slate-400 mt-1 leading-normal">Building live dashboard indicators and explainability structures...</p>
      </div>
    );
  }

  const latestLog = logs[logs.length - 1] || {
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

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased pb-16">
      
      {/* Top Banner indicating Simulated database state */}
      {errorStatus && (
        <div className="bg-slate-900 border-b border-indigo-500/20 px-6 py-2.5 text-center text-xs text-slate-300 flex items-center justify-center gap-2 font-mono">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* Main Top Header Block */}
      <header className="bg-white border-b border-slate-100 py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 border border-indigo-500/15">
              <HeartPulse className="w-8 h-8 fill-indigo-500/5" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">AI Nutrition and Wellness Assistant</h1>
              <p className="text-xs text-slate-400 font-medium">Full-Stack, Human-In-The-Loop Wellness Governance & Diagnostic Pipeline</p>
            </div>
          </div>
          
          {/* Diagnostic Stats Header widget */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs shrink-0 self-start md:self-auto font-medium">
            <div className="text-slate-500">
              Active Date Logs: <strong className="text-slate-800">{logs.length}</strong>
            </div>
            <span className="w-1.5 h-6 bg-slate-200" />
            <div className="text-slate-500">
              Wellness Index: <strong className="text-emerald-600">{100 - latestLog.metabolicStress}%</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Layout wrapper */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8 space-y-6">

        {/* Responsible AI Framework Disclosure Statement */}
        <div id="responsible-ai-disclosure" className="bg-indigo-50/60 border border-indigo-100 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center">
          <div className="md:col-span-1 p-2.5 bg-white rounded-2xl border border-indigo-100 text-indigo-600 w-12 h-12 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div className="md:col-span-11 space-y-1">
            <h4 className="text-xs font-black uppercase text-indigo-900 tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Responsible AI framework
            </h4>
            <p className="text-xs text-indigo-950 leading-relaxed">
              <strong>Transparency & Explainability (Ali, 2024):</strong> This application translates deep health models into digestible parameters. By visualizing <strong>SHAP feature weights</strong> (the causal factors behind fatigue and metabolic strain) and requiring explicit **human-in-the-loop approval** before updating records, we avoid black-box clinical guidance, building trust with patients and medical practitioners.
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-slate-250 pb-px gap-1 md:gap-4 overflow-x-auto scroller-hide">
          <button 
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'dashboard' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Wellness BI Dashboard
          </button>
          
          <button 
            id="tab-btn-optimizer"
            onClick={() => setActiveTab('optimizer')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'optimizer' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Nutrition Optimizer
          </button>

          <button 
            id="tab-btn-chat"
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Brain className="w-3.5 h-3.5 fill-current" />
            Co-Pilot Workspace
          </button>

          <button 
            id="tab-btn-profile"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'profile' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Personal Profiler
          </button>
        </div>

        {/* Tab Content Renderer & Switchboard */}
        <div className="mt-4">
          {activeTab === 'dashboard' && profile && (
            <Dashboard 
              logs={logs} 
              profile={profile} 
              onAddLog={handleAddLog} 
              onRefresh={fetchAppData} 
            />
          )}

          {activeTab === 'optimizer' && profile && (
            <NutritionOptimizer 
              currentLog={latestLog} 
              profile={profile} 
              onChangeLog={handleAddLog}
              onExecuteSwaps={handleExecuteSwaps}
            />
          )}

          {activeTab === 'chat' && latestLog && (
            <AgentChat 
              currentLog={latestLog} 
              onApproveSwaps={async (mods) => {
                await handleExecuteSwaps(latestLog.date, mods);
              }}
              onRefresh={fetchAppData}
            />
          )}

          {activeTab === 'profile' && profile && (
            <ProfileSettings 
              profile={profile} 
              onUpdateProfile={handleUpdateProfile} 
            />
          )}
        </div>

      </main>
    </div>
  );
}
