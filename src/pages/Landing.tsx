import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, FileText, Shield, Zap } from "lucide-react";
import { cn } from "../lib/utils";

export default function Landing() {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          Suitability<span className="text-blue-600">AI</span>
        </Link>
        <div className="space-x-8 text-sm font-semibold">
          <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
          <Link to="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-8 text-slate-900"
            >
              FCA-compliant <br />
              <span className="text-blue-600">Suitability Reports</span> <br />
              in 60 seconds.
            </motion.h1>
            <p className="text-xl text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
              Automate your UK mortgage recommendations without sacrificing compliance. 
              Drafted by AI, tailored by your firm's house style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                Start 14-day Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold px-4">
                <Shield className="w-4 h-4" /> No credit card required
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="bg-slate-100 aspect-[4/3] rounded-[2.5rem] relative overflow-hidden border border-slate-200 shadow-2xl p-4"
            >
              <div className="bg-white h-full rounded-[2rem] shadow-sm p-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-3 h-3 rounded-full bg-red-400" />
                   <div className="w-3 h-3 rounded-full bg-amber-400" />
                   <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-1/3 bg-slate-100 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                  <div className="h-24 w-full bg-blue-50/50 rounded-xl" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Pricing */}
      <section className="bg-[#0f172a] py-32 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold mb-4">Straightforward Pricing</h2>
            <p className="text-slate-400 font-medium">Choose the plan that fits your practice</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              title="Solo" 
              price="£79" 
              description="Perfect for individual brokers"
              features={["40 Reports / month", "Audit log 6 years", "PDF & Word export", "House-style templates"]}
            />
            <PricingCard 
              title="Practice" 
              price="£179" 
              description="For small teams and boutiques"
              features={["Unlimited Reports", "Up to 5 advisers", "Priority AI generation", "Custom compliance rules"]}
              featured
            />
            <PricingCard 
              title="Network" 
              price="£399" 
              description="Firm-wide suitability control"
              features={["Unlimited Reports", "Unlimited users", "DDA & Bulk export", "Dedicated support"]}
            />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-20 border-b border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-12 opacity-40 font-bold text-slate-500 tracking-widest text-xs">
          <div>MCOB COMPLIANT</div>
          <div>FCA READY</div>
          <div>SECURE CLOUD</div>
          <div>UK BASED</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-12 text-center text-slate-400 text-sm font-medium">
        &copy; 2026 SuitabilityAI. FCA Reference Number required for compliance auditing.
      </footer>
    </div>
  );
}

function PricingCard({ title, price, description, features, featured }: { title: string, price: string, description: string, features: string[], featured?: boolean }) {
  return (
    <div className={cn(
      "p-8 rounded-[2rem] border transition-all duration-300",
      featured ? "bg-white border-blue-600 text-slate-900 scale-105 shadow-2xl shadow-blue-500/10" : "bg-slate-800/50 border-slate-700 hover:border-slate-500"
    )}>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-extrabold">{price}</span>
        <span className="text-slate-500 ml-1">/month</span>
      </div>
      <p className={cn("text-sm mb-8 font-medium", featured ? "text-slate-500" : "text-slate-400")}>{description}</p>
      <ul className="space-y-4 mb-10">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm font-semibold">
            <CheckCircle className={cn("w-4 h-4", featured ? "text-blue-600" : "text-slate-500")} /> {f}
          </li>
        ))}
      </ul>
      <Link 
        to="/signup" 
        className={cn(
          "block text-center py-3.5 rounded-xl font-bold transition-all",
          featured ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-700 text-white hover:bg-slate-600"
        )}
      >
        Choose {title}
      </Link>
    </div>
  );
}
