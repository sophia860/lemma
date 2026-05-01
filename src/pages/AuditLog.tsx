import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import { Search, Download, FileText, ChevronRight, Archive, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

export default function AuditLog() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    }

    fetchReports();
  }, [user]);

  const filteredReports = (reports || []).filter(r => 
    (r.client_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.adviser_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">Report Archive</h1>
          <p className="text-sm text-slate-500 font-medium">Compliance history for the last 6 years.</p>
        </div>
        <button className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">
          <Archive className="w-4 h-4" /> Bulk Export
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-7 border-b border-slate-100 flex items-center gap-4 bg-slate-50/30">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Filter by client reference or adviser..." 
            className="flex-1 text-sm focus:outline-none bg-transparent font-medium text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
             <Calendar className="w-4 h-4" /> All Time
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-8 border-b border-slate-100">Client Reference</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-8 border-b border-slate-100">Adviser</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-8 border-b border-slate-100">Generated On</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-8 border-b border-slate-100">Status</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-8 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((r) => (
                <tr key={r.id} className="transition-all hover:bg-slate-50/50 group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-[0.85rem] text-slate-800 group-hover:text-blue-600 transition-colors">{r.client_ref}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Ref: {r.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-500">{r.adviser_name}</td>
                  <td className="px-8 py-6 text-[11px] font-medium text-slate-400 italic">{format(new Date(r.created_at), 'dd MMM yyyy HH:mm')}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg",
                      r.status === 'finalised' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {r.status === 'finalised' ? 'VERIFIED' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                       <button className="hover:text-blue-800 transition-colors flex items-center gap-1.5">
                         <Download className="w-3.5 h-3.5" /> PDF
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-24 text-center text-slate-300 italic text-sm font-medium">
                     No matching records found in the archive.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
