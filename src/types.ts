export interface HealthProfile {
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
  conditions: string[];
  goals: {
    sleepGoal: number; // hours
    waterGoal: number; // ml
    calorieGoal: number; // kcal
    proteinGoal: number; // grams
    carbsGoal: number; // grams
    fatGoal: number; // grams
  };
}

export interface FoodItem {
  id: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  desc: string;
  calories: number;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
  fiber: number; // grams
  glycemicIndex: 'Low' | 'Medium' | 'High';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sleepDuration: number; // hours
  sleepQuality: number; // 1-10
  waterIntake: number; // ml
  activeMinutes: number; // minutes
  activeCalories: number; // kcal
  foodDiary: FoodItem[];
  stressLevel: number; // 1-10
  caffeineIntake: number; // mg
  systolicBP?: number;
  diastolicBP?: number;
}

export interface ShapContribution {
  feature: string;
  weight: number; // Positive contribution pushes risk higher, negative lower
  description: string;
  category: 'sleep' | 'diet' | 'activity' | 'lifestyle' | 'hydration';
}

export interface AgentRisk {
  id: string;
  title: string;
  level: 'Low' | 'Medium' | 'High';
  description: string;
  category: string;
}

export interface ProposedModification {
  id: string;
  original: string;
  replaceWith: string;
  reason: string;
}

export interface ProposedPlan {
  title: string;
  details: string[];
  modifications: ProposedModification[];
}

export enum PipelineStage {
  Idle = "Idle",
  Detecting = "Detecting",
  Explaining = "Explaining",
  Proposing = "Proposing",
  AwaitingApproval = "AwaitingApproval",
  Executing = "Executing",
  Success = "Success"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  stageReached?: PipelineStage;
  stageData?: {
    risks?: AgentRisk[];
    shapContributions?: ShapContribution[];
    proposedPlan?: ProposedPlan;
  };
}
