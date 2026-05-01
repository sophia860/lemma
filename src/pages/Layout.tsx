import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FilePlus, Archive, CreditCard, LogOut, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../App";
import { cn } from "../lib/utils";

export default function Layout() {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" },
    { label: "New Report", icon: <FilePlus className="w-5 h-5" />, path: "/reports/new" },
    { label: "Audit Log", icon: <Archive className="w-5 h-5" />, path: "/reports" },
    { label: "Security", icon: <ShieldCheck className="w-5 h-5" />, path: "/security" },
    { label: "Billing", icon: <CreditCard className="w-5 h-5" />, path: "/billing" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0f172a] text-white flex flex-col shadow-xl">
        <div className="p-6">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            Suitability<span className="text-[#60a5fa]">AI</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.85rem] font-medium transition-colors",
                location.pathname === item.path ? "bg-[#1e293b] text-white" : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-[#1e293b]">
          <div className="mb-6">
             <div className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold mb-2">Broker Firm</div>
             <div className="text-xs font-semibold text-white truncate">{profile?.firmName || "Highgate Mortgages"}</div>
             <div className="text-[10px] text-[#64748b] mt-1">FCA: {profile?.fcaRef || "592831"}</div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-[0.8rem] font-medium text-[#64748b] hover:bg-[#1e293b] hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="bg-white border border-slate-200 rounded-lg flex items-center px-3 py-1.5 shadow-sm">
              <Search className="w-3.5 h-3.5 mr-2" />
              <input type="text" placeholder="Search reports..." className="bg-transparent text-[0.8rem] focus:outline-none w-48 text-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[12px] font-bold text-slate-900 leading-none">{profile?.adviserNames?.split(',')[0] || "David Marshall"}</div>
              <div className="text-[10px] text-slate-400 font-medium">Mortgage Broker</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              {profile?.firmName?.[0] || "D"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
