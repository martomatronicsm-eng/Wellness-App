import { HealthProfile, DailyLog, FoodItem, ShapContribution } from '../types';

export const DEFAULT_PROFILE: HealthProfile = {
  age: 34,
  gender: 'Female',
  weight: 68,
  height: 168,
  conditions: ['Mild Insulin Resistance', 'Afternoon Fatigue State'],
  goals: {
    sleepGoal: 8.0,
    waterGoal: 2500,
    calorieGoal: 2000,
    proteinGoal: 110,
    carbsGoal: 210,
    fatGoal: 65,
  }
};

const mealId = () => Math.random().toString(36).substring(2, 9);

export const PAST_DAYS_LOGS: DailyLog[] = [
  {
    date: '2026-06-03',
    sleepDuration: 5.8,
    sleepQuality: 4,
    waterIntake: 1200,
    activeMinutes: 15,
    activeCalories: 120,
    stressLevel: 8,
    caffeineIntake: 250,
    systolicBP: 132,
    diastolicBP: 84,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Large White Chocolate Mocha + Chocolate Croissant', calories: 680, carbs: 95, protein: 8, fat: 28, fiber: 1.5, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Lunch', desc: 'Cheeseburger with French fries and cola', calories: 890, carbs: 110, protein: 32, fat: 38, fiber: 3.0, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Dinner', desc: 'White Pasta with creamy sauce and garlic bread', calories: 750, carbs: 105, protein: 15, fat: 30, fiber: 2.0, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Snack', desc: 'Potato Chips and Soda', calories: 350, carbs: 45, protein: 3, fat: 18, fiber: 1.0, glycemicIndex: 'High' }
    ]
  },
  {
    date: '2026-06-04',
    sleepDuration: 5.5,
    sleepQuality: 5,
    waterIntake: 1100,
    activeMinutes: 10,
    activeCalories: 90,
    stressLevel: 8,
    caffeineIntake: 300,
    systolicBP: 135,
    diastolicBP: 86,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Sugary cereal with whole milk and high-sugar OJ', calories: 550, carbs: 85, protein: 11, fat: 12, fiber: 2.0, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Lunch', desc: 'Turkey Club Sandwich on white bread with potato salad', calories: 720, carbs: 80, protein: 28, fat: 25, fiber: 2.5, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Dinner', desc: 'Ordered Pepperoni Pizza (3 slices)', calories: 920, carbs: 115, protein: 36, fat: 34, fiber: 3.0, glycemicIndex: 'High' }
    ]
  },
  {
    date: '2026-06-05',
    sleepDuration: 6.0,
    sleepQuality: 4,
    waterIntake: 1400,
    activeMinutes: 20,
    activeCalories: 150,
    stressLevel: 7,
    caffeineIntake: 200,
    systolicBP: 130,
    diastolicBP: 82,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Blueberry muffin & Caramel macchiato', calories: 610, carbs: 88, protein: 6, fat: 26, fiber: 1.0, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Lunch', desc: 'Spicy chicken wrap on white tortilla & chips', calories: 780, carbs: 75, protein: 24, fat: 32, fiber: 2.0, glycemicIndex: 'High' },
      { id: mealId(), meal: 'Dinner', desc: 'Instant Ramen with egg + extra soy sauce', calories: 580, carbs: 78, protein: 14, fat: 23, fiber: 1.5, glycemicIndex: 'High' }
    ]
  },
  {
    date: '2026-06-06',
    // First day of partial AI guidance
    sleepDuration: 6.8,
    sleepQuality: 6,
    waterIntake: 1800,
    activeMinutes: 30,
    activeCalories: 210,
    stressLevel: 6,
    caffeineIntake: 150,
    systolicBP: 128,
    diastolicBP: 80,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Greek Yogurt with raspberries, oats, and honey (AI Approved Swap)', calories: 380, carbs: 45, protein: 24, fat: 6, fiber: 6.5, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Lunch', desc: 'Mixed green salad with grilled chicken, avocado & quinoa (AI Recommended)', calories: 520, carbs: 35, protein: 38, fat: 20, fiber: 8.0, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Dinner', desc: 'Grilled chicken sandwich on brioche, side salad', calories: 650, carbs: 55, protein: 30, fat: 22, fiber: 3.5, glycemicIndex: 'Medium' }
    ]
  },
  {
    date: '2026-06-07',
    // Fully Compliant Day 1
    sleepDuration: 7.5,
    sleepQuality: 8,
    waterIntake: 2400,
    activeMinutes: 45,
    activeCalories: 320,
    stressLevel: 4,
    caffeineIntake: 80,
    systolicBP: 121,
    diastolicBP: 78,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Avocado Toast on sourdough with 2 poached eggs & spinach', calories: 420, carbs: 32, protein: 22, fat: 18, fiber: 7.0, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Lunch', desc: 'Salmon Quinoa Buddha Bowl with steamed broccoli, tahini dressing', calories: 580, carbs: 48, protein: 42, fat: 24, fiber: 9.0, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Dinner', desc: 'Turkey meatballs with zucchini noodles & marinara sauce', calories: 480, carbs: 22, protein: 38, fat: 14, fiber: 5.0, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Snack', desc: 'A handful of almonds and a sliced apple', calories: 220, carbs: 20, protein: 6, fat: 14, fiber: 4.5, glycemicIndex: 'Low' }
    ]
  },
  {
    date: '2026-06-08',
    // Fully Compliant Day 2
    sleepDuration: 7.8,
    sleepQuality: 9,
    waterIntake: 2600,
    activeMinutes: 40,
    activeCalories: 280,
    stressLevel: 3,
    caffeineIntake: 80,
    systolicBP: 118,
    diastolicBP: 76,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Oatmeal made with almond milk, chia seeds, protein powder & blueberries', calories: 410, carbs: 42, protein: 28, fat: 8, fiber: 8.5, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Lunch', desc: 'Tofu Lentil Curry with brown rice and mixed stir-fry greens', calories: 510, carbs: 62, protein: 26, fat: 12, fiber: 11.0, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Dinner', desc: 'Baked cod fillet with roasted sweet potatoes and asparagus', calories: 460, carbs: 38, protein: 32, fat: 10, fiber: 6.0, glycemicIndex: 'Low' }
    ]
  },
  {
    date: '2026-06-09',
    // Today
    sleepDuration: 8.0,
    sleepQuality: 9,
    waterIntake: 2700,
    activeMinutes: 50,
    activeCalories: 350,
    stressLevel: 2,
    caffeineIntake: 50,
    systolicBP: 117,
    diastolicBP: 74,
    foodDiary: [
      { id: mealId(), meal: 'Breakfast', desc: 'Scrambled eggs (2) + half avocado + smoked salmon + asparagus', calories: 390, carbs: 6, protein: 34, fat: 22, fiber: 5.0, glycemicIndex: 'Low' },
      { id: mealId(), meal: 'Lunch', desc: 'Grilled turkey breast, brown rice, cooked kale with olive oil', calories: 540, carbs: 44, protein: 38, fat: 14, fiber: 5.5, glycemicIndex: 'Low' }
    ]
  }
];

