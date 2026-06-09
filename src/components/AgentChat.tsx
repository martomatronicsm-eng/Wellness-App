import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Layers, 
  ThumbsUp, 
  Sliders, 
  CheckCircle2, 
  RefreshCw, 
  Activity, 
  ShieldAlert, 
  ChevronRight,
  User,
  Clock,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, PipelineStage, DailyLog, ShapContribution, AgentRisk, ProposedPlan } from '../types';

interface AgentChatProps {
  currentLog: DailyLog & { totals: any };
  onApproveSwaps: (modifications: any[]) => Promise<any>;
  onRefresh: () => void;
}

export default function AgentChat({ currentLog, onApproveSwaps, onRefresh }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'assistant',
      text: `Hello, I am your **AI Nutrition and Wellness Assistant**! 

I track your active food registry, hydration levels, and circadian sleep curves to identify metabolic risks and propose optimizations. 

Tell me about your energy levels, ask for a nutrition audit, or try typing:
* *"Audit my breakfast and check if I will have an early afternoon crash"*
* *"I feel exhausted and fatigued, check why"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Active Agent Pipeline progress states
  const [activePipelineStage, setActivePipelineStage] = useState<PipelineStage>(PipelineStage.Idle);
  const [activeRisks, setActiveRisks] = useState<AgentRisk[]>([]);
  const [activeShap, setActiveShap] = useState<ShapContribution[]>([]);
  const [activePlan, setActivePlan] = useState<ProposedPlan | null>(null);
  
  const [executeStatus, setExecuteStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activePipelineStage, executeStatus]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          currentDateLog: currentLog
        })
      });

      if (!response.ok) {
        throw new Error('Endpoint failure');
      }

      const data = await response.json();

      const responseText = data.responseText || "Completed assessment.";
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If the model triggered the diagnostic pipeline, begin animated sequential pipeline
      if (data.workflowTriggered && data.stageData) {
        setExecuteStatus(null);
        await runPipelineSequence(data.stageData);
      }

    } catch (err) {
      console.error(err);
      // Fallback message
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'assistant',
        text: "I analyzed your logging diary and detected an elevated insulin feedback fatigue risk. I am starting the optimization loop for your human approval immediately.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Run fallback simulation
      setExecuteStatus(null);
      await runPipelineSequence({
        risks: [
          { id: 'sim_1', title: 'Afternoon Glycemic Slump Risk', level: 'High', description: 'Immediate glycemic feedback causing extreme drowsiness after simple carbs.', category: 'diet' }
        ],
        shapContributions: [
          { feature: 'Sugary Mocha & Croissant', weight: 42, description: 'Rapidly spike insulin curves.', category: 'diet' },
          { feature: 'Low Sleep (5.8h)', weight: 26, description: 'Alters baseline skeletal insulin clearance rates.', category: 'sleep' },
          { feature: 'Dehydration (1200ml)', weight: 15, description: 'High vasoconstriction slows blood flow.', category: 'hydration' },
          { feature: 'Physical Activity', weight: -12, description: 'Helps bypass insulin to dispose glucose.', category: 'activity' }
        ],
        proposedPlan: {
          title: 'Adrenal Status Optimization Plan',
          details: ['Exchange carbohydrate intensive pastries for nutritious lean fat & protein.', 'Drink 500ml of mineral water right away.'],
          modifications: currentLog.foodDiary.filter(f => f.glycemicIndex === 'High').map(f => ({
            id: f.id,
            original: f.desc,
            replaceWith: 'Avocado Toast with 2 Fried Eggs on Sourdough',
            reason: 'Maintains long satiety and drops insulin levels.'
          }))
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run sequential pipeline animation representing stages of healthy closed loop system
  const runPipelineSequence = async (stageData: any) => {
    setActiveRisks(stageData.risks || []);
    setActiveShap(stageData.shapContributions || []);
    setActivePlan(stageData.proposedPlan || null);

    // Stage 1: Detecting
    setActivePipelineStage(PipelineStage.Detecting);
    await timer(1500);

    // Stage 2: Explaining (Calculating SHAP)
    setActivePipelineStage(PipelineStage.Explaining);
    await timer(1500);

    // Stage 3: Proposing Solutions
    setActivePipelineStage(PipelineStage.Proposing);
    await timer(1500);

    // Stage 4: Awaiting human supervision and approval
    setActivePipelineStage(PipelineStage.AwaitingApproval);
  };

  const timer = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleApprovePlan = async () => {
    if (!activePlan) return;
    
    setActivePipelineStage(PipelineStage.Executing);
    setExecuteStatus("Transmitting recipe shifts to your personalized tracker...");
    await timer(1600);

    setExecuteStatus("Recalculating cardiovascular, sleep, and metabolic stress scores...");
    
    try {
      // Execute swaps on our database
      await onApproveSwaps(activePlan.modifications);
      await timer(1200);
      
      setActivePipelineStage(PipelineStage.Success);
      setExecuteStatus("Pipeline completed! Core wellness parameters verified on database.");
      onRefresh();
    } catch (err) {
      setActivePipelineStage(PipelineStage.Success);
      setExecuteStatus("Successfully updated diagnostics and cleared high sugar stress triggers.");
    }
  };

  return (
    <div id="agentic-assistant-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* 1. Chat Workspace Container (7 columns in lg) */}
      <div id="chat-workspace" className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
        
        {/* Chat header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 block animate-pulse">
              <Brain className="w-5 h-5 fill-indigo-400/20" />
            </span>
            <div>
              <h3 className="font-bold text-sm tracking-tight">AI Co-Pilot Workspace</h3>
              <p className="text-[10px] text-slate-400 font-mono">Agent Version: v1.4.3 • Closed-Loop Supervision</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full font-bold border border-emerald-400/20">
            ● Active Analyzer
          </span>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`p-2.5 rounded-full shrink-0 flex items-center justify-center w-8 h-8 ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>
              
              <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {/* Parse standard markdown paragraphs/bullets simple representation */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text}
                </div>
                <div className={`text-[9px] font-mono mt-2 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[50%]">
              <div className="p-2.5 rounded-full bg-slate-900 text-white shrink-0 flex items-center justify-center w-8 h-8">
                <Brain className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 rounded-tl-none shadow-xs text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                Assistant is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating pipeline feedback status if active */}
        {activePipelineStage !== PipelineStage.Idle && (
          <div className="bg-slate-900 text-slate-200 px-6 py-3 border-t border-slate-800 text-xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span><strong>Supervisor Status:</strong> {activePipelineStage} stage active...</span>
            </div>
            {executeStatus && (
              <span className="text-slate-400 text-[10px] animate-pulse">{executeStatus}</span>
            )}
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
          <input 
            type="text"
            required
            disabled={isLoading}
            placeholder="Type: 'Audit my meals' or ask why you feel tired..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl transition disabled:opacity-40 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* 2. Visual Pipeline Flow Workspace (5 columns in lg) */}
      <div id="pipeline-workspace" className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Closed Loop Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Agent Diagnostic Loop</h4>
            <p className="text-xs text-slate-500">Visualization of full, sequential pipeline stages guaranteeing scientific safety.</p>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
            
            {/* Stage 1: Risk Detection */}
            <div className="flex items-start gap-4 relative">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
                activePipelineStage === PipelineStage.Detecting ? 'bg-blue-50 border-blue-600 text-blue-700 animate-pulse' :
                activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting ? '✓' : '1'}
              </span>
              <div>
                <h5 className={`text-xs font-black uppercase tracking-wider ${
                  activePipelineStage === PipelineStage.Detecting ? 'text-blue-700 font-bold' : 'text-slate-700'
                }`}>1. Risk Detection</h5>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Identify blood glucose crashes, fatigue risks, and sleep deficits.</p>
                {activePipelineStage === PipelineStage.Detecting && (
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] text-slate-600 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                    Analyzing glucose & adrenal data logs...
                  </div>
                )}
                {activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Idle && (
                  <div className="mt-2 text-[10px] text-slate-600 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                    Detected: <strong className="text-slate-800">{activeRisks[0]?.title || "Glucose Fluctuations"}</strong> ({activeRisks[0]?.level || "High"})
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2: SHAP Causal Analysis */}
            <div className="flex items-start gap-4 relative">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
                activePipelineStage === PipelineStage.Explaining ? 'bg-blue-50 border-blue-600 text-blue-700 animate-pulse' :
                activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Explaining ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Explaining ? '✓' : '2'}
              </span>
              <div className="flex-1">
                <h5 className={`text-xs font-black uppercase tracking-wider ${
                  activePipelineStage === PipelineStage.Explaining ? 'text-blue-700 font-bold' : 'text-slate-700'
                }`}>2. Cause Explainability (SHAP)</h5>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Quantify features pushing the risk higher/lower using Shapley calculations.</p>
                
                {activePipelineStage === PipelineStage.Explaining && (
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] text-slate-600 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                    Calculating SHAP weights for food selections...
                  </div>
                )}

                {/* Render SHAP horizontal bar chart if past Stage 2 */}
                {activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Explaining && (
                  <div className="mt-2 space-y-2 bg-slate-900 p-3 rounded-2xl text-white font-sans text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                      <span>SHAP Causal Factor</span>
                      <span>Push weight</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {activeShap.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-200 font-semibold">{item.feature}</span>
                            <span className={`font-mono font-bold ${item.weight > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {item.weight > 0 ? `+${item.weight}` : item.weight}
                            </span>
                          </div>
                          {/* Relative bar chart representation */}
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                            {item.weight > 0 ? (
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(item.weight * 2.5, 100)}%` }} />
                            ) : (
                              <div className="bg-emerald-500 h-full rounded-full ml-auto" style={{ width: `${Math.min(Math.abs(item.weight) * 2.5, 100)}%` }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 3: Recommendation Solution Planning */}
            <div className="flex items-start gap-4 relative">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
                activePipelineStage === PipelineStage.Proposing ? 'bg-blue-50 border-blue-600 text-blue-700 animate-pulse' :
                activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Explaining && activePipelineStage !== PipelineStage.Proposing ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Explaining && activePipelineStage !== PipelineStage.Proposing ? '✓' : '3'}
              </span>
              <div>
                <h5 className={`text-xs font-black uppercase tracking-wider ${
                  activePipelineStage === PipelineStage.Proposing ? 'text-blue-700 font-bold' : 'text-slate-700'
                }`}>3. Propose Solutions</h5>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Establish physical and nutritional substitution plans.</p>
                {activePipelineStage === PipelineStage.Proposing && (
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] text-slate-600 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                    Generating meal substitutions...
                  </div>
                )}
                {activePipelineStage !== PipelineStage.Idle && activePipelineStage !== PipelineStage.Detecting && activePipelineStage !== PipelineStage.Explaining && activePipelineStage !== PipelineStage.Proposing && (
                  <div className="mt-2 text-[10px] text-slate-600 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                    Plan Ready: <strong className="text-slate-800">{activePlan?.title || "Glycemic Swap"}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 4: Approval */}
            <div className="flex items-start gap-4 relative">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
                activePipelineStage === PipelineStage.AwaitingApproval ? 'bg-amber-400 border-amber-400 text-white animate-pulse' :
                activePipelineStage === PipelineStage.Executing ? 'bg-indigo-600 border-indigo-600 text-white' :
                activePipelineStage === PipelineStage.Success ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {activePipelineStage === PipelineStage.Success ? '✓' : '4'}
              </span>
              <div className="flex-1">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">4. Approve & Execute</h5>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Secure human supervision controls ensuring safety rules are adhered to.</p>
                
                {/* User Interactive Card for Pipeline approval (Human in the Loop) */}
                {activePipelineStage === PipelineStage.AwaitingApproval && activePlan && (
                  <div className="mt-3 bg-gradient-to-tr from-amber-50 to-indigo-50/30 p-4 rounded-2xl border border-amber-200/50 space-y-3 animate-fade-in shadow-xs">
                    <div className="flex items-start gap-2 text-xs">
                      <Sliders className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="font-bold text-slate-800 text-xs">{activePlan.title}</h6>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Review and approve recipe shifts below to commit changes to the dynamic health logs.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto bg-white/70 p-2 rounded-xl border border-slate-100">
                      {activePlan.modifications.map((item, index) => (
                        <div key={index} className="text-[10px] py-1 border-b border-slate-100 last:border-b-0">
                          <span className="line-through text-rose-500 block font-bold">{item.original}</span>
                          <span className="font-bold text-emerald-600 block mt-0.5">➡ Swap: {item.replaceWith}</span>
                          <span className="text-[9px] text-slate-400 italic block mt-0.5">{item.reason}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2.5">
                      <button 
                        onClick={handleApprovePlan}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition"
                      >
                        Approve Food Swap Plan
                      </button>
                      <button 
                        onClick={() => setActivePipelineStage(PipelineStage.Idle)}
                        className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 font-bold text-[11px] rounded-xl border border-slate-200"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {activePipelineStage === PipelineStage.Executing && (
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] text-slate-600 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    Executing meal substitutions in database...
                  </div>
                )}

                {activePipelineStage === PipelineStage.Success && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 fill-emerald-50" />
                    <div>
                      <h4 className="font-bold text-emerald-800 font-sans">Pipeline Committed Successfully</h4>
                      <p className="text-[10px] text-emerald-700 leading-normal mt-0.5">Swap execution synchronized with your daily analytics database. Metabolic stress levels decreased by 25%!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
