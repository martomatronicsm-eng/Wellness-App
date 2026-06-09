import React, { useState } from 'react';
import { User, Activity, Sliders, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { HealthProfile } from '../types';

interface ProfileSettingsProps {
  profile: HealthProfile;
  onUpdateProfile: (updatedProfile: HealthProfile) => void;
}

export default function ProfileSettings({ profile, onUpdateProfile }: ProfileSettingsProps) {
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [conditionsInput, setConditionsInput] = useState(profile.conditions.join(', '));
  
  const [sleepGoal, setSleepGoal] = useState(profile.goals.sleepGoal);
  const [waterGoal, setWaterGoal] = useState(profile.goals.waterGoal);
  const [calorieGoal, setCalorieGoal] = useState(profile.goals.calorieGoal);
  const [proteinGoal, setProteinGoal] = useState(profile.goals.proteinGoal);
  const [carbsGoal, setCarbsGoal] = useState(profile.goals.carbsGoal);
  const [fatGoal, setFatGoal] = useState(profile.goals.fatGoal);

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: HealthProfile = {
      age: Number(age),
      gender,
      weight: Number(weight),
      height: Number(height),
      conditions: conditionsInput.split(',').map(s => s.trim()).filter(s => s !== ''),
      goals: {
        sleepGoal: Number(sleepGoal),
        waterGoal: Number(waterGoal),
        calorieGoal: Number(calorieGoal),
        proteinGoal: Number(proteinGoal),
        carbsGoal: Number(carbsGoal),
        fatGoal: Number(fatGoal)
      }
    };
    onUpdateProfile(updated);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div id="profile-management-tab" className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="bg-slate-900 text-white p-6 md:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-white/10 rounded-2xl text-white">
            <HeartPulse className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Personalized Health Profiler</h3>
            <p className="text-xs text-slate-300">Set biometric data points and metabolic goals referenced during AI analysis.</p>
          </div>
        </div>
        <span className="text-xs bg-lime-400 text-slate-950 font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider">
          Active Profile
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        
        {savedMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm flex items-center gap-2 font-medium">
            ✓ Biometrics synchronized. All calculations and SHAP factor offsets have been dynamically updated!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Biometrics Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Biometrics Input
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Age (Years)</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Biological Gender</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Height (cm)</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Existing Conditions / Risks (comma separated)</label>
              <input 
                type="text" 
                placeholder="Insulin Resistance, Mild Fatigue, None"
                value={conditionsInput} 
                onChange={(e) => setConditionsInput(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">Allows the assistant to adapt diagnostic sensitivity based on metabolic limits.</p>
            </div>
          </div>

          {/* Daily Goals Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" /> Dietary & Wellness Guidelines
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sleep Goal (hrs)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={sleepGoal} 
                  onChange={(e) => setSleepGoal(Number(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Water Target (ml)</label>
                <input 
                  type="number" 
                  step="100"
                  value={waterGoal} 
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Daily Energy Target (kcal)</label>
              <input 
                type="number" 
                step="50"
                value={calorieGoal} 
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" 
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Protein (g)</label>
                <input 
                  type="number" 
                  value={proteinGoal} 
                  onChange={(e) => setProteinGoal(Number(e.target.value))}
                  className="w-full text-center text-xs bg-slate-50 border border-slate-200 rounded-lg py-2" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Carbs (g)</label>
                <input 
                  type="number" 
                  value={carbsGoal} 
                  onChange={(e) => setCarbsGoal(Number(e.target.value))}
                  className="w-full text-center text-xs bg-slate-50 border border-slate-200 rounded-lg py-2" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Fat (g)</label>
                <input 
                  type="number" 
                  value={fatGoal} 
                  onChange={(e) => setFatGoal(Number(e.target.value))}
                  className="w-full text-center text-xs bg-slate-50 border border-slate-200 rounded-lg py-2" 
                />
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xs uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" /> Save Preferences
          </button>
        </div>

      </form>
    </div>
  );
}