// Helper functions for nutritional analysis
export function calculateTotalsForDay(log: DailyLog) {
  let calories = 0;
  let carbs = 0;
  let protein = 0;
  let fat = 0;
  let fiber = 0;
  
  for (const item of log.foodDiary) {
    calories += item.calories;
    carbs += item.carbs;
    protein += item.protein;
    fat += item.fat;
    fiber += item.fiber;
  }
  
  return { calories, carbs, protein, fat, fiber };
}

// Calculate base metabolic stress score based on factors (conceptual LIME/SHAP simulator)
export function calculateMetabolicStress(log: DailyLog) {
  const totals = calculateTotalsForDay(log);
  
  // Baseline metabolic stress starts at 40%
  let stress = 40;
  
  // Sleep aspect: less than 7 hours adds stress
  if (log.sleepDuration < 7) {
    const deficit = 7 - log.sleepDuration;
    stress += deficit * 12; // up to +36%
  } else {
    const surplus = log.sleepDuration - 7;
    stress -= surplus * 5; // up to -5%
  }
  
  // Hydration aspect: less than 2000ml adds stress
  if (log.waterIntake < 2000) {
    const deficitPercent = (2000 - log.waterIntake) / 2000;
    stress += deficitPercent * 15;
  } else {
    stress -= 5;
  }
  
  // Sugar / High Glycemic carb index aspect
  const highGICount = log.foodDiary.filter(item => item.glycemicIndex === 'High').length;
  stress += highGICount * 8; // high GI spikes insulin & raises stress
  
  // Physical Activity aspect: more than 30 mins active cal lowers stress
  if (log.activeMinutes < 20) {
    stress += 10;
  } else {
    const excess = Math.min(log.activeMinutes - 20, 40);
    stress -= (excess / 40) * 12;
  }
  
  // Caffeine and baseline stress levels
  if (log.caffeineIntake > 200) {
    stress += 8;
  }
  stress += (log.stressLevel - 5) * 2;
  
  // Keep bound inside 10 - 95
  return Math.min(Math.max(Math.round(stress), 10), 95);
}

