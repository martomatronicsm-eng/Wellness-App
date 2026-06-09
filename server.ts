import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_PROFILE, PAST_DAYS_LOGS, calculateMetabolicStress, generateShapValues, calculateTotalsForDay } from "./src/utils/mockData.js";
import { HealthProfile, DailyLog, FoodItem } from "./src/types.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Simple In-Memory Database for the user state
  let userProfile: HealthProfile = { ...DEFAULT_PROFILE };
  let dailyLogs: DailyLog[] = [...PAST_DAYS_LOGS];

  // Helper to safely fetch Gemini Client
  function getGeminiClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "" || key.includes("MY_GEMINI_API_KEY") || key.includes("YOUR")) {
      return null;
    }
    try {
      return new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI:", err);
      return null;
    }
  }

  // --- API Endpoints ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Get active health profile
  app.get("/api/profile", (req, res) => {
    res.json(userProfile);
  });

  // Update health profile
  app.post("/api/profile", (req, res) => {
    const update = req.body as HealthProfile;
    if (update && typeof update === "object") {
      userProfile = {
        ...userProfile,
        ...update,
        goals: { ...userProfile.goals, ...update.goals }
      };
      res.json({ success: true, profile: userProfile });
    } else {
      res.status(400).json({ error: "Invalid profile payload" });
    }
  });

  // Get all logs (including dynamic calculations)
  app.get("/api/logs", (req, res) => {
    const logsWithEvaluations = dailyLogs.map(log => {
      const totals = calculateTotalsForDay(log);
      const metabolicStress = calculateMetabolicStress(log);
      const shap = generateShapValues(log);
      return {
        ...log,
        totals,
        metabolicStress,
        shap
      };
    });
    res.json(logsWithEvaluations);
  });

  // Add or update a daily log
  app.post("/api/logs", (req, res) => {
    const newLog = req.body as DailyLog;
    if (!newLog || !newLog.date) {
      res.status(400).json({ error: "Invalid log entry" });
      return;
    }

    const index = dailyLogs.findIndex(l => l.date === newLog.date);
    if (index >= 0) {
      dailyLogs[index] = { ...dailyLogs[index], ...newLog };
    } else {
      dailyLogs.push(newLog);
    }
    // Keep sorted by date
    dailyLogs.sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, message: "Log saved successfully" });
  });

  // Direct Interactive Swap Executor (Human-in-the-Loop)
  app.post("/api/execute-swaps", (req, res) => {
    const { date, modifications } = req.body as { date: string; modifications: any[] };
    if (!date || !modifications || !Array.isArray(modifications)) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const logIndex = dailyLogs.findIndex(l => l.date === date);
    if (logIndex === -1) {
      res.status(404).json({ error: "No log found for the selected date to modify" });
      return;
    }

    let activeLog = dailyLogs[logIndex];
    let itemsUpdated = 0;

    // Apply the structural food swaps to the raw log
    const updatedFoodDiary = activeLog.foodDiary.map(food => {
      const modification = modifications.find(m => 
        food.desc.toLowerCase().includes(m.original.toLowerCase()) || 
        m.original.toLowerCase().includes(food.desc.toLowerCase())
      );
      if (modification) {
        itemsUpdated++;
        return {
          ...food,
          desc: `${modification.replaceWith} (AI Optimized Swapped)`,
          glycemicIndex: "Low" as const,
          // Simulated calorie & carb reduction
          calories: Math.max(Math.round(food.calories * 0.65), 180),
          carbs: Math.max(Math.round(food.carbs * 0.45), 15),
          protein: Math.max(Math.round(food.protein * 1.5), 20), // boost protein for satiety
          fiber: food.fiber + 5, // boost fiber
        };
      }
      return food;
    });

    // Update active logs
    dailyLogs[logIndex] = {
      ...activeLog,
      foodDiary: updatedFoodDiary,
      // After successfully applying nutrition changes, we improve hydration and lower stress!
      waterIntake: Math.max(activeLog.waterIntake, 2600),
      sleepQuality: Math.min(activeLog.sleepQuality + 1, 10),
      stressLevel: Math.max(activeLog.stressLevel - 2, 2)
    };

    res.json({
      success: true,
      message: `Successfully executed ${itemsUpdated} food optimization swaps. Recalculating wellness scorecard indicators!`,
      updatedLog: dailyLogs[logIndex]
    });
  });

  // Complex LLM Chat and Analysis Endpoint
  app.post("/api/chat", async (req, res) => {
    const { text, history, currentDateLog } = req.body;
    
    const client = getGeminiClient();

    // Context preparation: Inject user profile and latest day info for highly tailored recommendations
    const profileSummary = `User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- Health tags: ${userProfile.conditions.join(", ")}
- Target Goals: Sleep: ${userProfile.goals.sleepGoal} hrs, Water: ${userProfile.goals.waterGoal}ml, Calorie Capital: ${userProfile.goals.calorieGoal}kcal, Protein Goal: ${userProfile.goals.proteinGoal}g.`;

    const dayLogSummary = currentDateLog ? `Current Day Log Selection:
- Date: ${currentDateLog.date}
- Sleep: ${currentDateLog.sleepDuration} hrs (Quality: ${currentDateLog.sleepQuality}/10)
- Water: ${currentDateLog.waterIntake}ml
- Active Workout: ${currentDateLog.activeMinutes} mins (${currentDateLog.activeCalories} kcal)
- Coffee/Caffeine: ${currentDateLog.caffeineIntake}mg
- Stress level: ${currentDateLog.stressLevel}/10
- Food Diary entries: ${JSON.stringify(currentDateLog.foodDiary.map((f: any) => ({ meal: f.meal, desc: f.desc, cal: f.calories, carbs: f.carbs, protein: f.protein, fiber: f.fiber })))}` : "No current date log active.";

    const systemInstruction = `You are the AI Nutrition and Wellness Assistant. You must interact with users, audit their dietary selections, identify nutrient deficiencies/harmful patterns, and offer customized, highly explainable wellness advice.

IMPORTANT: Your response MUST be in JSON format matching the schema provided. 
When users ask about meals, fatigue, stress or wellness risks, you should TRIGGER the full agentic review pipeline. Set "workflowTriggered" to true, and populate risk detection, SHAP contribution factors, and a concrete proposed meal substitution plan.

For SHAP Contributions:
- This is a transparency & explainability showcase.
- Weights represent impact on the risk (usually Metabolic Stress, afternoon crash, or sugar spike).
- Sizable positive weights (+10 to +40) represent HARMFUL contributors (e.g. high glycemic snack, lack of sleep, low hydration).
- Negative weights (-5 to -30) represent BENEFICIAL/PROTECTIVE factors (e.g. active minutes, protein, high fiber).
- Each feature must contain a short explanation of the biochemical cause.

For Proposing Solutions:
- List a clear "title" (e.g., "Afternoon Fatigue and Insulin Stabilization Protocol")
- List bullet point "details"
- Include precise "modifications" that represent exact, literal replacements for foods present in the user's food diary context. Specify why.

If the user request is a general question or doesn't benefit from a health diagnostic trigger:
- Return "workflowTriggered": false.
- Populate "responseText" to answer their query normally with scientific, supportive info.`;

    if (!client) {
      // Diagnostic Fallback Mode (No API Key available)
      console.log("No GEMINI_API_KEY. Running in Diagnostic Simulator mode.");
      
      // Let's inspect the user input and simulate a rich, professional AI agent response
      const lowercase = text.toLowerCase();
      let simulatedResponse = {
        responseText: "Running in AI Diagnostic Simulation mode. I am analyzing your request with embedded wellness guidelines.",
        workflowTriggered: false,
        stageReached: "Idle",
        stageData: {}
      };

      if (lowercase.includes("crash") || lowercase.includes("energy") || lowercase.includes("fatigue") || lowercase.includes("meal") || lowercase.includes("breakfast") || lowercase.includes("analyze") || lowercase.includes("stress")) {
        // Build a highly-detailed simulated agent sequence
        const hasHighSugarMeal = currentDateLog?.foodDiary?.some((f: any) => f.desc.toLowerCase().includes("mocha") || f.desc.toLowerCase().includes("croissant") || f.desc.toLowerCase().includes("muffin") || f.desc.toLowerCase().includes("sugary") || f.desc.toLowerCase().includes("pizza"));
        
        simulatedResponse = {
          responseText: `Based on your nutrition auditing, I have detected a potential risk. An afternoon glycemic crash is likely due to the high-glycemic-load breakfasts/lunches in your active registry. 

Below, I have visualized the precise causal drivers using **SHAP Explainability** so you can see exactly which parameters are elevating metabolic strain, and proposed an automated substitution plan for your approval:`,
          workflowTriggered: true,
          stageReached: "AwaitingApproval",
          stageData: {
            risks: [
              {
                id: "risk_glycemic_crash",
                title: "Accelerated Insulin Feedback (Early Afternoon Fatigue)",
                level: "High",
                description: "Rapid glucose absorption from refined carbs triggers severe feedback hypoglycemia within 2-3 hours.",
                category: "diet"
              },
              {
                id: "risk_metabolic_fatigue",
                title: "Sleep-Deprivation Induced Glucose Intolerance",
                level: "Medium",
                description: "Sub-optimal sleep cycle alters ghrelin and insulin pathway sensitivity.",
                category: "sleep"
              }
            ],
            shapContributions: [
              {
                feature: `Sugary / Simple Sugar Intake`,
                weight: 35,
                description: "Triggers rapid beta-cell stimulation and acute insulin over-secretion.",
                category: "diet"
              },
              {
                feature: `Short Sleep (${currentDateLog?.sleepDuration || 5.8} hrs)`,
                weight: 18,
                description: "Suppresses cortical restorative curves, reducing skeletal glycogen uptake.",
                category: "sleep"
              },
              {
                feature: `Under Hydrated State`,
                weight: 12,
                description: "Mild hypovolemia increases baseline vasopressin, straining cellular transport efficiency.",
                category: "hydration"
              },
              {
                feature: `Muscle Inactivity`,
                weight: 10,
                description: "No physical movement means GLUT4 transporter activation depends wholly on insulin stimulation.",
                category: "activity"
              },
              {
                feature: `Adequate Satiating Fat`,
                weight: -12,
                description: "Lipid presence slows gastric emptying, creating a safer, gradual blood sugar curve.",
                category: "diet"
              }
            ],
            proposedPlan: {
              title: "Adaptive Blood Sugar & Adrenal Stabilization Plan",
              details: [
                "Swap high glycemic index morning foods for protein-dense alternative.",
                "Drink 500ml mineral water before midday to counter hypovolemia.",
                "Perform a brief 10-minute active walking loop post-lunch to utilize non-insulin peripheral glucose clearing."
              ],
              modifications: currentDateLog?.foodDiary?.map((f: any) => {
                if (f.desc.toLowerCase().includes("mocha") || f.desc.toLowerCase().includes("croissant")) {
                  return {
                    id: f.id,
                    original: f.desc,
                    replaceWith: "Avocado Toast on Sourdough with 2 Poached Eggs & Spinach",
                    reason: "Lowers glycemic load by 70%, adds 18g high-quality proteins and dietary fats, stabilizing insulin curve."
                  };
                }
                if (f.desc.toLowerCase().includes("burger") || f.desc.toLowerCase().includes("fries")) {
                  return {
                    id: f.id,
                    original: f.desc,
                    replaceWith: "Salmon Quinoa Buddha Bowl with Mixed Sprouts",
                    reason: "Provides essential Omega-3 fatty acids and slow-burn complex carbohydrates to preserve metabolic energy."
                  };
                }
                if (f.desc.toLowerCase().includes("pizza")) {
                  return {
                    id: f.id,
                    original: f.desc,
                    replaceWith: "Turkey Meatballs with Zucchini Noodles & Tomato Marinara",
                    reason: "Lowers systemic gluten and refined starch while restoring high protein volume is vital for lean tissue synthesis."
                  };
                }
                return {
                  id: f.id,
                  original: f.desc,
                  replaceWith: "Greek Yogurt with Chia Seeds, Raspberries & Pumpkin Seeds",
                  reason: "Boosts prebiotic fiber intake and supplies vital amino acids to satisfy craving cycles."
                };
              }).filter((m: any) => m !== undefined) || [
                {
                  id: "fallback_mod",
                  original: "Mocha & Croissant",
                  replaceWith: "Avocado Toast on Sourdough and Black Tea",
                  reason: "Mitigates early day glucose spike by replacing simple syrup with nutritious prebiotic fiber and key amino acids."
                }
              ]
            }
          }
        };
      } else {
        // Standard chat response
        simulatedResponse = {
          responseText: `Thank you for health checking in. I see you are tracking your wellness parameters. Your hydration is currently at ${currentDateLog?.waterIntake || 1200}ml and sleep registered at ${currentDateLog?.sleepDuration || 5.8} hours. 

To lower your metabolic strain index, I recommend prioritizing sleep consistency and choosing high-protein breakfast swaps. Let me know if you would like to run a full fatigue risk analysis!`,
          workflowTriggered: false,
          stageReached: "Idle",
          stageData: {}
        };
      }

      res.json(simulatedResponse);
      return;
    }

    try {
      // Use actual server-side Gemini API with structured schema output
      const model = "gemini-3.5-flash";

      const promptContext = `
${profileSummary}

${dayLogSummary}

Current User Message: ${text}
`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          responseText: {
            type: Type.STRING,
            description: "Friendly markdown response explaining findings and chatting to the user. State clearly which features are triggering metabolic stress or risks, referencing the SHAP and plan below if applicable."
          },
          workflowTriggered: {
            type: Type.BOOLEAN,
            description: "Must be true if user implies meal analysis, afternoon fatigue, crash risk, wellness auditing, or plan recommendations. Else false."
          },
          stageReached: {
            type: Type.STRING,
            description: "Must be 'AwaitingApproval' if workflowTriggered is true, otherwise 'Idle'."
          },
          stageData: {
            type: Type.OBJECT,
            properties: {
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    level: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["id", "title", "level", "description", "category"]
                }
              },
              shapContributions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    feature: { type: Type.STRING, description: "Display name of parameters such as 'Lack of Sleep', 'High Glycemic Meal', 'Hydration Goal'" },
                    weight: { type: Type.INTEGER, description: "Integer representing influence. Positive weight (+10 to +50) is harmful/risk increaser. Negative weight (-5 to -30) is protective/corrective factor." },
                    description: { type: Type.STRING, description: "Bio-nutritional explanation of why this parameter affects the risk." },
                    category: { type: Type.STRING, description: "Category: 'sleep', 'diet', 'activity', 'hydration', 'lifestyle'" }
                  },
                  required: ["feature", "weight", "description", "category"]
                }
              },
              proposedPlan: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  details: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  modifications: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        original: { type: Type.STRING, description: "Original meal text from the user log (or typical high sugar food if unspecified)" },
                        replaceWith: { type: Type.STRING, description: "Health-optimized, detailed replacement" },
                        reason: { type: Type.STRING, description: "Why this exchange corrects the detected risks" }
                      },
                      required: ["id", "original", "replaceWith", "reason"]
                    }
                  }
                },
                required: ["title", "details", "modifications"]
              }
            }
          }
        },
        required: ["responseText", "workflowTriggered", "stageReached"]
      };

      const result = await client.models.generateContent({
        model: model,
        contents: [
          { role: "user", parts: [{ text: promptContext }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      const parsed = JSON.parse(result.text || "{}");
      res.json(parsed);

    } catch (e: any) {
      console.error("Gemini call failed:", e);
      res.status(500).json({ error: "Failed to query server-side Gemini module. Running standard simulation.", details: e.message });
    }
  });

  // Serve static assets or mount Vite in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Nutrition and Wellness Assistant server booted on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Fatal error during bootstrap:", err);
});
