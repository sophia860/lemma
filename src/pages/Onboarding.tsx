import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Building2, FileText, CreditCard, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function Onboarding() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [firmName, setFirmName] = useState("");
  const [fcaRef, setFcaRef] = useState("");
  const [adviserNames, setAdviserNames] = useState("");
  const [houseStyle, setHouseStyle] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("solo");

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const finishOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          firm_name: firmName,
          fca_ref: fcaRef,
          adviser_names: adviserNames,
          house_style_template: houseStyle,
          plan: selectedPlan === "none" ? "solo" : selectedPlan,
          subscription_status: "active",
        })
        .eq('id', user.id);
        
      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Firm Details", icon: <Building2 className="w-5 h-5" /> },
    { title: "House Style", icon: <FileText className="w-5 h-5" /> },
    { title: "Choose Plan", icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex justify-between mb-16 relative px-4">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
          {(steps || []).map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-blue-600 text-white scale-110 shadow-blue-500/20 shadow-lg" : "bg-white border border-slate-200 text-slate-300"
              )}>
                {step > i + 1 ? <Check className="w-5 h-5" /> : s.icon}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", step === i + 1 ? "text-blue-600" : "text-slate-400")}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-200 min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Practice Details</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">Required for compliant report headers and FCA disclosures.</p>
                </div>
                
                <div className="grid gap-6">
                  <OnboardingInput label="Firm Name" value={firmName} onChange={setFirmName} />
                  <OnboardingInput label="FCA Reference" value={fcaRef} onChange={setFcaRef} />
                  <OnboardingInput label="Adviser Names" value={adviserNames} onChange={setAdviserNames} placeholder="Comma separated, e.g. John Doe, Sarah Smith" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">The "House Style"</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">Our AI will learn your firm's specific terminology and tone of voice.</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 px-1">Wording / Template Example</label>
                  <textarea 
                    className="w-full h-48 px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none resize-none text-[13px] font-medium leading-relaxed text-slate-700 transition-all font-mono"
                    placeholder="e.g. 'We have carefully considered your circumstances and recommend the following...'"
                    value={houseStyle} onChange={(e) => setHouseStyle(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Membership</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">Choose a core plan to start generating professional compliance reports.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {["solo", "practice", "network"].map((p) => (
                    <button 
                      key={p}
                      onClick={() => setSelectedPlan(p)}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                        selectedPlan === p ? "border-blue-600 bg-blue-50/50" : "border-slate-100 bg-slate-50/30 hover:border-slate-300"
                      )}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <div className="font-extrabold capitalize text-slate-900 text-lg">{p}</div>
                          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {p === "solo" ? "£79/mo • 40 reports" : p === "practice" ? "£179/mo • Unlimited" : "£399/mo • Unlimited"}
                          </div>
                        </div>
                        {selectedPlan === p && <Check className="w-5 h-5 text-blue-600" />}
                      </div>
                    </button>
                  ))}
                  <button 
                    onClick={() => setSelectedPlan("none")}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                      selectedPlan === "none" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 bg-slate-50/30 hover:border-slate-300"
                    )}
                  >
                    <div className="font-extrabold text-[15px]">Skip for now</div>
                    <div className={cn("text-[11px] font-bold mt-0.5 uppercase tracking-widest text-slate-400")}>Start with Standard Solo Plan</div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-12 flex justify-between items-center border-t border-slate-50">
            {step > 1 ? (
              <button 
                onClick={prevStep}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
              >
                Go Back
              </button>
            ) : <div />}
            
            <div>
              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  disabled={!firmName && step === 1}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={finishOnboarding}
                  disabled={loading}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
      <input 
        className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-700 text-sm"
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