// Generates simulated SHAP values for metabolic stress
export function generateShapValues(log: DailyLog): ShapContribution[] {
  const totals = calculateTotalsForDay(log);
  const contributions: ShapContribution[] = [];
  
  // Sleep Quality
  if (log.sleepDuration < 7) {
    const diff = 7 - log.sleepDuration;
    contributions.push({
      feature: `Low Sleep (${log.sleepDuration.toFixed(1)} hrs)`,
      weight: Math.round(diff * 10),
      description: 'Inadequate restorative sleep increases cortisol levels and metabolic strain.',
      category: 'sleep'
    });
  } else {
    contributions.push({
      feature: `Healthy Sleep (${log.sleepDuration.toFixed(1)} hrs)`,
      weight: -Math.round((log.sleepDuration - 7) * 4),
      description: 'Optimal sleep assists insulin sensitivity and neural detoxification.',
      category: 'sleep'
    });
  }
  
  // Nutrition Carb Balance / GI Load
  const highGICount = log.foodDiary.filter(item => item.glycemicIndex === 'High').length;
  if (highGICount > 1) {
    contributions.push({
      feature: `High Glycemic Index Meals (${highGICount} meals)`,
      weight: highGICount * 9,
      description: 'Sugar and refined carb spikes trigger rapid glucose fluxes and insulin response.',
      category: 'diet'
    });
  } else {
    contributions.push({
      feature: 'Low Glycemic Load Diet',
      weight: -12,
      description: 'Stabilized carbohydrate footprint balances blood sugar levels.',
      category: 'diet'
    });
  }

  // Protein status
  if (totals.protein < 60) {
    contributions.push({
      feature: `Low Daily Protein (${totals.protein}g)`,
      weight: 8,
      description: 'Insufficient protein intake reduces muscle repair capacity and early afternoon satiation.',
      category: 'diet'
    });
  } else {
    contributions.push({
      feature: `Rich Satiating Protein (${totals.protein}g)`,
      weight: -8,
      description: 'Adequate amino acid profile optimizes glucose metabolic rates.',
      category: 'diet'
    });
  }
  
  // Hydration status
  if (log.waterIntake < 2000) {
    contributions.push({
      feature: `Dehydration State (${log.waterIntake}ml)`,
      weight: Math.round(((2000 - log.waterIntake) / 100)),
      description: 'Restricted hydration dampens renal clearance and metabolic rate.',
      category: 'hydration'
    });
  } else {
    contributions.push({
      feature: `Optimized Hydration (${log.waterIntake}ml)`,
      weight: -6,
      description: 'Proper cellular hydration lowers relative viscosity and promotes liver clearance.',
      category: 'hydration'
    });
  }
  
  // Activity status
  if (log.activeMinutes < 20) {
    contributions.push({
      feature: 'Sedentary Muscle Tone',
      weight: 12,
      description: 'Minimal physical activity results in lowered peripheral glucose uptake.',
      category: 'activity'
    });
  } else {
    contributions.push({
      feature: `Physical Activity (${log.activeMinutes} mins)`,
      weight: -Math.round(log.activeMinutes * 0.4),
      description: 'Muscle contraction directly triggers safe GLUT4 translocation bypass.',
      category: 'activity'
    });
  }
  
  // Lifestyle Stress and Caffeine
  if (log.caffeineIntake > 200) {
    contributions.push({
      feature: `Excess Cafe/Stimulants (${log.caffeineIntake}mg)`,
      weight: 6,
      description: 'Excessive stimulants trigger hyper-adrenergic heart rate elevations.',
      category: 'lifestyle'
    });
  }
  
  if (log.stressLevel > 6) {
    contributions.push({
      feature: `High Subjective Stress (${log.stressLevel}/10)`,
      weight: (log.stressLevel - 5) * 3,
      description: 'Sympathetic nerve firing elevates glucose release and peripheral resistance.',
      category: 'lifestyle'
    });
  } else {
    contributions.push({
      feature: `Calmed Nervous System`,
      weight: -5,
      description: 'Parasympathetic balance promotes gastric absorption and systemic calm.',
      category: 'lifestyle'
    });
  }
  
  return contributions.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
}
