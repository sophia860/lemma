import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import { Plus, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    }

    fetchReports();

    // Set up real-time listener
    const channel = supabase
      .channel('reports_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">Portfolio Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Hello, {profile?.adviser_names?.split(',')[0] || "Broker"}. You have {profile?.reports_this_month || 0} reports drafted this month.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            Help Center
          </button>
          <Link to="/reports/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Report
          </Link>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hero Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] p-10 text-white relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-xl shadow-blue-500/10">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl font-bold mb-3 text-white">Compliance on Autopilot</h2>
            <p className="text-blue-100/90 text-sm leading-relaxed mb-8">Generate FCA-compliant MCOB 4.7 suitability reports in under 60 seconds using your firm's house style.</p>
            <Link to="/reports/new" className="inline-block bg-white text-blue-600 px-7 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all transform hover:scale-105">
              Generate Report Now
            </Link>
          </div>
          <div className="absolute top-1/2 -right-16 -translate-y-1/2 opacity-10 pointer-events-none scale-125">
             <ShieldCheck className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Monthly Usage Card */}
        <div className="bg-white border border-slate-200 p-8 flex flex-col justify-center rounded-[2rem] shadow-sm">
          <div className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 mb-3">Monthly Usage</div>
          <div className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tighter">
            {profile?.reports_this_month || 0} <span className="text-slate-200">/</span> {profile?.plan === 'practice' || profile?.plan === 'network' ? '∞' : '40'}
          </div>
          <div className="text-[0.8rem] text-slate-500 font-bold mb-8">
            Reports on {profile?.plan || 'Solo'} Plan
          </div>
          <div className="mt-auto">
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-700 ease-out" 
                style={{ width: `${Math.min(((profile?.reports_this_month || 0) / 40) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
               <span>Usage Status</span>
               <span>{profile?.plan === 'practice' || profile?.plan === 'network' ? 'Unlimited' : `${Math.round(((profile?.reports_this_month || 0) / 40) * 100)}%`}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm p-0">
          <div className="p-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">Recent Activity</div>
            <Link to="/reports" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">View All Archive</Link>
          </div>
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-3 px-8 border-b border-slate-100">Client Reference</th>
                  <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-3 px-8 border-b border-slate-100 text-center">Date</th>
                  <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-3 px-8 border-b border-slate-100">Status</th>
                  <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-3 px-8 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center text-slate-300 italic text-sm font-medium">
                      No reports generated yet. Start your first draft!
                    </td>
                  </tr>
                ) : reports.map((r) => (
                  <tr key={r.id} className="transition-all hover:bg-slate-50/50">
                    <td className="px-8 py-5 font-bold text-[0.85rem] text-slate-800">{r.client_ref}</td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-400 text-center tracking-tight italic">{format(new Date(r.created_at), 'MMM dd, yyyy')}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        r.status === 'finalised' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {r.status === 'finalised' ? 'FINAL_PDF' : 'DRAFTING'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 text-blue-600 font-black text-[0.75rem] uppercase tracking-widest">
                        <Link to={`/dashboard`} className="hover:text-blue-800 transition-colors">
                          {r.status === 'finalised' ? 'Download' : 'Open'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Status Card */}
        <div className="bg-white border border-slate-200 p-8 flex flex-col rounded-[2rem] shadow-sm">
          <div className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 mb-3">Billing Status</div>
          <div className="mb-8">
            <p className="text-[1.1rem] font-extrabold text-slate-900 capitalize leading-tight mb-1">{profile?.plan || 'Solo'} Monthly</p>
            <p className="text-[0.75rem] text-slate-400 font-bold uppercase tracking-widest text-emerald-600">Status: {profile?.subscription_status || 'Active'}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8 font-sans">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Active Subscription</div>
            <div className="font-mono text-[0.7rem] text-slate-500 leading-relaxed">
              ID: {profile?.subscription_id || 'I-8L2KW9S1XN'}<br/>
              Amount: {profile?.plan === 'practice' ? '£179.00' : profile?.plan === 'network' ? '£399.00' : '£79.00'} GBP
            </div>
          </div>
          <div className="mt-auto">
            <Link to="/billing" className="block w-full text-center px-4 py-3 border border-slate-200 bg-white rounded-xl text-[0.75rem] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-[0.1em]">
              Manage PayPal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
