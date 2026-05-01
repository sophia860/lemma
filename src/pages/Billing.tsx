import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import { CreditCard, ShieldCheck, AlertCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

export default function Billing() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
    { id: "solo", name: "Solo", price: "£79", reports: "40 / mo" },
    { id: "practice", name: "Practice", price: "£179", reports: "Unlimited" },
    { id: "network", name: "Network", price: "£399", reports: "Unlimited" },
  ];

  const handleCancel = async () => {
    if (!profile) return;
    if (!confirm("Are you sure you want to cancel? You will lose access at the end of the billing period.")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: "cancelled" })
        .eq('id', profile.id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 font-sans pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your subscription and usage limits.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Current Plan */}
        <div className="space-y-6">
          <SectionHeader title="Active Subscription" />
          <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm shadow-slate-200/50 relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="text-4xl font-extrabold text-slate-900 capitalize mb-2">{profile?.plan || "Solo"}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Plan Tier</div>
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                profile?.subscription_status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
              )}>
                {profile?.subscription_status || "Active"}
              </div>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <span>Next billing: 15 May 2026</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                Secure billing via PayPal
              </div>
            </div>

            {profile?.subscription_status === 'active' && (
              <button 
                onClick={handleCancel}
                disabled={loading}
                className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                {loading ? "Processing..." : "Cancel Subscription"}
              </button>
            )}
            
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
               <CreditCard className="w-32 h-32 text-slate-900 rotate-12" />
            </div>
          </div>
        </div>

        {/* Change Plan */}
        <div className="space-y-6">
          <SectionHeader title="Available Tiers" />
          <div className="space-y-3">
            {(plans || []).map((p) => (
              <div 
                key={p.id}
                className={cn(
                  "p-6 rounded-2xl border-2 flex items-center justify-between transition-all group",
                  profile?.plan === p.id ? "bg-slate-50 border-blue-600" : "bg-white border-slate-100 hover:border-slate-200"
                )}
              >
                <div>
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    {p.name} {profile?.plan === p.id && <CheckCircle className="w-4 h-4 text-blue-600 shadow-sm" />}
                  </div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{p.reports} reports</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-lg">{p.price}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">/ monthly</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{title}</div>
      <div className="flex-1 h-[2px] bg-slate-50" />
    </div>
  );
}
